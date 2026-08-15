import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { elevation, fontFamily, motion, radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import type { UiStrings } from '@/lib/i18n';
import { row } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

export const TAB_BAR_HEIGHT = 68;
/** Clearance screens should leave at the bottom of scroll content. */
export const TAB_BAR_CLEARANCE = TAB_BAR_HEIGHT + 28;

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName; labelKey: keyof UiStrings }> = {
  index: { active: 'grid', inactive: 'grid-outline', labelKey: 'navHome' },
  orders: { active: 'layers', inactive: 'layers-outline', labelKey: 'navOrders' },
  inbox: { active: 'chatbubbles', inactive: 'chatbubbles-outline', labelKey: 'navInbox' },
  folders: { active: 'folder-open', inactive: 'folder-outline', labelKey: 'navFiles' },
};

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isRtl, ui } = useLanguage();
  const [barWidth, setBarWidth] = useState(0);

  const count = state.routes.length;
  /** Visual slot of a route once the bar is mirrored. */
  const slotOf = (index: number) => (isRtl ? count - 1 - index : index);

  const activeSlot = useSharedValue(slotOf(state.index));
  const tabWidth = barWidth ? barWidth / count : 0;

  useEffect(() => {
    activeSlot.set(withSpring(isRtl ? count - 1 - state.index : state.index, motion.spring));
  }, [activeSlot, count, isRtl, state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: activeSlot.get() * tabWidth }],
    width: tabWidth,
  }));

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <View
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
        style={[styles.bar, row(isRtl), { borderColor: theme.color.glassBorder }, elevation(3, theme.scheme)]}>
        <BlurView
          intensity={Platform.OS === 'android' ? 60 : 34}
          tint={theme.blurTint}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.color.glass }]} />

        {tabWidth > 0 ? (
          <Animated.View style={[styles.indicatorTrack, indicatorStyle]}>
            <LinearGradient
              colors={theme.gradient.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.indicator, { shadowColor: theme.color.brand }, elevation(2, theme.scheme)]}
            />
          </Animated.View>
        ) : null}

        {state.routes.map((route, index) => {
          const meta = TAB_ICONS[route.name];
          const label = meta ? ui[meta.labelKey] : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TabItem
              key={route.key}
              slot={slotOf(index)}
              activeSlot={activeSlot}
              icon={isFocused ? (meta?.active ?? 'ellipse') : (meta?.inactive ?? 'ellipse-outline')}
              label={label}
              focused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

type TabItemProps = {
  slot: number;
  activeSlot: SharedValue<number>;
  icon: IconName;
  label: string;
  focused: boolean;
  onPress: () => void;
};

function TabItem({ slot, activeSlot, icon, label, focused, onPress }: TabItemProps) {
  const theme = useTheme();

  const iconStyle = useAnimatedStyle(() => {
    const distance = Math.abs(activeSlot.get() - slot);
    return {
      transform: [
        { scale: interpolate(distance, [0, 1], [1.06, 1], 'clamp') },
        { translateY: interpolate(distance, [0, 1], [-1, 0], 'clamp') },
      ],
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const distance = Math.abs(activeSlot.get() - slot);
    return {
      opacity: interpolate(distance, [0, 1], [1, 0.65], 'clamp'),
      color: interpolateColor(
        Math.min(distance, 1),
        [0, 1],
        [theme.color.onBrand, theme.color.textMuted]
      ),
    };
  });

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.9}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      style={styles.tab}>
      <Animated.View style={iconStyle}>
        <Icon name={icon} size={21} color={focused ? theme.color.onBrand : theme.color.textMuted} />
      </Animated.View>
      <Animated.Text style={[styles.label, labelStyle]} numberOfLines={1}>
        {label}
      </Animated.Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
  },
  bar: {
    height: TAB_BAR_HEIGHT,
    borderRadius: radius['2xl'],
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    alignItems: 'center',
  },
  indicatorTrack: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    padding: 8,
  },
  indicator: { flex: 1, borderRadius: radius.lg },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: '100%',
  },
  label: { fontFamily: fontFamily.semibold, fontSize: 11, lineHeight: 14, textAlign: 'center' },
});
