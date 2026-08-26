import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
  type ListRenderItemInfo,
} from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { LOCALES, interpolate } from '@/lib/i18n';
import { row as rowStyle } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

export const ROW_HEIGHT = 58;
const HEADER_HEIGHT = 42;
const CELL_GAP = spacing.md;

export type TableColumn<T> = {
  key: string;
  title: string;
  /**
   * Space the column wants, in px. Doubles as its flex weight, so columns keep
   * their relative proportions once the row is stretched to the full width.
   */
  minWidth: number;
  /** Columns with the highest priority number are dropped first; 0 never drops. */
  priority: number;
  align?: 'start' | 'end';
  /** Supply to make the column sortable. */
  sortValue?: (item: T) => string | number;
  render: (item: T) => ReactNode;
};

export type SortState = { key: string; direction: 'asc' | 'desc' };

type DataTableProps<T> = {
  columns: TableColumn<T>[];
  /** Already filtered by the screen; a new array reference resets the page. */
  rows: T[];
  keyExtractor: (item: T) => string;
  onRowPress?: (item: T) => void;
  emptyTitle: string;
  emptyHint?: string;
  pageSize?: number;
  /** Horizontal padding the table sits inside, used to size the columns. */
  horizontalInset?: number;
  /** Extra space below the pager, usually the tab bar clearance. */
  bottomInset?: number;
  /** Rendered above the table — search, filter chips, counters. */
  toolbar?: ReactNode;
};

/**
 * Virtualized table that adapts to the viewport instead of scrolling sideways:
 * low-priority columns drop out until the remaining ones fit, which keeps every
 * visible cell readable on a phone and fills the extra room on a tablet.
 */
export function DataTable<T>({
  columns,
  rows,
  keyExtractor,
  onRowPress,
  emptyTitle,
  emptyHint,
  pageSize = 10,
  horizontalInset = spacing.xl * 2,
  bottomInset = 0,
  toolbar,
}: DataTableProps<T>) {
  const theme = useTheme();
  const { lang, isRtl, ui } = useLanguage();
  const { width } = useWindowDimensions();

  const [sort, setSort] = useState<SortState | null>(null);
  const [page, setPage] = useState(0);

  // Resetting during render (rather than in an effect) means the first page is
  // already correct on the frame where the filtered rows change.
  const [rowsSnapshot, setRowsSnapshot] = useState(rows);
  if (rows !== rowsSnapshot) {
    setRowsSnapshot(rows);
    setPage(0);
  }

  const available = Math.max(0, width - horizontalInset);

  const visibleColumns = useMemo(() => {
    const gaps = CELL_GAP * Math.max(0, columns.length - 1);
    let total = columns.reduce((sum, column) => sum + column.minWidth, gaps);
    if (total <= available) return columns;

    const dropOrder = [...columns].sort((a, b) => b.priority - a.priority);
    const dropped = new Set<string>();

    for (const column of dropOrder) {
      if (total <= available || column.priority === 0) continue;
      dropped.add(column.key);
      total -= column.minWidth + CELL_GAP;
    }

    return columns.filter((column) => !dropped.has(column.key));
  }, [available, columns]);

  const sorted = useMemo(() => {
    const column = sort ? columns.find((item) => item.key === sort.key) : undefined;
    const sortValue = column?.sortValue;
    if (!sort || !sortValue) return rows;

    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const left = sortValue(a);
      const right = sortValue(b);
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor;
      return String(left).localeCompare(String(right), LOCALES[lang]) * factor;
    });
  }, [columns, lang, rows, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const firstIndex = safePage * pageSize;

  const pageRows = useMemo(
    () => sorted.slice(firstIndex, firstIndex + pageSize),
    [firstIndex, pageSize, sorted]
  );

  // Turning a page, sorting or searching should land on the first row rather
  // than keeping the previous scroll offset.
  const listRef = useRef<FlatList<T>>(null);
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [firstIndex, sorted]);

  const toggleSort = useCallback((key: string) => {
    setPage(0);
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'asc' };
      return current.direction === 'asc' ? { key, direction: 'desc' } : null;
    });
  }, []);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<T>) => (
      <TableRow
        item={item}
        columns={visibleColumns}
        onPress={onRowPress}
        striped={index % 2 === 1}
      />
    ),
    [onRowPress, visibleColumns]
  );

  const getItemLayout = useCallback(
    (_data: ArrayLike<T> | null | undefined, index: number) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      {toolbar}

      <View
        style={[
          styles.table,
          { backgroundColor: theme.color.surface, borderColor: theme.color.border },
        ]}>
        <View
          style={[
            styles.header,
            rowStyle(isRtl),
            { backgroundColor: theme.color.surfaceMuted, borderBottomColor: theme.color.border },
          ]}>
          {visibleColumns.map((column) => (
            <HeaderCell
              key={column.key}
              column={column}
              sort={sort?.key === column.key ? sort : null}
              onPress={() => toggleSort(column.key)}
            />
          ))}
        </View>

        <FlatList
          ref={listRef}
          data={pageRows}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          initialNumToRender={pageSize}
          maxToRenderPerBatch={pageSize}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={pageRows.length === 0 ? styles.emptyContent : undefined}
          ListEmptyComponent={<EmptyState icon="search-outline" title={emptyTitle} hint={emptyHint} />}
        />
      </View>

      <View style={[styles.pager, rowStyle(isRtl), { paddingBottom: bottomInset }]}>
        <Text variant="caption" tone="muted" style={styles.flex} numberOfLines={1}>
          {sorted.length === 0
            ? ui.tableRangeEmpty
            : interpolate(ui.tableRange, {
                from: firstIndex + 1,
                to: Math.min(firstIndex + pageSize, sorted.length),
                total: sorted.length,
              })}
        </Text>

        <View style={[styles.pagerButtons, rowStyle(isRtl)]}>
          <PagerButton
            icon="chevron-back"
            label={ui.tablePrevious}
            disabled={safePage === 0}
            onPress={() => setPage(safePage - 1)}
          />
          <Text variant="caption" tone="muted" ltr>
            {interpolate(ui.tablePageOf, { page: safePage + 1, total: pageCount })}
          </Text>
          <PagerButton
            icon="chevron-forward"
            label={ui.tableNext}
            disabled={safePage >= pageCount - 1}
            onPress={() => setPage(safePage + 1)}
          />
        </View>
      </View>
    </View>
  );
}

