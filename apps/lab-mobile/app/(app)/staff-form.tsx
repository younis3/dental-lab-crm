import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { Chip, useToneColors } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { initials } from '@/lib/format';
import { interpolate, localized } from '@/lib/i18n';
import {
  ASSIGNABLE_PERMISSIONS,
  PERMISSION_ICONS,
  PERMISSION_LABEL_KEYS,
  ROLE_HINT_KEYS,
  ROLE_LABEL_KEYS,
  ROLE_PERMISSIONS,
  ROSTER_ROLES,
  effectivePermissions,
  type Permission,
} from '@/lib/roles';
import { row } from '@/lib/rtl';
import { usePermissions } from '@/store/auth-store';
import { useLanguage } from '@/store/language-store';
import {
  STAFF_COLORS,
  createStaffMember,
  isOwnerSeat,
  saveStaffMember,
  staffMember,
  type StaffMember,
  type StaffRole,
} from '@/store/staff-store';

/** The owner seat is structural, so it is never offered as a choice. */
const EDITABLE_ROLES: readonly StaffRole[] = ROSTER_ROLES.filter((role) => role !== 'lab_owner');

export default function StaffFormScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { lang, isRtl, ui } = useLanguage();
  const { can } = usePermissions();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [draft, setDraft] = useState<StaffMember>(() => staffMember(id) ?? createStaffMember());
  // The seeded job titles ship in three languages. Only overwrite them with a
  // plain string once the owner actually edits the field.
  const [titleText, setTitleText] = useState(() => localized(draft.title, lang));
  const [titleEdited, setTitleEdited] = useState(false);
  const [showNameError, setShowNameError] = useState(false);

  const owner = isOwnerSeat(draft);
  const granted = useMemo(
    () => effectivePermissions(draft.role, draft.permissions),
    [draft.permissions, draft.role]
  );

  if (!can('manageStaff')) {
    return <Redirect href="/" />;
  }

  const setRole = (role: StaffRole) => {
    // Overrides are relative to the previous baseline, so they reset with it.
    setDraft((prev) => ({ ...prev, role, permissions: {} }));
  };

  const togglePermission = (permission: Permission, value: boolean) => {
    setDraft((prev) => {
      const baseline = ROLE_PERMISSIONS[prev.role].includes(permission);
      const permissions = { ...prev.permissions };
      if (value === baseline) delete permissions[permission];
      else permissions[permission] = value;
      return { ...prev, permissions };
    });
  };

  const save = () => {
    const name = draft.name.trim();
    if (!name) {
      setShowNameError(true);
      return;
    }
    saveStaffMember({
      ...draft,
      name,
      title: titleEdited ? titleText.trim() : draft.title,
      phone: draft.phone.trim(),
      email: draft.email.trim(),
    });
    router.back();
  };

  return (
    <Screen
      withTabBarInset={false}
      header={
        <ScreenHeader
          title={id ? ui.staffFormEditTitle : ui.staffFormNewTitle}
          subtitle={owner ? ui.staffOwnerProtected : ui[ROLE_LABEL_KEYS[draft.role]]}
          leading={<BackButton />}
          showMenu={false}
        />
      }>
      <View style={[styles.identity, row(isRtl)]}>
        <View style={[styles.avatar, { backgroundColor: draft.color }]}>
          <Text variant="heading" tone="inverse">
            {initials(draft.name || '?')}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text variant="subheading" numberOfLines={1}>
            {draft.name || ui.staffFormName}
          </Text>
          <Text variant="caption" tone="faint" numberOfLines={1}>
            {titleEdited ? titleText : localized(draft.title, lang) || ui.staffFormJobTitle}
          </Text>
        </View>
      </View>

      <View style={styles.group}>
        <Field
          size="sm"
          label={ui.staffFormName}
          value={draft.name}
          onChangeText={(value) => {
            setDraft((prev) => ({ ...prev, name: value }));
            if (showNameError) setShowNameError(false);
          }}
          icon="person-outline"
          placeholder={ui.staffFormNamePlaceholder}
          invalid={showNameError}
        />
        {showNameError ? (
          <Text variant="caption" tone="danger">
            {ui.staffFormNameRequired}
          </Text>
        ) : null}

        <Field
          size="sm"
          label={ui.staffFormJobTitle}
          value={titleEdited ? titleText : localized(draft.title, lang)}
          onChangeText={(value) => {
            setTitleEdited(true);
            setTitleText(value);
          }}
          icon="briefcase-outline"
          placeholder={ui.staffFormJobTitlePlaceholder}
        />

        <Field
          size="sm"
          ltr
          label={ui.staffFormPhone}
          value={draft.phone}
          onChangeText={(value) => setDraft((prev) => ({ ...prev, phone: value }))}
          icon="call-outline"
          placeholder={ui.staffFormPhonePlaceholder}
          keyboardType="phone-pad"
        />

        <Field
          size="sm"
          ltr
          label={ui.staffFormEmail}
          value={draft.email}
          onChangeText={(value) => setDraft((prev) => ({ ...prev, email: value }))}
          icon="mail-outline"
          placeholder={ui.staffFormEmailPlaceholder}
          keyboardType="email-address"
        />
      </View>

      <FormSection title={ui.staffFormRoleTitle} hint={owner ? ui.staffFormRoleLocked : ui.staffFormRoleHint}>
        <View style={[styles.chipRow, row(isRtl)]}>
          {owner ? (
            <Chip label={ui.staffOwnerBadge} selected />
          ) : (
            EDITABLE_ROLES.map((role) => (
              <Chip
                key={role}
                label={ui[ROLE_LABEL_KEYS[role]]}
                selected={draft.role === role}
                onPress={() => setRole(role)}
              />
            ))
          )}
        </View>
        <View style={[styles.roleHint, row(isRtl), { backgroundColor: theme.color.brandSoft }]}>
          <Icon name="information-circle-outline" size={15} color={theme.color.brand} />
          <Text variant="caption" tone="brand" style={styles.flex}>
            {ui[ROLE_HINT_KEYS[draft.role]]}
          </Text>
        </View>
      </FormSection>

      <FormSection title={ui.staffFormAccessTitle} hint={owner ? ui.staffOwnerProtected : ui.staffFormAccessHint}>
        <View style={styles.permissionList}>
          {ASSIGNABLE_PERMISSIONS.map((permission) => (
            <PermissionRow
              key={permission}
              permission={permission}
              enabled={granted.has(permission)}
              disabled={owner}
              onChange={(value) => togglePermission(permission, value)}
            />
          ))}
        </View>
      </FormSection>

      <FormSection title={ui.staffFormStatusTitle} hint={ui.staffFormStatusHint}>
        <View
          style={[
            styles.statusRow,
            row(isRtl),
            { backgroundColor: theme.color.surfaceMuted, borderColor: theme.color.border },
          ]}>
          <Text variant="bodyMedium" style={styles.flex}>
            {draft.active ? ui.statusActive : ui.staffInactiveBadge}
          </Text>
          <Switch
            value={draft.active}
            onValueChange={(value) => setDraft((prev) => ({ ...prev, active: value }))}
            accessibilityLabel={ui.staffFormStatusTitle}
            disabled={owner}
          />
        </View>
      </FormSection>

      <FormSection title={ui.staffFormColorTitle}>
        <View style={[styles.colorRow, row(isRtl)]}>
          {STAFF_COLORS.map((color, index) => (
            <PressableScale
              key={color}
              scaleTo={0.88}
              accessibilityRole="button"
              accessibilityLabel={interpolate(ui.staffFormColorAria, { index: index + 1 })}
              accessibilityState={{ selected: draft.color === color }}
              onPress={() => setDraft((prev) => ({ ...prev, color }))}
              style={[
                styles.swatch,
                {
                  backgroundColor: color,
                  borderColor: draft.color === color ? theme.color.text : 'transparent',
                },
              ]}>
              {draft.color === color ? <Icon name="checkmark" size={16} color="#FFFFFF" /> : null}
            </PressableScale>
          ))}
        </View>
      </FormSection>

      <Button label={ui.actionSave} icon="checkmark" onPress={save} />
    </Screen>
  );
}

