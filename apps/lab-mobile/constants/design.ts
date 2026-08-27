import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export type ColorScheme = 'light' | 'dark';
/** `auth` is a fixed palette taken from the printed logo. */
export type ThemeName = ColorScheme | 'auth';

/** Two-or-more stop tuple required by expo-linear-gradient. */
export type GradientStops = readonly [string, string, ...string[]];

/** Sampled from assets/images/logo/logo.JPG: slate canvas, rose-taupe mark. */
const logo = {
  slateInk: '#16212B',
  slateDeep: '#22323F',
  slate: '#2B3D4F',
  slateLift: '#33465A',
  slateSoft: '#3A4E63',
  slateRaised: '#42576C',
  roseLight: '#C6A594',
  roseMid: '#B8927F',
  rose: '#A98876',
  roseDeep: '#8A6E62',
  roseInk: '#75594E',
  cream: '#F2E9E3',
  creamSoft: '#EDE4DC',
};

/** One brand ramp everywhere, deep enough for white label text. */
const brandRamp: GradientStops = ['#B8927F', '#9A7B6C', '#806358'];

const semantic = {
  success: '#3F8A6E',
  successLight: '#8FCBB2',
  warning: '#B4822F',
  warningLight: '#E3C08A',
  danger: '#C25B54',
  dangerLight: '#E8A09A',
};

export type Theme = {
  scheme: ColorScheme;
  color: {
    background: string;
    surface: string;
    surfaceMuted: string;
    surfaceRaised: string;
    border: string;
    borderStrong: string;
    text: string;
    textMuted: string;
    textFaint: string;
    brand: string;
    brandSoft: string;
    onBrand: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    glass: string;
    glassBorder: string;
    scrim: string;
    highlight: string;
    /** Ambient blob colour behind screens. */
    glow: string;
  };
  gradient: {
    brand: GradientStops;
    aurora: GradientStops;
    surfaceFade: GradientStops;
    hero: GradientStops;
    gold: GradientStops;
    /** Card fill — a barely-there wash so panels lift off the canvas. */
    card: GradientStops;
    success: GradientStops;
    warning: GradientStops;
    danger: GradientStops;
  };
  blurTint: 'light' | 'dark';
};

/** Clean white canvas with neutral grey cards; the rose brand carries the accent. */
const light: Theme = {
  scheme: 'light',
  color: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#F3F4F6',
    surfaceRaised: '#FFFFFF',
    border: 'rgba(17, 19, 24, 0.08)',
    borderStrong: 'rgba(17, 19, 24, 0.16)',
    text: '#15171C',
    textMuted: '#5B6069',
    textFaint: '#8D929B',
    brand: logo.roseDeep,
    brandSoft: 'rgba(138, 110, 98, 0.10)',
    onBrand: '#FFFFFF',
    accent: logo.slate,
    success: semantic.success,
    warning: semantic.warning,
    danger: semantic.danger,
    glass: 'rgba(255, 255, 255, 0.72)',
    glassBorder: 'rgba(255, 255, 255, 0.90)',
    scrim: 'rgba(17, 19, 24, 0.45)',
    highlight: 'rgba(255, 255, 255, 0.60)',
    // Neutral ambience: any warm tint reads as glare on a white canvas.
    glow: '#E9EBEF',
  },
  gradient: {
    brand: brandRamp,
    aurora: ['#FFFFFF', '#FCFCFD', '#F4F5F7'],
    surfaceFade: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.94)'],
    hero: [logo.slateLift, logo.slate, logo.slateDeep],
    gold: [logo.roseLight, logo.roseDeep],
    card: ['#FFFFFF', '#F1F2F4'],
    success: [semantic.successLight, semantic.success],
    warning: [semantic.warningLight, semantic.warning],
    danger: [semantic.dangerLight, semantic.danger],
  },
  blurTint: 'light',
};

/** Logo slate at night: deep navy canvas with lifted slate cards. */
const dark: Theme = {
  scheme: 'dark',
  color: {
    background: logo.slateInk,
    surface: logo.slate,
    surfaceMuted: logo.slateLift,
    surfaceRaised: logo.slateSoft,
    border: 'rgba(242, 233, 227, 0.10)',
    borderStrong: 'rgba(242, 233, 227, 0.20)',
    text: logo.cream,
    textMuted: '#C3CDD8',
    textFaint: '#93A2B1',
    brand: logo.roseLight,
    brandSoft: 'rgba(198, 165, 148, 0.16)',
    onBrand: '#FFFFFF',
    accent: '#B08972',
    success: semantic.successLight,
    warning: semantic.warningLight,
    danger: semantic.dangerLight,
    glass: 'rgba(43, 61, 79, 0.62)',
    glassBorder: 'rgba(242, 233, 227, 0.12)',
    scrim: 'rgba(11, 17, 23, 0.66)',
    highlight: 'rgba(255, 255, 255, 0.08)',
    glow: logo.rose,
  },
  gradient: {
    brand: brandRamp,
    aurora: [logo.slate, logo.slateDeep, logo.slateInk],
    surfaceFade: ['rgba(22,33,43,0)', 'rgba(22,33,43,0.94)'],
    hero: [logo.slateSoft, logo.slate, logo.slateInk],
    gold: [logo.roseLight, logo.roseDeep],
    card: [logo.slateLift, logo.slate],
    success: [semantic.successLight, semantic.success],
    warning: [semantic.warningLight, semantic.warning],
    danger: [semantic.dangerLight, semantic.danger],
  },
  blurTint: 'dark',
};

