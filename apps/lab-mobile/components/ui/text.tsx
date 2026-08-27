import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { type as typeScale } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/store/language-store';

type Variant = keyof typeof typeScale;
type Tone = 'default' | 'muted' | 'faint' | 'brand' | 'success' | 'warning' | 'danger' | 'inverse' | 'accent';

export type TextProps = RNTextProps & {
  variant?: Variant;
  tone?: Tone;
  /** Overrides both `tone` and the theme colour. */
  color?: string;
  /**
   * Keeps the characters left-to-right — for phone numbers, codes and counters.
   * Alignment is unaffected: the run still sits on the layout's leading edge.
   */
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

  // Only the character order is pinned by `ltr`; alignment follows the layout so
  // a counter cannot drift to the far side of the card that owns it.
  const direction: TextStyle = {
    writingDirection: ltr || !isRtl ? 'ltr' : 'rtl',
    textAlign: isRtl ? 'right' : 'left',
  };

  return (
    <RNText
      {...rest}
      style={[typeScale[variant], { color: color ?? toneColor[tone] }, direction, style]}
    />
  );
}
