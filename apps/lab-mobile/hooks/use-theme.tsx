import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { themes, type ColorScheme, type Theme } from '@/constants/design';
import { useThemeMode } from '@/store/theme-store';

const ThemeOverrideContext = createContext<ColorScheme | null>(null);

/** Force a color scheme for a subtree — used to keep login cinematic-dark. */
export function ThemeOverride({ scheme, children }: { scheme: ColorScheme; children: ReactNode }) {
  return <ThemeOverrideContext.Provider value={scheme}>{children}</ThemeOverrideContext.Provider>;
}

export function useTheme(): Theme {
  const override = useContext(ThemeOverrideContext);
  const systemScheme = useColorScheme();
  const { mode } = useThemeMode();
  const scheme: ColorScheme = override ?? (mode === 'system' ? (systemScheme ?? 'light') : mode);
  return themes[scheme];
}
