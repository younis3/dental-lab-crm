import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useId } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

type BlobProps = {
  color: string;
  size: number;
  left: number;
  top: number;
  opacity: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
};

function Blob({ color, size, left, top, opacity, driftX, driftY, duration, delay }: BlobProps) {
  const gradientId = `blob-${useId().replace(/:/g, '')}`;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withDelay(
        delay,
        withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true)
      )
    );
  }, [delay, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.get(), [0, 1], [0, driftX]) },
      { translateY: interpolate(progress.get(), [0, 1], [0, driftY]) },
      { scale: interpolate(progress.get(), [0, 1], [1, 1.18]) },
    ],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left, top, width: size, height: size }, animatedStyle]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="55%" stopColor={color} stopOpacity={opacity * 0.32} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${gradientId})`} />
      </Svg>
    </Animated.View>
  );
}

/** Ambient animated backdrop: a base gradient plus slowly drifting colour blobs. */
export function AuroraBackground({ intense = false }: { intense?: boolean }) {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const base = Math.max(width, 360);
  const strength = intense ? 1 : 0.58;
  const dark = theme.scheme === 'dark';

  return (
    <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={theme.gradient.aurora}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Blob
        color={theme.color.brand}
        size={base * 1.28}
        left={-base * 0.48}
        top={-base * 0.4}
        opacity={(dark ? 0.55 : 0.34) * strength}
        driftX={42}
        driftY={28}
        duration={12000}
        delay={0}
      />
      <Blob
        color={theme.color.accent}
        size={base * 1.08}
        left={width - base * 0.58}
        top={height * 0.04}
        opacity={(dark ? 0.38 : 0.28) * strength}
        driftX={-36}
        driftY={44}
        duration={14000}
        delay={700}
      />
      <Blob
        color={dark ? '#5EEAD4' : '#86B8A8'}
        size={base * 1.12}
        left={-base * 0.18}
        top={height * 0.52}
        opacity={(dark ? 0.36 : 0.26) * strength}
        driftX={48}
        driftY={-32}
        duration={16000}
        delay={1400}
      />
    </Animated.View>
  );
}
