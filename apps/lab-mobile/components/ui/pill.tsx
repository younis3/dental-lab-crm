import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { row } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

export type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent';

export function useToneColors(tone: Tone) {
  const theme = useTheme();
  const map: Record<Tone, string> = {
    brand: theme.color.brand,
    accent: theme.color.accent,
    success: theme.color.success,
    warning: theme.color.warning,
    danger: theme.color.danger,
    neutral: theme.color.textMuted,
  };
  const fg = map[tone];
  return { fg, bg: withAlpha(fg, theme.scheme === 'dark' ? 0.2 : 0.12) };
}

/** Adds an alpha channel to a `#rrggbb` value; returns other formats untouched. */
export function withAlpha(hex: string, alpha: number) {
  if (!hex.startsWith('#') || hex.length !== 7) return hex;
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type BadgeProps = {
  label: string;
  tone?: Tone;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
};

export function Badge({ label, tone = 'neutral', icon, style }: BadgeProps) {
  const { fg, bg } = useToneColors(tone);
  const { isRtl } = useLanguage();

  return (
    <View style={[styles.badge, row(isRtl), { backgroundColor: bg }, style]}>
      {icon ? <Icon name={icon} size={12} color={fg} /> : null}
      <Text variant="caption" color={fg}>
        {label}
      </Text>
    </View>
  );
}

type ChipProps = {
  label: string;
  selected?: boolean;
  count?: number;
  onPress?: () => void;
};

export function Chip({ label, selected = false, count, onPress }: ChipProps) {
  const theme = useTheme();
  const { isRtl } = useLanguage();

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.94}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        row(isRtl),
        {
          backgroundColor: selected ? theme.color.brand : theme.color.surface,
          borderColor: selected ? theme.color.brand : theme.color.border,
        },
      ]}>
      <Text variant="label" color={selected ? theme.color.onBrand : theme.color.textMuted}>
        {label}
      </Text>
      {typeof count === 'number' ? (
        <View
          style={[
            styles.chipCount,
            { backgroundColor: selected ? 'rgba(255,255,255,0.24)' : theme.color.surfaceMuted },
          ]}>
          <Text variant="caption" color={selected ? theme.color.onBrand : theme.color.textFaint} ltr>
            {count}
          </Text>
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  chip: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipCount: {
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
});
