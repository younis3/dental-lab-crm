import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { type as typeScale } from '@/constants/design';
import { LTR_TEXT } from '@/lib/rtl';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/store/language-store';

type Variant = keyof typeof typeScale;
type Tone = 'default' | 'muted' | 'faint' | 'brand' | 'success' | 'warning' | 'danger' | 'inverse' | 'accent';

export type TextProps = RNTextProps & {
  variant?: Variant;
  tone?: Tone;
  /** Overrides both `tone` and the theme colour. */
  color?: string;
  /** Keeps the run left-to-right — for phone numbers, codes and counters. */
  ltr?: boolean;
};

export function Text({ variant = 'body', tone = 'default', color, ltr = false, style, ...rest }: TextProps) {
  const theme = useTheme();
  const { isRtl } = useLanguage();

  const toneColor: Record<Tone, string> = {
    default: theme.color.text,
    muted: theme.color.textMuted,
    faint: theme.color.textFaint,
    brand: theme.color.brand,
    accent: theme.color.accent,
    success: theme.color.success,
    warning: theme.color.warning,
    danger: theme.color.danger,
    inverse: '#FFFFFF',
  };

  const direction = ltr
    ? LTR_TEXT
    : { writingDirection: isRtl ? ('rtl' as const) : ('ltr' as const), textAlign: isRtl ? ('right' as const) : ('left' as const) };

  return (
    <RNText
      {...rest}
      style={[typeScale[variant], { color: color ?? toneColor[tone] }, direction, style]}
    />
  );
}
