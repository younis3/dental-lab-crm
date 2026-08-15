import type { FlexStyle, TextStyle, ViewStyle } from 'react-native';

/**
 * Direction helpers. Layout is mirrored in JS rather than through
 * `I18nManager`, so switching language never needs an app restart.
 */

export function row(isRtl: boolean): ViewStyle {
  return { flexDirection: isRtl ? 'row-reverse' : 'row' };
}

export function alignStart(isRtl: boolean): FlexStyle['alignItems'] {
  return isRtl ? 'flex-end' : 'flex-start';
}

export function selfStart(isRtl: boolean): FlexStyle['alignSelf'] {
  return isRtl ? 'flex-end' : 'flex-start';
}

/** Leading-edge inset for absolutely positioned decoration. */
export function startInset(isRtl: boolean, value: number): ViewStyle {
  return isRtl ? { right: value } : { left: value };
}

export function startSpacing(isRtl: boolean, value: number): ViewStyle {
  return isRtl ? { marginRight: value } : { marginLeft: value };
}

/** Mirrors directional glyphs such as chevrons and arrows. */
export function mirror(isRtl: boolean): TextStyle | null {
  return isRtl ? { transform: [{ scaleX: -1 }] } : null;
}

/** Keeps digits in order inside an RTL layout (phone numbers, codes, times). */
export const LTR_TEXT: TextStyle = { writingDirection: 'ltr', textAlign: 'left' };
