import { Redirect } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_CLEARANCE } from '@/components/navigation/tab-bar';
import { Avatar } from '@/components/ui/avatar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button, IconButton } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { Badge, Chip, withAlpha } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { motion, radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { initials } from '@/lib/format';
import { interpolate } from '@/lib/i18n';
import { row } from '@/lib/rtl';
import { useAuth, usePermissions, type AuthUser } from '@/store/auth-store';
import { useLanguage } from '@/store/language-store';
import { useStaff, type StaffMember } from '@/store/staff-store';
import {
  canManageTask,
  completeTask,
  confirmTask,
  createTask,
  deleteTask,
  moveAmong,
  reopenTask,
  staffIdForUser,
  subtasksOf,
  updateTask,
  useTasks,
  visibleTasks,
  type Task,
  type TaskDraft,
} from '@/store/tasks-store';

type Filter = 'mine' | 'review' | 'all' | 'done';

/** The permission that lets someone see and manage the whole team's board. */
const MANAGE_PERMISSION = 'manageTasks';

/** Head-task row used to map drag distance to a new slot. */
const HEAD_ROW = 108;
/** Subtask row height for the same mapping. */
const SUB_ROW = 56;

export default function TasksScreen() {
  const { isRtl, ui } = useLanguage();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { can } = usePermissions();
  const { tasks } = useTasks();
  const { members } = useStaff();

  const isManager = can(MANAGE_PERMISSION);
  const myStaffId = staffIdForUser(user, members);
  const [filter, setFilter] = useState<Filter>('mine');
  const [sheet, setSheet] = useState<{ mode: 'new'; parent?: Task } | { mode: 'edit'; task: Task } | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [viewing, setViewing] = useState<Task | null>(null);
  const [dragging, setDragging] = useState(false);
  const nativeScroll = useMemo(() => Gesture.Native(), []);

  const visible = useMemo(() => {
    switch (filter) {
      case 'mine':
        return visibleTasks(tasks, (task) => task.assigneeId === myStaffId && task.status === 'open');
      case 'review':
        return visibleTasks(tasks, (task) => task.status === 'pendingReview');
      case 'all':
        return visibleTasks(tasks, (task) => task.status === 'open');
      case 'done':
        return visibleTasks(tasks, (task) => task.status === 'archived');
    }
  }, [filter, tasks, myStaffId]);

  const heads = visible;
  const headIds = useMemo(() => heads.map((task) => task.id), [heads]);
  const headSort = useSortableGroup(headIds.length, HEAD_ROW, spacing.md, headIds.join('|'));

  const counts = useMemo(
    () => ({
      mine: visibleTasks(tasks, (task) => task.assigneeId === myStaffId && task.status === 'open').length,
      review: visibleTasks(tasks, (task) => task.status === 'pendingReview').length,
      all: visibleTasks(tasks, (task) => task.status === 'open').length,
      done: visibleTasks(tasks, (task) => task.status === 'archived').length,
    }),
    [tasks, myStaffId]
  );

  const moveHeads = useCallback(
    (from: number, to: number) => moveAmong(headIds, from, to),
    [headIds]
  );

  if (!user) return <Redirect href="/login" />;

  const filters: { key: Filter; labelKey: keyof typeof ui; count: number }[] = [
    { key: 'mine', labelKey: 'tasksTabMine', count: counts.mine },
    ...(isManager ? [{ key: 'review' as const, labelKey: 'tasksTabReview' as const, count: counts.review }] : []),
    ...(isManager ? [{ key: 'all' as const, labelKey: 'tasksTabAll' as const, count: counts.all }] : []),
    { key: 'done', labelKey: 'tasksTabDone', count: counts.done },
  ];

  const emptyFor: Record<Filter, { icon: string; title: string; hint: string }> = {
    mine: { icon: 'checkbox-outline', title: ui.tasksEmptyMine, hint: ui.tasksEmptyMineHint },
    review: { icon: 'eye-outline', title: ui.tasksEmptyReview, hint: ui.tasksEmptyReviewHint },
    all: { icon: 'list-outline', title: ui.tasksEmptyAll, hint: ui.tasksEmptyAllHint },
    done: { icon: 'archive-outline', title: ui.tasksEmptyDone, hint: ui.tasksEmptyDoneHint },
  };

  return (
    <Screen
      scrollable={false}
      contentStyle={styles.screen}
      header={
        <ScreenHeader
          title={ui.tasksTitle}
          subtitle={ui.tasksSubtitle}
          right={
            <IconButton
              icon="add"
              tone="brand"
              accessibilityLabel={ui.tasksNew}
              onPress={() => setSheet({ mode: 'new' })}
            />
          }
        />
      }>
      <View style={[styles.chipRow, row(isRtl)]}>
        {filters.map((item) => (
          <Chip
            key={item.key}
            label={ui[item.labelKey]}
            count={item.count}
            selected={filter === item.key}
            onPress={() => setFilter(item.key)}
          />
        ))}
      </View>

      {heads.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyStateBox
            icon={emptyFor[filter].icon}
            title={emptyFor[filter].title}
            hint={emptyFor[filter].hint}
          />
        </View>
      ) : (
        <GestureDetector gesture={nativeScroll}>
          <ScrollView
            style={styles.flex}
            scrollEnabled={!dragging}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.list, { paddingBottom: TAB_BAR_CLEARANCE + insets.bottom }]}>
            {heads.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                subtasks={subtasksOf(tasks, task.id)}
                user={user}
                isManager={isManager}
                staff={members}
                index={index}
                sortGroup={headSort}
                scrollGesture={nativeScroll}
                onMove={moveHeads}
                onDragActive={setDragging}
                onEdit={(target) => setSheet({ mode: 'edit', task: target })}
                onDelete={(target) => setDeleting(target)}
                onOpenSubtask={setViewing}
                onAddSubtask={(parent) => setSheet({ mode: 'new', parent })}
              />
            ))}
          </ScrollView>
        </GestureDetector>
      )}

      <TaskFormSheet
        state={sheet}
        user={user}
        staff={members.filter((member) => member.active)}
        onClose={() => setSheet(null)}
      />
      <DeleteTaskSheet task={deleting} onClose={() => setDeleting(null)} />
      <SubtaskDetailSheet
        task={viewing}
        user={user}
        isManager={isManager}
        staff={members}
        onClose={() => setViewing(null)}
        onEdit={(target) => {
          setViewing(null);
          setSheet({ mode: 'edit', task: target });
        }}
      />
    </Screen>
  );
}

