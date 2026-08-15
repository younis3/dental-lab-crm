import AsyncStorage from '@react-native-async-storage/async-storage';

import { createStore } from '@/lib/store';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'lab-mobile:theme-mode';

const store = createStore<{ mode: ThemeMode }>({ mode: 'system' });

export const useThemeMode = store.use;

export function setThemeMode(mode: ThemeMode) {
  store.set({ mode });
  void AsyncStorage.setItem(STORAGE_KEY, mode);
}

export async function hydrateThemeMode() {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    store.set({ mode: saved });
  }
}