function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.group}>
      <View style={styles.sectionHead}>
        <Text variant="overline" tone="faint">
          {title}
        </Text>
        {hint ? (
          <Text variant="caption" tone="muted">
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function PermissionRow({
  permission,
  enabled,
  disabled,
  onChange,
}: {
  permission: Permission;
  enabled: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();
  const { fg, bg } = useToneColors(enabled ? 'brand' : 'neutral');
  const label = ui[PERMISSION_LABEL_KEYS[permission]];

  return (
    <View
      style={[
        styles.permissionRow,
        row(isRtl),
        { backgroundColor: theme.color.surface, borderColor: theme.color.border },
      ]}>
      <View style={[styles.permissionIcon, { backgroundColor: bg }]}>
        <Icon name={PERMISSION_ICONS[permission]} size={16} color={fg} />
      </View>
      <Text variant="body" style={styles.flex} numberOfLines={1}>
        {label}
      </Text>
      <Switch
        value={enabled}
        onValueChange={onChange}
        accessibilityLabel={label}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  identity: { alignItems: 'center', gap: spacing.md },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  group: { gap: spacing.sm },
  sectionHead: { gap: 2, marginBottom: spacing.xs },
  chipRow: { flexWrap: 'wrap', gap: spacing.sm },
  roleHint: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
  },
  permissionList: { gap: spacing.xs },
  permissionRow: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  permissionIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  colorRow: { flexWrap: 'wrap', gap: spacing.sm },
  swatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
