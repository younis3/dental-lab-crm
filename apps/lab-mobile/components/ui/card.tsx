import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { elevation, radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  level?: 0 | 1 | 2 | 3;
};

export function Card({ children, style, padded = true, level = 1 }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.color.surface,
          borderColor: theme.color.border,
          padding: padded ? spacing.lg : 0,
        },
        elevation(level, theme.scheme),
        style,
      ]}>
      <View pointerEvents="none" style={[styles.sheen, { backgroundColor: theme.color.highlight }]} />
      {children}
    </View>
  );
}

type GlassCardProps = CardProps & { intensity?: number };

/** Frosted panel. Falls back to a translucent fill wherever blur is unavailable. */
export function GlassCard({
  children,
  style,
  padded = true,
  level = 2,
  intensity = 44,
}: GlassCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.base, styles.clip, elevation(level, theme.scheme), style]}>
      <BlurView intensity={intensity} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.color.glass, borderColor: theme.color.glassBorder },
          styles.glassBorder,
        ]}
      />
      <View pointerEvents="none" style={[styles.sheen, { backgroundColor: theme.color.highlight }]} />
      <View style={{ padding: padded ? spacing.xl : 0 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  clip: { overflow: 'hidden', borderWidth: 0 },
  glassBorder: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.xl },
  sheen: {
    position: 'absolute',
    top: 0,
    start: 18,
    end: 18,
    height: StyleSheet.hairlineWidth + 0.5,
    borderRadius: 1,
  },
});
