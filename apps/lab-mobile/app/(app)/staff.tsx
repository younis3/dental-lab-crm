import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Avatar } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/back-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button, IconButton } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { initials } from '@/lib/format';
import { interpolate, localized } from '@/lib/i18n';
import { ASSIGNABLE_PERMISSIONS, ROLE_LABEL_KEYS, effectivePermissions } from '@/lib/roles';
import { row } from '@/lib/rtl';
import { usePermissions } from '@/store/auth-store';
import { useLanguage } from '@/store/language-store';
import { isOwnerSeat, removeStaffMember, useStaff, type StaffMember } from '@/store/staff-store';

export default function StaffScreen() {
  const router = useRouter();
  const { ui } = useLanguage();
  const { can } = usePermissions();
  const { members } = useStaff();
  const [removing, setRemoving] = useState<StaffMember | null>(null);

  if (!can('manageStaff')) {
    return <Redirect href="/" />;
  }

  return (
    <Screen
      withTabBarInset={false}
      header={
        <ScreenHeader
          title={ui.staffTitle}
          subtitle={interpolate(ui.staffSubtitle, { count: members.length })}
          leading={<BackButton />}
          showMenu={false}
          right={
            <IconButton
              icon="add"
              tone="brand"
              accessibilityLabel={ui.staffAdd}
              onPress={() => router.push('/staff-form')}
            />
          }
        />
      }>
      {members.length === 0 ? (
        <EmptyState icon="people-outline" title={ui.staffEmptyTitle} hint={ui.staffEmptyBody} />
      ) : (
        <View style={styles.list}>
          {members.map((member, index) => (
            <Animated.View
              key={member.id}
              entering={FadeInDown.delay(Math.min(index * 40, 280)).duration(340)}>
              <StaffCard
                member={member}
                onEdit={() => router.push({ pathname: '/staff-form', params: { id: member.id } })}
                onDelete={() => setRemoving(member)}
              />
            </Animated.View>
          ))}
        </View>
      )}

      <DeleteSheet member={removing} onClose={() => setRemoving(null)} />
    </Screen>
  );
}

function StaffCard({
  member,
  onEdit,
  onDelete,
}: {
  member: StaffMember;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const theme = useTheme();
  const { lang, isRtl, ui } = useLanguage();

  const owner = isOwnerSeat(member);
  const granted = effectivePermissions(member.role, member.permissions);
  const grantedCount = ASSIGNABLE_PERMISSIONS.filter((permission) => granted.has(permission)).length;
  const jobTitle = localized(member.title, lang);

  return (
    <PressableScale
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={interpolate(ui.staffMemberAria, { name: member.name })}
      onPress={onEdit}
      style={[
        styles.card,
        { backgroundColor: theme.color.surface, borderColor: theme.color.border },
      ]}>
      <View style={[styles.cardHead, row(isRtl)]}>
        <Avatar initials={initials(member.name)} size={44} colors={[member.color, member.color]} />
        <View style={styles.flex}>
          <Text variant="bodyMedium" numberOfLines={1}>
            {member.name}
          </Text>
          {jobTitle ? (
            <Text variant="caption" tone="faint" numberOfLines={1}>
              {jobTitle}
            </Text>
          ) : null}
          {member.phone ? (
            <Text
              variant="caption"
              tone="muted"
              ltr
              numberOfLines={1}
              style={{ textAlign: isRtl ? 'right' : 'left' }}>
              {member.phone}
            </Text>
          ) : null}
        </View>
        <View style={[styles.colorDot, { backgroundColor: member.color }]} />
      </View>

      <View style={[styles.tags, row(isRtl)]}>
        {owner ? (
          <Badge label={ui.staffOwnerBadge} icon="shield-checkmark-outline" tone="brand" />
        ) : (
          <Badge label={ui[ROLE_LABEL_KEYS[member.role]]} icon="person-outline" />
        )}
        {!member.active ? <Badge label={ui.staffInactiveBadge} tone="warning" icon="pause-outline" /> : null}
        {!owner ? (
          <Badge
            label={interpolate(ui.staffPermissionsCount, {
              count: grantedCount,
              total: ASSIGNABLE_PERMISSIONS.length,
            })}
            tone="neutral"
          />
        ) : null}
      </View>

      <View style={[styles.cardFoot, row(isRtl), { borderTopColor: theme.color.border }]}>
        <Text variant="caption" tone="faint" style={styles.flex} numberOfLines={2}>
          {owner ? ui.staffOwnerProtected : ui.staffFormAccessHint}
        </Text>
        <View style={[styles.actions, row(isRtl)]}>
          <IconButton
            icon="create-outline"
            size={38}
            shape="rounded"
            accessibilityLabel={ui.actionEdit}
            onPress={onEdit}
          />
          {!owner ? (
            <IconButton
              icon="trash-outline"
              size={38}
              shape="rounded"
              accessibilityLabel={ui.actionDelete}
              onPress={onDelete}
            />
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
}

function DeleteSheet({ member, onClose }: { member: StaffMember | null; onClose: () => void }) {
  const { ui } = useLanguage();
  // Keep the last member around while the sheet animates out.
  const [shown, setShown] = useState<StaffMember | null>(member);
  if (member && member !== shown) setShown(member);

  return (
    <BottomSheet
      visible={Boolean(member)}
      onClose={onClose}
      title={ui.staffDeleteTitle}
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
                if (shown) removeStaffMember(shown.id);
                onClose();
              }}
            />
          </View>
        </>
      }>
      <Text variant="body" tone="muted">
        {interpolate(ui.staffDeleteBody, { name: shown?.name ?? '' })}
      </Text>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { gap: spacing.md },
  card: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardHead: { alignItems: 'center', gap: spacing.md },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  tags: { flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs },
  cardFoot: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actions: { alignItems: 'center', gap: spacing.xs },
});
