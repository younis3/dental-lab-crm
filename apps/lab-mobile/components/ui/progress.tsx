import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

import { radius, type GradientStops } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { row } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const EASING = Easing.out(Easing.cubic);

type ProgressBarProps = {
  /** 0 – 1 */
  value: number;
  height?: number;
  colors?: GradientStops;
  trackColor?: string;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

export function ProgressBar({
  value,
  height = 8,
  colors,
  trackColor,
  delay = 0,
  style,
}: ProgressBarProps) {
  const theme = useTheme();
  const { isRtl } = useLanguage();
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(withDelay(delay, withTiming(Math.min(Math.max(value, 0), 1), { duration: 900, easing: EASING })));
  }, [delay, progress, value]);

  const fillStyle = useAnimatedStyle(() => ({ width: trackWidth * progress.get() }));

  return (
    <View
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      style={[
        { height, borderRadius: radius.pill, backgroundColor: trackColor ?? theme.color.surfaceMuted },
        styles.clip,
        row(isRtl),
        style,
      ]}>
      <Animated.View style={[{ height }, fillStyle]}>
        <LinearGradient
          colors={colors ?? theme.gradient.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
        />
      </Animated.View>
    </View>
  );
}

export type Segment = { key: string; value: number; color: string };

/** Single bar split into proportional colour segments. */
export function SegmentedBar({ segments, height = 10 }: { segments: Segment[]; height?: number }) {
  const { isRtl } = useLanguage();
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  return (
    <View style={[styles.segmentRow, row(isRtl), { height }]}>
      {segments
        .filter((segment) => segment.value > 0)
        .map((segment) => (
          <View
            key={segment.key}
            style={{
              flexGrow: segment.value / total,
              flexBasis: 0,
              backgroundColor: segment.color,
              borderRadius: radius.pill,
            }}
          />
        ))}
    </View>
  );
}

type ProgressRingProps = {
  /** 0 – 1 */
  value: number;
  size?: number;
  stroke?: number;
  colors?: GradientStops;
  trackColor?: string;
  children?: ReactNode;
  delay?: number;
};

export function ProgressRing({
  value,
  size = 92,
  stroke = 9,
  colors,
  trackColor,
  children,
  delay = 120,
}: ProgressRingProps) {
  const theme = useTheme();
  const gradientId = `ring-${useId().replace(/:/g, '')}`;
  const ringRadius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const progress = useSharedValue(0);
  const [from, to] = colors ?? theme.gradient.brand;

  useEffect(() => {
    progress.set(withDelay(delay, withTiming(Math.min(Math.max(value, 0), 1), { duration: 1100, easing: EASING })));
  }, [delay, progress, value]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.get()),
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={styles.ringSvg}>
        <Defs>
          <SvgLinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={from} />
            <Stop offset="100%" stopColor={to} />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={ringRadius}
          stroke={trackColor ?? theme.color.surfaceMuted}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={ringRadius}
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={styles.ringCenter}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  segmentRow: { flexDirection: 'row', gap: 3 },
  // Start the sweep at 12 o'clock instead of 3 o'clock.
  ringSvg: { transform: [{ rotate: '-90deg' }] },
  ringCenter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
