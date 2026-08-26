import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BackButton } from '@/components/ui/back-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconButton } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { useToneColors, withAlpha } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { formatRelative } from '@/lib/format';
import { interpolate, localized } from '@/lib/i18n';
import { row } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';
import {
  NOTIFICATION_META,
  NOTIFICATION_TYPES,
  markAllNotificationsRead,
  markNotificationRead,
  setNotificationTypeEnabled,
  useNotifications,
  type NotificationItem,
  type NotificationType,
} from '@/store/notifications-store';

export default function NotificationsScreen() {
  const { isRtl, ui } = useLanguage();
  const { items, unread } = useNotifications();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <Screen
      withTabBarInset={false}
      header={
        <ScreenHeader
          title={ui.navNotifications}
          subtitle={
            unread > 0 ? interpolate(ui.notificationsUnread, { count: unread }) : ui.notificationsAllRead
          }
          leading={<BackButton />}
          showMenu={false}
          right={
            <View style={[styles.headerActions, row(isRtl)]}>
              {unread > 0 ? (
                <IconButton
                  icon="checkmark-done-outline"
                  accessibilityLabel={ui.notificationsMarkAll}
                  onPress={markAllNotificationsRead}
                />
              ) : null}
              <IconButton
                icon="settings-outline"
                accessibilityLabel={ui.notificationsSettings}
                onPress={() => setSettingsOpen(true)}
              />
            </View>
          }
        />
      }>
      {items.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title={ui.notificationsEmptyTitle}
          hint={ui.notificationsEmptyBody}
        />
      ) : (
        <View style={styles.list}>
          {items.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(Math.min(index * 40, 280)).duration(340)}>
              <NotificationRow item={item} />
            </Animated.View>
          ))}
        </View>
      )}

      <SettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Screen>
  );
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const theme = useTheme();
  const { lang, isRtl, ui } = useLanguage();
  const meta = NOTIFICATION_META[item.type];
  const { fg, bg } = useToneColors(meta.tone);

  return (
    <PressableScale
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={ui[meta.labelKey]}
      onPress={() => markNotificationRead(item.id)}
      style={[
        styles.row,
        row(isRtl),
        {
          backgroundColor: item.read
            ? theme.color.surface
            : withAlpha(fg, theme.scheme === 'dark' ? 0.14 : 0.07),
          borderColor: item.read ? theme.color.border : withAlpha(fg, 0.32),
        },
      ]}>
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <Icon name={meta.icon} size={18} color={fg} />
      </View>

      <View style={styles.flex}>
        <View style={[styles.rowTop, row(isRtl)]}>
          <Text variant="label" numberOfLines={1} style={styles.flex}>
            {ui[meta.labelKey]}
          </Text>
          <Text variant="caption" tone="faint">
            {formatRelative(item.createdAt, ui)}
          </Text>
        </View>
        <Text variant="caption" tone="muted" numberOfLines={2}>
          {localized(item.body, lang)}
        </Text>
        {item.orderId ? (
          <Text variant="caption" tone="faint" numberOfLines={1}>
            {item.orderId}
          </Text>
        ) : null}
      </View>

      {!item.read ? <View style={[styles.unreadDot, { backgroundColor: fg }]} /> : null}
    </PressableScale>
  );
}

function SettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { ui } = useLanguage();
  const { enabledTypes } = useNotifications();

  return (
    <BottomSheet visible={visible} onClose={onClose} title={ui.notificationsSettings}>
      <Text variant="caption" tone="faint">
        {ui.notificationsSettingsHint}
      </Text>
      {NOTIFICATION_TYPES.map((type) => (
        <TypeToggleRow key={type} type={type} enabled={enabledTypes[type]} />
      ))}
    </BottomSheet>
  );
}

function TypeToggleRow({ type, enabled }: { type: NotificationType; enabled: boolean }) {
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();
  const meta = NOTIFICATION_META[type];
  const { fg, bg } = useToneColors(meta.tone);
  const label = ui[meta.labelKey];

  return (
    <View
      style={[
        styles.typeRow,
        row(isRtl),
        { backgroundColor: theme.color.surfaceMuted, borderColor: theme.color.border },
      ]}>
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <Icon name={meta.icon} size={17} color={fg} />
      </View>
      <View style={styles.flex}>
        <Text variant="bodyMedium" numberOfLines={1}>
          {label}
        </Text>
        <Text variant="caption" tone="faint" numberOfLines={1}>
          {ui[meta.hintKey]}
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={(next) => setNotificationTypeEnabled(type, next)}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerActions: { alignItems: 'center', gap: spacing.sm },
  list: { gap: spacing.sm },
  row: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowTop: { alignItems: 'center', gap: spacing.sm },
  typeRow: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
});
