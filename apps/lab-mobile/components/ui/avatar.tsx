import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import type { GradientStops } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/store/language-store';

type AvatarProps = {
  initials: string;
  size?: number;
  colors?: GradientStops;
  /** Small dot in the trailing bottom corner. */
  online?: boolean;
};

export function Avatar({ initials, size = 44, colors, online = false }: AvatarProps) {
  const theme = useTheme();
  const { isRtl } = useLanguage();
  const dot = Math.max(10, size * 0.26);

  return (
    <View style={{ width: size, height: size }}>
      <LinearGradient
        colors={colors ?? theme.gradient.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text
          variant="label"
          tone="inverse"
          style={[styles.initials, { fontSize: size * 0.36, lineHeight: size * 0.44 }]}>
          {initials}
        </Text>
      </LinearGradient>
      {online ? (
        <View
          style={[
            styles.dot,
            isRtl ? { left: -1 } : { right: -1 },
            {
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              backgroundColor: theme.color.success,
              borderColor: theme.color.surface,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  initials: { textAlign: 'center' },
  dot: { position: 'absolute', bottom: -1, borderWidth: 2 },
});
