import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export type ColorScheme = 'light' | 'dark';

/** Two-or-more stop tuple required by expo-linear-gradient. */
export type GradientStops = readonly [string, string, ...string[]];

const palette = {
  teal400: '#2DD4BF',
  teal500: '#14B8A6',
  teal600: '#0D9488',
  teal700: '#0F766E',
  teal800: '#115E59',
  champagne: '#E4C48A',
  champagneDeep: '#C4A574',
  mint: '#5EEAD4',
  sage: '#86B8A8',
  coral: '#F07178',
  coralDeep: '#E24B5A',
  amber: '#F0B45A',
  gold: '#F5D7A1',
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
  };
  gradient: {
    brand: GradientStops;
    aurora: GradientStops;
    surfaceFade: GradientStops;
    hero: GradientStops;
    gold: GradientStops;
    success: GradientStops;
    warning: GradientStops;
    danger: GradientStops;
  };
  blurTint: 'light' | 'dark';
};

const light: Theme = {
  scheme: 'light',
  color: {
    background: '#F1F6F3',
    surface: '#FFFFFF',
    surfaceMuted: '#E7F0EB',
    surfaceRaised: '#FBFDFA',
    border: 'rgba(15, 40, 34, 0.08)',
    borderStrong: 'rgba(15, 40, 34, 0.16)',
    text: '#0B1C18',
    textMuted: '#4F675F',
    textFaint: '#7A9389',
    brand: palette.teal700,
    brandSoft: 'rgba(15, 118, 110, 0.10)',
    onBrand: '#FFFFFF',
    accent: palette.champagneDeep,
    success: '#148F68',
    warning: '#C47C12',
    danger: palette.coralDeep,
    glass: 'rgba(255, 255, 255, 0.70)',
    glassBorder: 'rgba(255, 255, 255, 0.88)',
    scrim: 'rgba(6, 17, 15, 0.48)',
    highlight: 'rgba(255, 255, 255, 0.55)',
  },
  gradient: {
    brand: [palette.teal400, palette.teal600, palette.teal800],
    aurora: ['#E8F4EF', '#F4F1E8', '#F1F6F3'],
    surfaceFade: ['rgba(241,246,243,0)', 'rgba(241,246,243,0.94)'],
    hero: ['#0F766E', '#0D9488', '#134E4A'],
    gold: [palette.gold, palette.champagneDeep],
    success: ['#5EEAD4', '#148F68'],
    warning: ['#F5D7A1', '#C47C12'],
    danger: ['#FCA5A5', palette.coralDeep],
  },
  blurTint: 'light',
};

const dark: Theme = {
  scheme: 'dark',
  color: {
    background: '#06110F',
    surface: '#0E1C19',
    surfaceMuted: '#152420',
    surfaceRaised: '#1A2C27',
    border: 'rgba(210, 240, 230, 0.08)',
    borderStrong: 'rgba(210, 240, 230, 0.16)',
    text: '#F1F7F4',
    textMuted: '#A3BDB4',
    textFaint: '#6F8A80',
    brand: palette.teal400,
    brandSoft: 'rgba(45, 212, 191, 0.16)',
    onBrand: '#FFFFFF',
    accent: palette.champagne,
    success: palette.mint,
    warning: palette.amber,
    danger: palette.coral,
    glass: 'rgba(10, 28, 24, 0.62)',
    glassBorder: 'rgba(180, 230, 214, 0.12)',
    scrim: 'rgba(2, 8, 7, 0.66)',
    highlight: 'rgba(255, 255, 255, 0.10)',
  },
  gradient: {
    brand: [palette.teal400, palette.teal600, palette.teal800],
    aurora: ['#0C2420', '#10201C', '#06110F'],
    surfaceFade: ['rgba(6,17,15,0)', 'rgba(6,17,15,0.94)'],
    hero: ['#115E59', '#0D9488', '#042F2E'],
    gold: [palette.gold, '#A8844A'],
    success: [palette.mint, '#0F766E'],
    warning: [palette.gold, '#C47C12'],
    danger: ['#FCA5A5', palette.coralDeep],
  },
  blurTint: 'dark',
};

export const themes: Record<ColorScheme, Theme> = { light, dark };

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
      shadowColor: scheme === 'dark' ? '#000000' : '#0B1C18',
      shadowOpacity: scheme === 'dark' ? config.opacity * 2.1 : config.opacity,
      shadowRadius: config.radius,
      shadowOffset: { width: 0, height: config.offset },
    },
    android: { elevation: config.elevation },
    default: {
      boxShadow: `0px ${config.offset}px ${config.radius}px rgba(11, 28, 24, ${config.opacity})`,
    },
  }) as ViewStyle;
}

export const motion = {
  spring: { damping: 18, stiffness: 190, mass: 0.9 },
  springSoft: { damping: 24, stiffness: 140, mass: 1 },
  springSnappy: { damping: 16, stiffness: 340, mass: 0.55 },
  duration: { fast: 160, base: 260, slow: 420 },
} as const;
