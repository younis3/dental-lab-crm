import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NavIcon, type NavIconName } from '@/components/ui/icon';
import { withAlpha } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import type { UiStrings } from '@/lib/i18n';
import { ROLE_TABS, TAB_PERMISSIONS, resolveNav } from '@/lib/roles';
import { row } from '@/lib/rtl';
import { usePermissions } from '@/store/auth-store';
import { useLanguage } from '@/store/language-store';

export const TAB_BAR_HEIGHT = 62;
/** Clearance screens should leave at the bottom of scroll content. */
export const TAB_BAR_CLEARANCE = TAB_BAR_HEIGHT + 28;

/** Softly rounded top corners on the sticky bar. */
const BAR_RADIUS = 26;

type TabMeta = { active: NavIconName; inactive: NavIconName; labelKey: keyof UiStrings };

const TAB_META: Record<string, TabMeta> = {
  index: { active: 'grid', inactive: 'grid-outline', labelKey: 'navHome' },
  orders: { active: 'layers', inactive: 'layers-outline', labelKey: 'navOrders' },
  tasks: { active: 'todo', inactive: 'todo', labelKey: 'navTasks' },
  inbox: { active: 'chatbubbles', inactive: 'chatbubbles-outline', labelKey: 'navInbox' },
  folders: { active: 'folder-open', inactive: 'folder-outline', labelKey: 'navFiles' },
};

const FALLBACK_META: TabMeta = { active: 'ellipse', inactive: 'ellipse-outline', labelKey: 'navHome' };

/**
 * Sticky bottom bar. Which tabs appear — and what they are called — comes from
 * the signed-in role, so a courier and a lab owner get different bars from the
 * same navigator.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isRtl, ui } = useLanguage();
  const { role, can } = usePermissions();

  const tabs = useMemo(() => {
    // A session persisted by an older build can carry a role that no longer
    // exists, and an unknown key here would throw mid-render.
    const activeRole = role && ROLE_TABS[role] ? role : 'lab_owner';
    const byName = new Map(state.routes.map((route, index) => [route.name, { route, index }]));

    return ROLE_TABS[activeRole].flatMap((name) => {
      const entry = byName.get(name);
      const meta = TAB_META[name] ?? FALLBACK_META;
      const permission = TAB_PERMISSIONS[name];
      if (!entry || !permission) return [];

      const nav = resolveNav(activeRole, name, { permission, labelKey: meta.labelKey });
      if (!can(nav.permission)) return [];

      return [{ ...entry, meta, labelKey: nav.labelKey }];
    });
  }, [can, role, state.routes]);

  // Single return: an early exit here would change this component's hook list
  // between renders, which React reports as a hook-count mismatch.
  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      {tabs.length > 0 ? (
        <View style={[styles.bar, { borderColor: theme.color.border }]}>
          <BlurView
            intensity={Platform.OS === 'android' ? 70 : 44}
            tint={theme.blurTint}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: withAlpha(
                  theme.color.surface,
                  theme.scheme === 'dark' ? 0.78 : 0.9
                ),
              },
            ]}
          />

          <View style={[styles.row, row(isRtl), { paddingBottom: insets.bottom }]}>
            {tabs.map(({ route, index, meta, labelKey }) => {
              const focused = state.index === index;

              return (
                <TabItem
                  key={route.key}
                  icon={focused ? meta.active : meta.inactive}
                  label={ui[labelKey]}
                  focused={focused}
                  onPress={() => {
                    const event = navigation.emit({
                      type: 'tabPress',
                      target: route.key,
                      canPreventDefault: true,
                    });
                    if (!focused && !event.defaultPrevented) {
                      navigation.navigate(route.name, route.params);
                    }
                  }}
                />
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

type TabItemProps = {
  icon: NavIconName;
  label: string;
  focused: boolean;
  onPress: () => void;
};

function TabItem({ icon, label, focused, onPress }: TabItemProps) {
  const theme = useTheme();
  const color = focused ? theme.color.brand : theme.color.textMuted;

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.9}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      style={styles.tab}>
      <NavIcon name={icon} size={22} color={color} />
      <Text variant="caption" color={color} numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  bar: {
    borderTopLeftRadius: BAR_RADIUS,
    borderTopRightRadius: BAR_RADIUS,
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: { alignItems: 'stretch' },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: TAB_BAR_HEIGHT,
  },
  label: { fontSize: 11, lineHeight: 14, textAlign: 'center' },
});
