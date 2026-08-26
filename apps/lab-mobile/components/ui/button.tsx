import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { elevation, radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { row } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const { isRtl } = useLanguage();
  const height = size === 'lg' ? 56 : 48;
  const borderRadius = size === 'lg' ? radius.lg : radius.sm;
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  const foreground = isPrimary
    ? theme.color.onBrand
    : isDanger
      ? theme.color.danger
      : variant === 'secondary'
        ? theme.color.text
        : theme.color.brand;

  const content = (
    <View style={[styles.content, row(isRtl)]}>
      {loading ? (
        <ActivityIndicator size="small" color={foreground} />
      ) : (
        <>
          {icon && iconPosition === 'left' ? (
            <Icon name={icon} size={18} color={foreground} directional />
          ) : null}
          <Text variant={size === 'lg' ? 'subheading' : 'label'} color={foreground}>
            {label}
          </Text>
          {icon && iconPosition === 'right' ? (
            <Icon name={icon} size={18} color={foreground} directional />
          ) : null}
        </>
      )}
    </View>
  );

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.base,
        { height, borderRadius },
        isPrimary ? elevation(2, theme.scheme) : null,
        isPrimary ? { shadowColor: theme.color.brand } : null,
        variant === 'secondary'
          ? {
              backgroundColor: theme.color.surface,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: theme.color.borderStrong,
            }
          : null,
        variant === 'ghost' ? { backgroundColor: theme.color.brandSoft } : null,
        isDanger
          ? {
              backgroundColor: theme.color.surface,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: theme.color.border,
            }
          : null,
        style,
      ]}>
      {isPrimary ? (
        <LinearGradient
          colors={theme.gradient.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius }]}
        />
      ) : null}
      {content}
    </PressableScale>
  );
}

type IconButtonProps = {
  icon: IconName;
  onPress?: () => void;
  size?: number;
  tone?: 'surface' | 'glass' | 'brand';
  /** `circle` is the default pill; `rounded` is a square with soft corners. */
  shape?: 'circle' | 'rounded';
  accessibilityLabel: string;
  badge?: number;
};

export function IconButton({
  icon,
  onPress,
  size = 44,
  tone = 'surface',
  shape = 'circle',
  accessibilityLabel,
  badge,
}: IconButtonProps) {
  const theme = useTheme();
  const { isRtl } = useLanguage();
  const background =
    tone === 'brand' ? theme.color.brand : tone === 'glass' ? theme.color.glass : theme.color.surface;
  const foreground = tone === 'brand' ? theme.color.onBrand : theme.color.text;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={[
        styles.iconButton,
        {
          width: size,
          height: size,
          borderRadius: shape === 'rounded' ? radius.md : size / 2,
          backgroundColor: background,
          borderColor: theme.color.border,
        },
        elevation(1, theme.scheme),
      ]}>
      <Icon name={icon} size={size * 0.46} color={foreground} />
      {badge ? (
        <View
          style={[
            styles.badge,
            isRtl ? { left: -2 } : { right: -2 },
            { backgroundColor: theme.color.danger, borderColor: theme.color.background },
          ]}>
          <Text variant="caption" tone="inverse" style={styles.badgeText} ltr>
            {badge > 9 ? '9+' : badge}
          </Text>
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  content: { alignItems: 'center', gap: spacing.sm },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    position: 'absolute',
    top: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 10, lineHeight: 13, textAlign: 'center' },
});