function HeaderCell<T>({
  column,
  sort,
  onPress,
}: {
  column: TableColumn<T>;
  sort: SortState | null;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();
  const sortable = Boolean(column.sortValue);
  const active = Boolean(sort);

  const content = (
    <View style={[styles.headerInner, rowStyle(isRtl)]}>
      <Text
        variant="overline"
        numberOfLines={1}
        color={active ? theme.color.brand : theme.color.textFaint}>
        {column.title}
      </Text>
      {sortable ? (
        <Icon
          name={active ? (sort?.direction === 'asc' ? 'arrow-up' : 'arrow-down') : 'swap-vertical'}
          size={11}
          color={active ? theme.color.brand : theme.color.textFaint}
        />
      ) : null}
    </View>
  );

  if (!sortable) {
    return <View style={[cellFlex(column), alignFor(column.align, isRtl)]}>{content}</View>;
  }

  return (
    <PressableScale
      scaleTo={0.96}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={interpolate(ui.tableSortBy, { column: column.title })}
      style={[cellFlex(column), alignFor(column.align, isRtl)]}>
      {content}
    </PressableScale>
  );
}

type TableRowProps<T> = {
  item: T;
  columns: TableColumn<T>[];
  onPress?: (item: T) => void;
  striped: boolean;
};

function TableRowInner<T>({ item, columns, onPress, striped }: TableRowProps<T>) {
  const theme = useTheme();
  const { isRtl } = useLanguage();

  const body = (
    <View
      style={[
        styles.row,
        rowStyle(isRtl),
        {
          borderBottomColor: theme.color.border,
          backgroundColor: striped ? theme.color.surfaceMuted : 'transparent',
        },
      ]}>
      {columns.map((column) => (
        <View key={column.key} style={[cellFlex(column), alignFor(column.align, isRtl)]}>
          {column.render(item)}
        </View>
      ))}
    </View>
  );

  if (!onPress) return body;

  return (
    <PressableScale scaleTo={0.99} accessibilityRole="button" onPress={() => onPress(item)}>
      {body}
    </PressableScale>
  );
}

const TableRow = memo(TableRowInner) as typeof TableRowInner;

function PagerButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: 'chevron-back' | 'chevron-forward';
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <PressableScale
      scaleTo={0.9}
      hitSlop={8}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[
        styles.pagerButton,
        { backgroundColor: theme.color.surface, borderColor: theme.color.border },
      ]}>
      <Icon
        name={icon}
        size={16}
        color={disabled ? theme.color.textFaint : theme.color.text}
        directional
      />
    </PressableScale>
  );
}

/** Weight cells by their requested width so proportions survive the stretch. */
function cellFlex<T>(column: TableColumn<T>) {
  return { flexGrow: column.minWidth, flexShrink: 1, flexBasis: 0, minWidth: 0 };
}

function alignFor(align: TableColumn<unknown>['align'], isRtl: boolean) {
  if (align !== 'end') return null;
  return { alignItems: isRtl ? ('flex-start' as const) : ('flex-end' as const) };
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.md },
  flex: { flex: 1 },
  table: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    gap: CELL_GAP,
    height: HEADER_HEIGHT,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerInner: { alignItems: 'center', gap: 4 },
  row: {
    alignItems: 'center',
    gap: CELL_GAP,
    height: ROW_HEIGHT,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  emptyContent: { padding: spacing.md },
  pager: { alignItems: 'center', gap: spacing.md },
  pagerButtons: { alignItems: 'center', gap: spacing.sm },
  pagerButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
