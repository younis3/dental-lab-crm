import { StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { PressableScale } from '@/components/ui/pressable-scale';
import { motion } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/store/language-store';

const TRACK_WIDTH = 46;
const TRACK_HEIGHT = 28;
const KNOB = 22;
const INSET = 3;
const TRAVEL = TRACK_WIDTH - KNOB - INSET * 2;

type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

/** Themed toggle. The knob travels toward the trailing edge, so it mirrors in RTL. */
export function Switch({ value, onValueChange, accessibilityLabel, disabled = false }: SwitchProps) {
  const theme = useTheme();
  const { isRtl } = useLanguage();

  const progress = useDerivedValue(() =>
    withTiming(value ? 1 : 0, { duration: motion.duration.fast })
  );

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.get(),
      [0, 1],
      [theme.color.surfaceMuted, theme.color.brand]
    ),
    borderColor: interpolateColor(progress.get(), [0, 1], [theme.color.border, theme.color.brand]),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.get() * TRAVEL * (isRtl ? -1 : 1) }],
  }));

  return (
    <PressableScale
      scaleTo={0.92}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      onPress={() => onValueChange(!value)}
      hitSlop={8}>
      <Animated.View style={[styles.track, trackStyle, disabled ? styles.disabled : null]}>
        <Animated.View
          style={[
            styles.knob,
            isRtl ? { right: INSET } : { left: INSET },
            { backgroundColor: theme.color.surfaceRaised },
            knobStyle,
          ]}
        />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  knob: {
    position: 'absolute',
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
  },
  disabled: { opacity: 0.45 },
});
