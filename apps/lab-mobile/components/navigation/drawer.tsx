import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter, type Href } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoMark } from '@/components/brand/logo-mark';
import { Avatar } from '@/components/ui/avatar';
import { Icon, type IconName } from '@/components/ui/icon';
import { LanguageSwitch } from '@/components/ui/language-switch';
import { Badge, withAlpha } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { elevation, motion, radius, spacing } from '@/constants/design';
import { ThemeOverride, useTheme } from '@/hooks/use-theme';
import type { UiStrings } from '@/lib/i18n';
import { MESSAGES } from '@/lib/mock-data';
import { ROLE_LABEL_KEYS, resolveNav, type Permission } from '@/lib/roles';
import { alignStart, row } from '@/lib/rtl';
import { logout, useAuth, usePermissions } from '@/store/auth-store';
import { useLanguage } from '@/store/language-store';
import { useNotifications } from '@/store/notifications-store';
import { setThemeMode, useThemeMode, type ThemeMode } from '@/store/theme-store';

type DrawerContextValue = { open: () => void; close: () => void; isOpen: boolean };

const DrawerContext = createContext<DrawerContextValue>({
  open: () => {},
  close: () => {},
  isOpen: false,
});

export const useDrawer = () => useContext(DrawerContext);

type NavItem = {
  key: string;
  labelKey: keyof UiStrings;
  icon: IconName;
  route?: Href;
  match?: string;
  /** Hidden unless the signed-in user holds this permission. */
  permission?: Permission;
  /** Live counter resolved at render time. */
  badgeSource?: 'inbox' | 'notifications';
  soon?: boolean;
};

type NavGroup = { key: string; titleKey: keyof UiStrings; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    key: 'workspace',
    titleKey: 'drawerWorkspace',
    items: [
      {
        key: 'dashboard',
        labelKey: 'navDashboard',
        icon: 'grid-outline',
        route: '/',
        match: '/',
        permission: 'viewDashboard',
      },
      {
        key: 'orders',
        labelKey: 'navOrders',
        icon: 'layers-outline',
        route: '/orders',
        match: '/orders',
        permission: 'viewOrders',
      },
      {
        key: 'inbox',
        labelKey: 'navInbox',
        icon: 'chatbubbles-outline',
        route: '/inbox',
        match: '/inbox',
        permission: 'viewInbox',
        badgeSource: 'inbox',
      },
      {
        key: 'folders',
        labelKey: 'navFiles',
        icon: 'folder-open-outline',
        route: '/folders',
        match: '/folders',
        permission: 'viewFiles',
      },
      {
        key: 'notifications',
        labelKey: 'navNotifications',
        icon: 'notifications-outline',
        route: '/notifications',
        match: '/notifications',
        badgeSource: 'notifications',
      },
      {
        key: 'exocad',
        labelKey: 'navExocad',
        icon: 'cube-outline',
        route: '/demo-exocad',
        match: '/demo-exocad',
        permission: 'viewExocad',
      },
    ],
  },
  {
    key: 'directory',
    titleKey: 'drawerDirectory',
    items: [
      {
        key: 'doctors',
        labelKey: 'navDoctors',
        icon: 'medkit-outline',
        route: '/doctors',
        match: '/doctors',
        permission: 'viewDoctors',
      },
      {
        key: 'clinics',
        labelKey: 'navClinics',
        icon: 'business-outline',
        route: '/clinics',
        match: '/clinics',
        permission: 'viewClinics',
      },
      {
        key: 'patients',
        labelKey: 'navPatients',
        icon: 'people-outline',
        route: '/patients',
        match: '/patients',
        permission: 'viewPatients',
      },
    ],
  },
  {
    key: 'manage',
    titleKey: 'drawerManage',
    items: [
      {
        key: 'staff',
        labelKey: 'navTeam',
        icon: 'shield-checkmark-outline',
        route: '/staff',
        match: '/staff',
        permission: 'manageStaff',
      },
    ],
  },
  {
    key: 'soon',
    titleKey: 'drawerComingSoon',
    items: [
      { key: 'analytics', labelKey: 'navAnalytics', icon: 'stats-chart-outline', soon: true },
      { key: 'financials', labelKey: 'navFinancials', icon: 'wallet-outline', soon: true },
      { key: 'courier', labelKey: 'navCourier', icon: 'car-outline', soon: true },
    ],
  },
];

/** Slots 0 and 1 belong to the brand row and the profile card. */
const FIRST_GROUP_SLOT = 2;