/** Sign-in and sidebar palette: the logo background colour, unmodified. */
const auth: Theme = {
  scheme: 'dark',
  color: {
    background: logo.slate,
    surface: logo.slateLift,
    surfaceMuted: logo.slateSoft,
    surfaceRaised: logo.slateRaised,
    border: 'rgba(242, 233, 227, 0.14)',
    borderStrong: 'rgba(242, 233, 227, 0.26)',
    text: logo.cream,
    textMuted: '#C3CDD8',
    textFaint: '#93A2B1',
    brand: logo.roseLight,
    brandSoft: 'rgba(198, 165, 148, 0.18)',
    onBrand: '#FFFFFF',
    accent: logo.roseLight,
    success: semantic.successLight,
    warning: semantic.warningLight,
    danger: semantic.dangerLight,
    glass: 'rgba(43, 61, 79, 0.66)',
    glassBorder: 'rgba(242, 233, 227, 0.16)',
    scrim: 'rgba(14, 22, 30, 0.66)',
    highlight: 'rgba(255, 255, 255, 0.08)',
    glow: logo.rose,
  },
  gradient: {
    brand: brandRamp,
    aurora: [logo.slateLift, logo.slate, logo.slateDeep],
    surfaceFade: ['rgba(43,61,79,0)', 'rgba(43,61,79,0.94)'],
    hero: [logo.slateLift, logo.slate, logo.slateDeep],
    gold: [logo.roseLight, logo.roseDeep],
    card: [logo.slateSoft, logo.slateLift],
    success: [semantic.successLight, semantic.success],
    warning: [semantic.warningLight, semantic.warning],
    danger: [semantic.dangerLight, semantic.danger],
  },
  blurTint: 'dark',
};

export const themes: Record<ThemeName, Theme> = { light, dark, auth };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  '2xl': 36,
  pill: 999,
} as const;

export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
  serif: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
} as const;

type TypeToken = Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing' | 'fontStyle'>;

export const type = {
  display: { fontFamily: fontFamily.extrabold, fontSize: 36, lineHeight: 42, letterSpacing: -1.1 },
  displaySerif: { fontFamily: fontFamily.serif, fontSize: 42, lineHeight: 46, letterSpacing: -1.2 },
  editorial: { fontFamily: fontFamily.serifItalic, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  greeting: { fontFamily: fontFamily.regular, fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  title: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  heading: { fontFamily: fontFamily.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.35 },
  subheading: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fontFamily.medium, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fontFamily.semibold, fontSize: 13, lineHeight: 18, letterSpacing: -0.1 },
  caption: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: fontFamily.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 1.4 },
  metric: { fontFamily: fontFamily.extrabold, fontSize: 32, lineHeight: 36, letterSpacing: -1.2 },
} satisfies Record<string, TypeToken>;

/** Elevation presets; Android needs `elevation`, iOS needs the shadow quartet. */
export function elevation(level: 0 | 1 | 2 | 3, scheme: ColorScheme): ViewStyle {
  if (level === 0) return {};
  const config = {
    1: { radius: 14, offset: 5, opacity: 0.08, elevation: 2 },
    2: { radius: 28, offset: 12, opacity: 0.12, elevation: 8 },
    3: { radius: 44, offset: 20, opacity: 0.18, elevation: 16 },
  }[level];

  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: scheme === 'dark' ? '#000000' : '#0F1319',
      shadowOpacity: scheme === 'dark' ? config.opacity * 2.1 : config.opacity,
      shadowRadius: config.radius,
      shadowOffset: { width: 0, height: config.offset },
    },
    android: { elevation: config.elevation },
    default: {
      boxShadow: `0px ${config.offset}px ${config.radius}px rgba(15, 19, 25, ${config.opacity})`,
    },
  }) as ViewStyle;
}

export const motion = {
  spring: { damping: 18, stiffness: 190, mass: 0.9 },
  springSoft: { damping: 24, stiffness: 140, mass: 1 },
  springSnappy: { damping: 16, stiffness: 340, mass: 0.55 },
  duration: { fast: 160, base: 260, slow: 420 },
} as const;
