import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { row } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

export function LiveDot({ label }: { label: string }) {
  const theme = useTheme();
  const { isRtl } = useLanguage();
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.set(withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0.35, { duration: 900 })), -1));
  }, [pulse]);

  const glow = useAnimatedStyle(() => ({ opacity: pulse.get() }));

  return (
    <View style={[styles.row, row(isRtl)]}>
      <View style={styles.dotWrap}>
        <Animated.View style={[styles.glow, { backgroundColor: theme.color.success }, glow]} />
        <View style={[styles.dot, { backgroundColor: theme.color.success }]} />
      </View>
      <Text variant="overline" color="rgba(255,255,255,0.78)">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', gap: spacing.sm },
  dotWrap: { width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 10, height: 10, borderRadius: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