const THEME_OPTIONS: { key: ThemeMode; icon: IconName; labelKey: keyof UiStrings }[] = [
  { key: 'system', icon: 'phone-portrait-outline', labelKey: 'themeAuto' },
  { key: 'light', icon: 'sunny-outline', labelKey: 'themeLight' },
  { key: 'dark', icon: 'moon-outline', labelKey: 'themeDark' },
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Shows behind the scaled-down content while the drawer is open. */
const DRAWER_VOID = '#1B2836';

/**
 * Hosts the app content and an overlay sidebar. The panel lives on the leading
 * edge, so it slides in from the right whenever the layout is right-to-left.
 */
export function DrawerHost({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(278, width * 0.72);
  /** +1 slides the content right (LTR), -1 slides it left (RTL). */
  const dir = isRtl ? -1 : 1;

  const progress = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    progress.set(withSpring(1, motion.springSoft));
  }, [progress]);

  const close = useCallback(() => {
    setIsOpen(false);
    progress.set(withSpring(0, motion.springSoft));
  }, [progress]);

  const settle = useCallback(
    (shouldOpen: boolean) => {
      setIsOpen(shouldOpen);
      progress.set(withSpring(shouldOpen ? 1 : 0, motion.springSoft));
    },
    [progress]
  );

  const closeGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-14, 14])
        .onBegin(() => {
          dragStart.set(progress.get());
        })
        .onUpdate((event) => {
          progress.set(clamp(dragStart.get() + (event.translationX * dir) / panelWidth, 0, 1));
        })
        .onEnd((event) => {
          const velocity = event.velocityX * dir;
          const shouldOpen = velocity > 350 || (velocity > -350 && progress.get() > 0.55);
          runOnJS(settle)(shouldOpen);
        }),
    [dir, dragStart, panelWidth, progress, settle]
  );

  const edgeGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX(isRtl ? -12 : 12)
        .failOffsetY([-18, 18])
        // onStart (not onBegin) so a plain tap on the edge never arms the overlay.
        .onStart(() => {
          runOnJS(setIsOpen)(true);
        })
        .onUpdate((event) => {
          progress.set(clamp((event.translationX * dir) / panelWidth, 0, 1));
        })
        .onEnd((event) => {
          const shouldOpen = event.velocityX * dir > 350 || progress.get() > 0.42;
          runOnJS(settle)(shouldOpen);
        }),
    [dir, isRtl, panelWidth, progress, settle]
  );

  const contentStyle = useAnimatedStyle(() => {
    const value = progress.get();
    return {
      transform: [
        { perspective: 1200 },
        { translateX: interpolate(value, [0, 1], [0, panelWidth * 0.72 * dir]) },
        { scale: interpolate(value, [0, 1], [1, 0.88]) },
      ],
      borderRadius: interpolate(value, [0, 1], [0, radius['2xl']]),
    };
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  const panelStyle = useAnimatedStyle(() => {
    const value = progress.get();
    return {
      transform: [{ translateX: interpolate(value, [0, 1], [-panelWidth * 1.05 * dir, 0]) }],
      opacity: interpolate(value, [0, 0.12, 1], [0, 0.55, 1]),
    };
  });

  const contextValue = useMemo(() => ({ open, close, isOpen }), [close, isOpen, open]);

  return (
    <DrawerContext.Provider value={contextValue}>
      <View style={[styles.host, { backgroundColor: DRAWER_VOID }]}>
        <Animated.View style={[styles.content, { backgroundColor: theme.color.background }, contentStyle]}>
          {children}
        </Animated.View>

        <GestureDetector gesture={edgeGesture}>
          <View style={[styles.edge, isRtl ? { right: 0 } : { left: 0 }]} />
        </GestureDetector>

        <Animated.View
          pointerEvents={isOpen ? 'auto' : 'none'}
          style={[StyleSheet.absoluteFill, backdropStyle]}>
          <PressableScale
            scaleTo={1}
            accessibilityRole="button"
            accessibilityLabel={ui.drawerCloseMenu}
            onPress={close}
            style={[StyleSheet.absoluteFill, { backgroundColor: theme.color.scrim }]}
          />
        </Animated.View>

        <Animated.View
          pointerEvents={isOpen ? 'auto' : 'none'}
          style={[styles.panel, isRtl ? { right: 0 } : { left: 0 }, { width: panelWidth }, panelStyle]}>
          <GestureDetector gesture={closeGesture}>
            <View style={styles.flex}>
              <ThemeOverride scheme="auth">
                <DrawerPanel progress={progress} onNavigate={close} />
              </ThemeOverride>
            </View>
          </GestureDetector>
        </Animated.View>
      </View>
    </DrawerContext.Provider>
  );
}

type PanelProps = {
  progress: SharedValue<number>;
  onNavigate: () => void;
};

function DrawerPanel({ progress, onNavigate }: PanelProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { role, can } = usePermissions();
  const { mode } = useThemeMode();
  const { isRtl, ui } = useLanguage();
  const { unread } = useNotifications();

  const unreadMessages = useMemo(() => MESSAGES.filter((message) => message.unread).length, []);

  // Slots are assigned once per render pass so the stagger stays continuous no
  // matter how many entries the current role can actually see.
  const { groups, tailSlot } = useMemo(() => {
    let slot = FIRST_GROUP_SLOT;
    const activeRole = role ?? 'lab_owner';

    const visible = NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.flatMap((item) => {
        if (!item.permission) return [item];
        // Shares the tab bar's resolution, so a driver gets the same
        // "Deliveries" wording and gate in both navigators.
        const nav = resolveNav(activeRole, item.key, {
          permission: item.permission,
          labelKey: item.labelKey,
        });
        return can(nav.permission) ? [{ ...item, labelKey: nav.labelKey }] : [];
      }),
    }))
      .filter((group) => group.items.length > 0)
      .map((group) => ({
        key: group.key,
        titleKey: group.titleKey,
        titleSlot: slot++,
        entries: group.items.map((item) => ({ item, slot: slot++ })),
      }));

    return { groups: visible, tailSlot: slot };
  }, [can, role]);

  const badgeFor = (item: NavItem) => {
    if (item.badgeSource === 'notifications') return unread;
    if (item.badgeSource === 'inbox') return unreadMessages;
    return 0;
  };

  const go = (item: NavItem) => {
    if (!item.route) return;
    router.navigate(item.route);
    onNavigate();
  };

  return (
    <View style={[styles.panelInner, { backgroundColor: theme.color.surface }]}>
      <LinearGradient
        colors={[withAlpha(theme.color.brand, 0.28), 'transparent']}
        start={{ x: isRtl ? 1 : 0, y: 0 }}
        end={{ x: isRtl ? 0.25 : 0.75, y: 0.55 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.xl,
          paddingHorizontal: spacing.xl,
          gap: spacing.xl,
        }}>
        <StaggerItem progress={progress} index={0}>
          <View style={[styles.brandRow, row(isRtl)]}>
            <LogoMark size={48} />
            <View style={styles.flex}>
              <Text variant="displaySerif" style={styles.brandTitle}>
                Nadeem
              </Text>
              <Text variant="caption" tone="accent">
                {ui.drawerWorkspace}
              </Text>
            </View>
          </View>
        </StaggerItem>

        <StaggerItem progress={progress} index={1}>
          <PressableScale
            style={[
              styles.profile,
              row(isRtl),
              { backgroundColor: theme.color.surfaceMuted, borderColor: theme.color.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel={ui.drawerOpenProfile}>
            <Avatar initials={user?.initials ?? 'NY'} size={48} online />
            <View style={styles.flex}>
              <Text variant="label" numberOfLines={1}>
                {user?.name ?? 'Nadeem Dental Lab'}
              </Text>
              <Text variant="caption" tone="faint" numberOfLines={1}>
                {user ? ui[ROLE_LABEL_KEYS[user.role]] : 'Nadeem Dental Lab'}
              </Text>
            </View>
            <Icon name="chevron-forward" size={16} color={theme.color.textFaint} directional />
          </PressableScale>
        </StaggerItem>

        {groups.map((group) => (
          <View key={group.key} style={styles.group}>
            <StaggerItem progress={progress} index={group.titleSlot}>
              <Text variant="overline" tone="faint" style={styles.groupTitle}>
                {ui[group.titleKey]}
              </Text>
            </StaggerItem>
            {group.entries.map(({ item, slot }) => (
              <StaggerItem key={item.key} progress={progress} index={slot}>
                <DrawerRow
                  item={item}
                  badge={badgeFor(item)}
                  active={pathname === item.match}
                  onPress={item.soon ? undefined : () => go(item)}
                />
              </StaggerItem>
            ))}
          </View>
        ))}

        <StaggerItem progress={progress} index={tailSlot}>
          <View style={styles.group}>
            <Text variant="overline" tone="faint" style={styles.groupTitle}>
              {ui.drawerLanguage}
            </Text>
            <LanguageSwitch />
          </View>
        </StaggerItem>

        <StaggerItem progress={progress} index={tailSlot + 1}>
          <View style={styles.group}>
            <Text variant="overline" tone="faint" style={styles.groupTitle}>
              {ui.drawerAppearance}
            </Text>
            <View style={[styles.themeSwitch, row(isRtl), { backgroundColor: theme.color.surfaceMuted }]}>
              {THEME_OPTIONS.map((option) => {
                const active = mode === option.key;
                return (
                  <PressableScale
                    key={option.key}
                    scaleTo={0.93}
                    accessibilityRole="button"
                    accessibilityLabel={ui[option.labelKey]}
                    accessibilityState={{ selected: active }}
                    onPress={() => setThemeMode(option.key)}
                    style={[
                      styles.themeOption,
                      row(isRtl),
                      active
                        ? { backgroundColor: theme.color.surfaceRaised, ...elevation(1, theme.scheme) }
                        : null,
                    ]}>
                    <Icon
                      name={option.icon}
                      size={15}
                      color={active ? theme.color.brand : theme.color.textFaint}
                    />
                    <Text variant="caption" color={active ? theme.color.text : theme.color.textFaint}>
                      {ui[option.labelKey]}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        </StaggerItem>

        <StaggerItem progress={progress} index={tailSlot + 2}>
          <View
            style={[styles.status, row(isRtl), { backgroundColor: withAlpha(theme.color.success, 0.12) }]}>
            <View style={[styles.statusDot, { backgroundColor: theme.color.success }]} />
            <Text variant="caption" tone="success" style={styles.flex}>
              {ui.drawerStatusOk}
            </Text>
          </View>
        </StaggerItem>

        <StaggerItem progress={progress} index={tailSlot + 3}>
          <PressableScale
            onPress={() => {
              onNavigate();
              logout();
            }}
            accessibilityRole="button"
            accessibilityLabel={ui.drawerLogout}
            style={[styles.logout, row(isRtl), { borderColor: theme.color.border }]}>
            <Icon name="log-out-outline" size={18} color={theme.color.danger} directional />
            <Text variant="label" tone="danger">
              {ui.drawerLogout}
            </Text>
          </PressableScale>
        </StaggerItem>
      </ScrollView>
    </View>
  );
}

function DrawerRow({
  item,
  active,
  badge,
  onPress,
}: {
  item: NavItem;
  active: boolean;
  badge: number;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();
  const label = ui[item.labelKey];

  return (
    <PressableScale
      onPress={onPress}
      disabled={item.soon}
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={[styles.row, row(isRtl), active ? { backgroundColor: theme.color.brandSoft } : null]}>
      {active ? (
        <View
          style={[styles.activeBar, isRtl ? { right: 0 } : { left: 0 }, { backgroundColor: theme.color.brand }]}
        />
      ) : null}
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: active ? theme.color.brand : theme.color.surfaceMuted },
        ]}>
        <Icon name={item.icon} size={17} color={active ? theme.color.onBrand : theme.color.textMuted} />
      </View>
      <Text variant="bodyMedium" color={active ? theme.color.brand : theme.color.text} style={styles.flex}>
        {label}
      </Text>
      {badge > 0 ? <Badge label={String(badge)} tone="danger" /> : null}
      {item.soon ? <Badge label={ui.drawerSoonBadge} tone="neutral" /> : null}
    </PressableScale>
  );
}

function StaggerItem({
  progress,
  index,
  children,
}: {
  progress: SharedValue<number>;
  index: number;
  children: ReactNode;
}) {
  const { isRtl } = useLanguage();
  const from = isRtl ? 22 : -22;

  const animatedStyle = useAnimatedStyle(() => {
    const start = Math.min(0.08 + index * 0.04, 0.68);
    const end = Math.min(start + 0.32, 1);
    return {
      opacity: interpolate(progress.get(), [start, end], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateX: interpolate(progress.get(), [start, end], [from, 0], Extrapolation.CLAMP) },
      ],
    };
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export function DrawerButton() {
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();
  const { open } = useDrawer();

  return (
    <PressableScale
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={ui.drawerOpenMenu}
      hitSlop={10}
      style={[
        styles.menuButton,
        { borderColor: theme.color.border, backgroundColor: theme.color.surface },
        elevation(1, theme.scheme),
      ]}>
      <BlurView intensity={28} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
      <View style={[styles.menuLines, { alignItems: alignStart(isRtl) }]}>
        <View style={[styles.menuLine, { backgroundColor: theme.color.text, width: 16 }]} />
        <View style={[styles.menuLine, { backgroundColor: theme.color.text, width: 10 }]} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
  flex: { flex: 1 },
  content: { flex: 1, overflow: 'hidden' },
  panel: { position: 'absolute', top: 0, bottom: 0 },
  panelInner: { flex: 1, overflow: 'hidden' },
  edge: { position: 'absolute', top: 0, bottom: 0, width: 26 },
  brandRow: { alignItems: 'center', gap: spacing.sm },
  brandTitle: { fontSize: 28, lineHeight: 32, marginTop: -2 },
  profile: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  group: { gap: 4 },
  groupTitle: { marginBottom: spacing.sm, marginHorizontal: spacing.sm },
  row: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  activeBar: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    width: 3,
    borderRadius: 2,
  },
  rowIcon: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  themeSwitch: { flexDirection: 'row', padding: 4, borderRadius: radius.pill, gap: 4 },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  status: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  logout: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  menuLines: { gap: 5 },
  menuLine: { height: 2, borderRadius: 1 },
});
