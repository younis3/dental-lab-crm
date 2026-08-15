import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { motion } from '@/constants/design';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** How far the element shrinks while held. */
  scaleTo?: number;
};

export function PressableScale({
  style,
  scaleTo = 0.96,
  onPressIn,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(event) => {
        scale.set(withSpring(scaleTo, motion.springSnappy));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.set(withSpring(1, motion.spring));
        rest.onPressOut?.(event);
      }}
      style={[style, animatedStyle, disabled ? { opacity: 0.55 } : null]}
    />
  );
}