function EmptyStateBox({ icon, title, hint }: { icon: string; title: string; hint: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.empty, { backgroundColor: theme.color.surface, borderColor: theme.color.border }]}>
      <Icon name={icon as never} size={26} color={theme.color.textFaint} />
      <Text variant="subheading" style={styles.emptyText}>
        {title}
      </Text>
      <Text variant="caption" tone="muted" style={styles.emptyText}>
        {hint}
      </Text>
    </View>
  );
}

type NativeScrollGesture = ReturnType<typeof Gesture.Native>;

type SortableGroup = {
  activeIndex: SharedValue<number>;
  targetIndex: SharedValue<number>;
  translationY: SharedValue<number>;
  activeHeight: SharedValue<number>;
  heights: SharedValue<number[]>;
  gap: number;
};

function useSortableGroup(
  count: number,
  fallbackRow: number,
  gap: number,
  orderKey: string
): SortableGroup {
  const activeIndex = useSharedValue(-1);
  const targetIndex = useSharedValue(-1);
  const translationY = useSharedValue(0);
  const activeHeight = useSharedValue(fallbackRow);
  const heights = useSharedValue(Array.from({ length: count }, () => fallbackRow));

  useEffect(() => {
    const previous = heights.get();
    heights.set(
      Array.from({ length: count }, (_, index) => previous[index] ?? fallbackRow)
    );
  }, [count, fallbackRow, heights]);

  // Reordering changes the native layout. Clear the preview transforms before
  // that committed layout is painted so no card briefly receives stale drag state.
  useLayoutEffect(() => {
    if (activeIndex.get() < 0) return;
    activeIndex.set(-1);
    targetIndex.set(-1);
    translationY.set(0);
  }, [activeIndex, orderKey, targetIndex, translationY]);

  return useMemo(
    () => ({
      activeIndex,
      targetIndex,
      translationY,
      activeHeight,
      heights,
      gap,
    }),
    [activeHeight, activeIndex, gap, heights, targetIndex, translationY]
  );
}

