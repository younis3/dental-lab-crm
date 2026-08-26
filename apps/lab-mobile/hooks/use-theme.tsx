import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { themes, type ColorScheme, type Theme, type ThemeName } from '@/constants/design';
import { useThemeMode } from '@/store/theme-store';

const ThemeOverrideContext = createContext<ThemeName | null>(null);

/** Pins a palette for a subtree — the sign-in flow always uses the logo colours. */
export function ThemeOverride({ scheme, children }: { scheme: ThemeName; children: ReactNode }) {
  return <ThemeOverrideContext.Provider value={scheme}>{children}</ThemeOverrideContext.Provider>;
}

export function useTheme(): Theme {
  const override = useContext(ThemeOverrideContext);
  const systemScheme = useColorScheme();
  const { mode } = useThemeMode();

  // Single return: a branch here previously tripped the experimental React
  // Compiler into miscounting hooks for callers that mix override and
  // non-override renders (e.g. the tab bar), throwing "Rendered fewer hooks
  // than expected" on navigation.
  const scheme: ColorScheme = mode === 'system' ? (systemScheme ?? 'light') : mode;
  return themes[override ?? scheme];
}