/** Pan on a handle and animate every sibling around the live drop target. */
function useSortableItem({
  index,
  fallbackRow,
  group,
  scrollGesture,
  onMove,
  onDragActive,
}: {
  index: number;
  fallbackRow: number;
  group: SortableGroup;
  scrollGesture: NativeScrollGesture;
  onMove: (from: number, to: number) => void;
  onDragActive: (active: boolean) => void;
}) {
  const rowH = useSharedValue(fallbackRow);
  const indexSV = useSharedValue(index);
  const siblingOffset = useSharedValue(0);
  indexSV.set(index);

  const finish = useCallback(
    (from: number, to: number) => {
      if (to !== from) {
        onMove(from, to);
      } else {
        group.activeIndex.set(-1);
        group.targetIndex.set(-1);
        group.translationY.set(0);
      }
      onDragActive(false);
    },
    [group, onDragActive, onMove]
  );

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .maxPointers(1)
        .activeOffsetY([-8, 8])
        .failOffsetX([-20, 20])
        .shouldCancelWhenOutside(false)
        .blocksExternalGesture(scrollGesture)
        .onStart(() => {
          const current = indexSV.get();
          group.activeIndex.set(current);
          group.targetIndex.set(current);
          group.activeHeight.set(rowH.get());
          group.translationY.set(0);
          runOnJS(onDragActive)(true);
        })
        .onUpdate((event) => {
          const translation = event.translationY;
          const from = group.activeIndex.get();
          const heights = group.heights.get();
          const activeHeight = group.activeHeight.get();
          let target = from;

          if (translation > 0) {
            let distance = activeHeight / 2 + group.gap;
            for (let next = from + 1; next < heights.length; next += 1) {
              const nextHeight = heights[next] ?? fallbackRow;
              if (translation > distance + nextHeight / 2) target = next;
              distance += nextHeight + group.gap;
            }
          } else if (translation < 0) {
            let distance = activeHeight / 2 + group.gap;
            for (let next = from - 1; next >= 0; next -= 1) {
              const nextHeight = heights[next] ?? fallbackRow;
              if (translation < -(distance + nextHeight / 2)) target = next;
              distance += nextHeight + group.gap;
            }
          }

          group.translationY.set(translation);
          group.targetIndex.set(target);
        })
        .onEnd(() => {
          const from = group.activeIndex.get();
          const to = group.targetIndex.get();
          runOnJS(finish)(from, to);
        })
        .onFinalize((_event, success) => {
          if (!success) {
            group.activeIndex.set(-1);
            group.targetIndex.set(-1);
            group.translationY.set(withSpring(0, motion.springSoft));
            runOnJS(onDragActive)(false);
          }
        }),
    [fallbackRow, finish, group, indexSV, onDragActive, rowH, scrollGesture]
  );

  useAnimatedReaction(
    () => {
      const active = group.activeIndex.get();
      const target = group.targetIndex.get();
      if (active < 0) return null;
      if (target > active && index > active && index <= target) {
        return -(group.activeHeight.get() + group.gap);
      }
      if (target < active && index < active && index >= target) {
        return group.activeHeight.get() + group.gap;
      }
      return 0;
    },
    (next, previous) => {
      // Once the reordered native layout is committed, remove the preview
      // offset immediately. Springing it to zero would apply both positions
      // briefly and make the displaced sibling jump.
      if (next === null) {
        siblingOffset.set(0);
      } else if (next !== previous) {
        siblingOffset.set(withSpring(next, motion.springSoft));
      }
    },
    [group, index]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY:
        group.activeIndex.get() === index ? group.translationY.get() : siblingOffset.get(),
    }],
    zIndex: group.activeIndex.get() === index ? 40 : 0,
    elevation: group.activeIndex.get() === index ? 12 : 0,
    opacity: group.activeIndex.get() === index ? 0.96 : 1,
  }));

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      rowH.set(height);
      const next = [...group.heights.get()];
      next[index] = height;
      group.heights.set(next);
    },
    [group.heights, index, rowH]
  );

  return { gesture, animatedStyle, onLayout };
}

type TaskCardProps = {
  task: Task;
  subtasks: Task[];
  user: AuthUser;
  isManager: boolean;
  staff: StaffMember[];
  index: number;
  sortGroup: SortableGroup;
  scrollGesture: NativeScrollGesture;
  onMove: (from: number, to: number) => void;
  onDragActive: (active: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onOpenSubtask: (task: Task) => void;
  onAddSubtask: (parent: Task) => void;
};

function TaskCard({
  task,
  subtasks,
  user,
  isManager,
  staff,
  index,
  sortGroup,
  scrollGesture,
  onMove,
  onDragActive,
  onEdit,
  onDelete,
  onOpenSubtask,
  onAddSubtask,
}: TaskCardProps) {
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();
  const assignee = staff.find((member) => member.id === task.assigneeId);
  const manage = canManageTask(task, user, isManager);
  const overdue = task.dueDate ? new Date(task.dueDate).getTime() < Date.now() : false;
  const review = task.status === 'pendingReview';
  const done = task.status === 'archived';

  const [expanded, setExpanded] = useState(false);
  const subIds = useMemo(() => subtasks.map((item) => item.id), [subtasks]);
  const moveSubs = useCallback((from: number, to: number) => moveAmong(subIds, from, to), [subIds]);
  const subSort = useSortableGroup(subIds.length, SUB_ROW, 2, subIds.join('|'));

  const { gesture, animatedStyle, onLayout } = useSortableItem({
    index,
    fallbackRow: HEAD_ROW,
    group: sortGroup,
    scrollGesture,
    onMove,
    onDragActive,
  });

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 40, 280)).duration(340)}
      onLayout={onLayout}
      style={[
        styles.card,
        animatedStyle,
        {
          backgroundColor: theme.color.surface,
          borderColor: done ? theme.color.border : overdue && !done ? withAlpha(theme.color.danger, 0.4) : theme.color.border,
        },
      ]}>
      <View style={[styles.cardHead, row(isRtl)]}>
        <DragHandle gesture={gesture} label={ui.tasksDragHandle} />
        <PressableScale
          scaleTo={0.99}
          accessibilityRole="button"
          accessibilityLabel={interpolate(ui.tasksMyTaskAria, {
            title: task.title,
            assignee: assignee?.name ?? '',
          })}
          onPress={() => setExpanded((prev) => !prev)}
          style={[styles.cardBody, row(isRtl)]}>
          <TaskCheckbox task={task} isManager={isManager} user={user} />
          <View style={styles.flex}>
            <Text
              variant="label"
              numberOfLines={1}
              style={done ? { textDecorationLine: 'line-through', opacity: 0.6 } : undefined}>
              {task.title}
            </Text>
            <View style={[styles.metaRow, row(isRtl)]}>
              {assignee ? (
                <View style={[styles.assignee, row(isRtl)]}>
                  <Avatar initials={initials(assignee.name)} size={18} colors={[assignee.color, assignee.color]} />
                  <Text variant="caption" tone="muted" numberOfLines={1}>
                    {assignee.name}
                  </Text>
                </View>
              ) : null}
              {task.dueDate ? (
                <View style={[styles.assignee, row(isRtl)]}>
                  <Icon
                    name="calendar-outline"
                    size={12}
                    color={overdue && !done ? theme.color.danger : theme.color.textFaint}
                  />
                  <Text
                    variant="caption"
                    tone={overdue && !done ? 'danger' : 'faint'}
                    ltr
                    numberOfLines={1}>
                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={[styles.headActions, row(isRtl)]}>
            {review ? <Badge label={ui.tasksTabReview} tone="warning" icon="time-outline" /> : null}
            {done ? <Badge label={ui.tasksTabDone} tone="success" icon="checkmark" /> : null}
            {subtasks.length > 0 ? (
              <View
                accessibilityLabel={interpolate(ui.tasksSubtaskCount, { count: subtasks.length })}
                style={[styles.subtaskCount, row(isRtl), { backgroundColor: theme.color.brandSoft }]}>
                <Icon name="git-branch-outline" size={12} color={theme.color.brand} />
                <Text variant="caption" color={theme.color.brand} ltr>
                  {subtasks.length}
                </Text>
              </View>
            ) : null}
            {subtasks.length > 0 ? (
              <Icon
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={theme.color.textFaint}
              />
            ) : null}
          </View>
        </PressableScale>
      </View>

      <View style={styles.cardRest}>
        {expanded && task.notes ? (
          <Text variant="caption" tone="muted" numberOfLines={3} style={styles.notes}>
            {task.notes}
          </Text>
        ) : null}

        {expanded && !done && !review ? (
          <View style={[styles.actions, row(isRtl)]}>
            {manage ? (
              <>
                <IconButton
                  icon="create-outline"
                  size={36}
                  shape="rounded"
                  accessibilityLabel={ui.actionEdit}
                  onPress={() => onEdit(task)}
                />
                <IconButton
                  icon="trash-outline"
                  size={36}
                  shape="rounded"
                  accessibilityLabel={ui.actionDelete}
                  onPress={() => onDelete(task)}
                />
              </>
            ) : null}
            <IconButton
              icon="add"
              size={36}
              shape="rounded"
              accessibilityLabel={ui.tasksAddSubtask}
              onPress={() => onAddSubtask(task)}
            />
          </View>
        ) : null}

        {expanded && review && isManager ? (
          <View style={[styles.actions, row(isRtl)]}>
            <IconButton
              icon="checkmark"
              size={36}
              shape="rounded"
              tone="brand"
              accessibilityLabel={ui.tasksConfirm}
              onPress={() => confirmTask(task.id)}
            />
            <IconButton
              icon="arrow-undo-outline"
              size={36}
              shape="rounded"
              accessibilityLabel={ui.tasksReopen}
              onPress={() => reopenTask(task.id)}
            />
          </View>
        ) : null}

        {expanded && done ? (
          <View style={[styles.actions, row(isRtl)]}>
            <IconButton
              icon="arrow-undo-outline"
              size={36}
              shape="rounded"
              accessibilityLabel={ui.tasksUndo}
              onPress={() => reopenTask(task.id)}
            />
            {manage ? (
              <IconButton
                icon="trash-outline"
                size={36}
                shape="rounded"
                accessibilityLabel={ui.actionDelete}
                onPress={() => onDelete(task)}
              />
            ) : null}
          </View>
        ) : null}
      </View>

      {expanded && subtasks.length > 0 ? (
        <View
          style={[
            styles.subtaskList,
            {
              backgroundColor: theme.color.surfaceMuted,
              borderStartColor: theme.color.brand,
            },
          ]}>
          <View style={[styles.subtaskSectionHeader, row(isRtl)]}>
            <Icon name="git-branch-outline" size={14} color={theme.color.brand} />
            <Text variant="caption" color={theme.color.brand}>
              {interpolate(ui.tasksSubtaskCount, { count: subtasks.length })}
            </Text>
          </View>
          {subtasks.map((sub, subIndex) => (
            <SubtaskRow
              key={sub.id}
              task={sub}
              user={user}
              isManager={isManager}
              staff={staff}
              index={subIndex}
              sortGroup={subSort}
              scrollGesture={scrollGesture}
              onMove={moveSubs}
              onDragActive={onDragActive}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpen={onOpenSubtask}
            />
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
}

function DragHandle({
  gesture,
  label,
  compact,
}: {
  gesture: ReturnType<typeof Gesture.Pan>;
  label: string;
  compact?: boolean;
}) {
  const theme = useTheme();

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        collapsable={false}
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        style={compact ? styles.dragHandleCompact : styles.dragHandle}>
        <Icon name="menu-outline" size={compact ? 18 : 22} color={theme.color.textFaint} />
      </Animated.View>
    </GestureDetector>
  );
}

function TaskCheckbox({
  task,
  isManager,
  user,
  compact,
}: {
  task: Task;
  isManager: boolean;
  user: AuthUser;
  compact?: boolean;
}) {
  const theme = useTheme();
  const { ui } = useLanguage();
  const done = task.status !== 'open';

  return (
    <PressableScale
      scaleTo={0.85}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={done ? ui.tasksReopen : ui.tasksMarkDone}
      onPress={() => {
        if (task.status === 'open') completeTask(task.id, isManager);
        else reopenTask(task.id);
      }}
      hitSlop={8}
      style={[
        compact ? styles.checkboxCompact : styles.checkbox,
        {
          borderColor: done ? theme.color.success : theme.color.borderStrong,
          backgroundColor: done ? theme.color.success : 'transparent',
        },
      ]}>
      {done ? <Icon name="checkmark" size={compact ? 12 : 14} color={theme.color.onBrand} /> : null}
    </PressableScale>
  );
}

function SubtaskRow({
  task,
  user,
  isManager,
  staff,
  index,
  sortGroup,
  scrollGesture,
  onMove,
  onDragActive,
  onEdit,
  onDelete,
  onOpen,
}: {
  task: Task;
  user: AuthUser;
  isManager: boolean;
  staff: StaffMember[];
  index: number;
  sortGroup: SortableGroup;
  scrollGesture: NativeScrollGesture;
  onMove: (from: number, to: number) => void;
  onDragActive: (active: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onOpen: (task: Task) => void;
}) {
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();
  const assignee = staff.find((member) => member.id === task.assigneeId);
  const manage = canManageTask(task, user, isManager);
  const done = task.status !== 'open';

  const { gesture, animatedStyle, onLayout } = useSortableItem({
    index,
    fallbackRow: SUB_ROW,
    group: sortGroup,
    scrollGesture,
    onMove,
    onDragActive,
  });

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.subtask,
        row(isRtl),
        animatedStyle,
        { borderTopColor: theme.color.border },
      ]}>
      <DragHandle gesture={gesture} label={ui.tasksDragHandle} compact />
      <TaskCheckbox task={task} isManager={isManager} user={user} compact />
      <PressableScale
        scaleTo={0.99}
        accessibilityRole="button"
        accessibilityLabel={interpolate(ui.tasksOpenSubtaskAria, { title: task.title })}
        onPress={() => onOpen(task)}
        style={styles.flex}>
        <Text
          variant="bodyMedium"
          numberOfLines={1}
          style={done ? { textDecorationLine: 'line-through', opacity: 0.6 } : undefined}>
          {task.title}
        </Text>
        {assignee ? (
          <Text variant="caption" tone="faint" numberOfLines={1}>
            {assignee.name}
          </Text>
        ) : null}
      </PressableScale>
      {manage ? (
        <View style={[styles.headActions, row(isRtl)]}>
          <IconButton
            icon="create-outline"
            size={32}
            shape="rounded"
            accessibilityLabel={ui.actionEdit}
            onPress={() => onEdit(task)}
          />
          <IconButton
            icon="trash-outline"
            size={32}
            shape="rounded"
            accessibilityLabel={ui.actionDelete}
            onPress={() => onDelete(task)}
          />
        </View>
      ) : null}
    </Animated.View>
  );
}

type FormState = { mode: 'new'; parent?: Task } | { mode: 'edit'; task: Task } | null;

function TaskFormSheet({
  state,
  user,
  staff,
  onClose,
}: {
  state: FormState;
  user: AuthUser;
  staff: StaffMember[];
  onClose: () => void;
}) {
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();

  // Keep the previous sheet's fields alive while it animates out.
  const [shown, setShown] = useState<FormState>(state);
  if (state && state !== shown) setShown(state);

  const editing = shown?.mode === 'edit' ? shown.task : null;
  const parent = shown?.mode === 'new' ? shown.parent : null;

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [assigneeId, setAssigneeId] = useState('');
  const [showError, setShowError] = useState(false);

  // Reset the form whenever a new sheet opens.
  const [openKey, setOpenKey] = useState<string | null>(null);
  const currentKey = shown ? `${shown.mode}:${editing?.id ?? parent?.id ?? 'new'}` : null;
  if (currentKey !== openKey) {
    setOpenKey(currentKey);
    if (shown) {
      setTitle(editing?.title ?? '');
      setNotes(editing?.notes ?? '');
      setDueDate(editing?.dueDate ?? null);
      setAssigneeId(editing?.assigneeId ?? staffIdForUser(user, staff) ?? staff[0]?.id ?? '');
      setShowError(false);
    }
  }

  const dueOptions: { key: string; label: string; value: string | null }[] = useMemo(() => {
    const day = (offset: number) => {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      date.setHours(17, 0, 0, 0);
      return date.toISOString();
    };
    return [
      { key: 'none', label: ui.tasksFormDueNone, value: null },
      { key: 'today', label: ui.tasksFormDueToday, value: day(0) },
      { key: 'tomorrow', label: ui.tasksFormDueTomorrow, value: day(1) },
      { key: 'nextWeek', label: ui.tasksFormDueNextWeek, value: day(7) },
    ];
  }, [ui]);

  const save = () => {
    if (!title.trim()) {
      setShowError(true);
      return;
    }
    const draft: TaskDraft = {
      title,
      notes,
      dueDate,
      assigneeId: assigneeId || staff[0]?.id || '',
      parentId: editing ? editing.parentId : (parent?.id ?? null),
    };
    if (editing) updateTask(editing.id, draft);
    else createTask(draft, user);
    onClose();
  };

  // Only head tasks can be parents; subtasks can never be assigned as a parent.

  return (
    <BottomSheet
      visible={Boolean(state)}
      onClose={onClose}
      title={editing ? ui.tasksEditTask : parent ? ui.tasksNewSubtask : ui.tasksNewTask}
      footer={
        <View style={styles.flex}>
          <Button label={ui.actionSave} icon="checkmark" onPress={save} />
        </View>
      }>
      <Field
        size="sm"
        label={ui.tasksFormTitle}
        value={title}
        onChangeText={(value) => {
          setTitle(value);
          if (showError) setShowError(false);
        }}
        icon="create-outline"
        placeholder={ui.tasksFormTitlePlaceholder}
        invalid={showError}
      />
      {showError ? (
        <Text variant="caption" tone="danger">
          {ui.tasksTitleRequired}
        </Text>
      ) : null}

      <View style={styles.fieldGroup}>
        <Text variant="caption" tone="muted">
          {ui.tasksFormNotes}
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder={ui.tasksFormNotesPlaceholder}
          placeholderTextColor={theme.color.textFaint}
          multiline
          numberOfLines={3}
          style={[
            styles.notesInput,
            {
              color: theme.color.text,
              backgroundColor: theme.color.surfaceMuted,
              borderColor: theme.color.border,
              textAlign: isRtl ? 'right' : 'left',
            },
          ]}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text variant="caption" tone="muted">
          {ui.tasksFormDueDate}
        </Text>
        <View style={[styles.chipRow, row(isRtl)]}>
          {dueOptions.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              selected={dueDate === option.value}
              onPress={() => setDueDate(option.value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text variant="caption" tone="muted">
          {ui.tasksFormAssignee}
        </Text>
        <View style={styles.assigneeList}>
          {staff.map((member) => {
            const selected = assigneeId === member.id;
            return (
              <PressableScale
                key={member.id}
                scaleTo={0.98}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={member.name}
                onPress={() => setAssigneeId(member.id)}
                style={[
                  styles.assigneeRow,
                  row(isRtl),
                  {
                    backgroundColor: selected ? theme.color.brandSoft : theme.color.surfaceMuted,
                    borderColor: selected ? theme.color.brand : theme.color.border,
                  },
                ]}>
                <Avatar initials={initials(member.name)} size={32} colors={[member.color, member.color]} />
                <Text variant="bodyMedium" style={styles.flex} numberOfLines={1}>
                  {member.name}
                </Text>
                {selected ? <Icon name="checkmark-circle" size={18} color={theme.color.brand} /> : null}
              </PressableScale>
            );
          })}
        </View>
      </View>
    </BottomSheet>
  );
}

function DeleteTaskSheet({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { ui } = useLanguage();
  const [shown, setShown] = useState<Task | null>(task);
  if (task && task !== shown) setShown(task);

  return (
    <BottomSheet
      visible={Boolean(task)}
      onClose={onClose}
      title={ui.tasksDeleteTitle}
      footer={
        <>
          <View style={styles.flex}>
            <Button size="md" variant="secondary" label={ui.actionCancel} onPress={onClose} />
          </View>
          <View style={styles.flex}>
            <Button
              size="md"
              variant="danger"
              label={ui.actionDelete}
              icon="trash-outline"
              onPress={() => {
                if (shown) deleteTask(shown.id);
                onClose();
              }}
            />
          </View>
        </>
      }>
      <Text variant="body" tone="muted">
        {interpolate(ui.tasksDeleteBody, { title: shown?.title ?? '' })}
      </Text>
    </BottomSheet>
  );
}

function SubtaskDetailSheet({
  task,
  user,
  isManager,
  staff,
  onClose,
  onEdit,
}: {
  task: Task | null;
  user: AuthUser;
  isManager: boolean;
  staff: StaffMember[];
  onClose: () => void;
  onEdit: (task: Task) => void;
}) {
  const { isRtl, ui } = useLanguage();
  const [shown, setShown] = useState<Task | null>(task);
  if (task && task !== shown) setShown(task);

  const assignee = staff.find((member) => member.id === shown?.assigneeId);
  const manage = shown ? canManageTask(shown, user, isManager) : false;
  const notes = shown?.notes.trim() ?? '';
  const dueLabel = shown?.dueDate
    ? new Date(shown.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    : ui.tasksFormDueNone;

  return (
    <BottomSheet
      visible={Boolean(task)}
      onClose={onClose}
      title={ui.tasksSubtaskDetail}
      footer={
        manage ? (
          <View style={styles.flex}>
            <Button
              label={ui.actionEdit}
              icon="create-outline"
              onPress={() => {
                if (shown) onEdit(shown);
              }}
            />
          </View>
        ) : undefined
      }>
      <Text variant="subheading">{shown?.title}</Text>
      {assignee ? (
        <View style={[styles.detailMeta, row(isRtl)]}>
          <Avatar initials={initials(assignee.name)} size={28} colors={[assignee.color, assignee.color]} />
          <View style={styles.flex}>
            <Text variant="caption" tone="muted">
              {ui.tasksFormAssignee}
            </Text>
            <Text variant="bodyMedium" numberOfLines={1}>
              {assignee.name}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.fieldGroup}>
        <Text variant="caption" tone="muted">
          {ui.tasksFormDueDate}
        </Text>
        <Text variant="bodyMedium" ltr={Boolean(shown?.dueDate)}>
          {dueLabel}
        </Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text variant="caption" tone="muted">
          {ui.tasksFormNotes}
        </Text>
        <Text variant="body" tone={notes ? 'default' : 'muted'} style={styles.detailNotes}>
          {notes || ui.tasksNoNotes}
        </Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  chipRow: { flexWrap: 'wrap', gap: spacing.sm },
  list: { gap: spacing.md, overflow: 'visible' },
  emptyWrap: { paddingTop: spacing['3xl'] },
  empty: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyText: { textAlign: 'center' },
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardBody: { flex: 1, alignItems: 'flex-start', paddingVertical: spacing.md, paddingEnd: spacing.md, gap: spacing.sm },
  cardHead: { alignItems: 'center' },
  cardRest: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxCompact: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: { flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, marginTop: 4 },
  assignee: { flexShrink: 1, alignItems: 'center', gap: 5 },
  headActions: { flexShrink: 0, alignItems: 'center', gap: spacing.xs },
  subtaskCount: {
    flexShrink: 0,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  notes: { marginTop: 2 },
  actions: { gap: spacing.xs, marginTop: spacing.xs },
  subtaskList: {
    marginStart: spacing.xl,
    marginEnd: spacing.md,
    marginBottom: spacing.md,
    borderStartWidth: 3,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
  subtaskSectionHeader: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  subtask: {
    minHeight: SUB_ROW,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  fieldGroup: { gap: spacing.xs },
  detailMeta: { alignItems: 'center', gap: spacing.md },
  detailNotes: { lineHeight: 22 },
  notesInput: {
    minHeight: 80,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
  },
  assigneeList: { gap: spacing.xs },
  assigneeRow: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dragHandle: {
    width: 40,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandleCompact: {
    width: 32,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
