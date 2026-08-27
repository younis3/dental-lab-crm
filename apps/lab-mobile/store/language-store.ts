import AsyncStorage from '@react-native-async-storage/async-storage';

import { UI_STRINGS, isRtl, type Lang, type UiStrings } from '@/lib/i18n';
import { createStore } from '@/lib/store';

const STORAGE_KEY = 'lab-mobile:language';

const store = createStore<{ lang: Lang }>({ lang: 'en' });

export type LanguageState = {
  lang: Lang;
  /** Layout direction flag; every row and drawer side keys off this. */
  isRtl: boolean;
  ui: UiStrings;
};

export function useLanguage(): LanguageState {
  const { lang } = store.use();
  return { lang, isRtl: isRtl(lang), ui: UI_STRINGS[lang] };
}

export function setLanguage(lang: Lang) {
  store.set({ lang });
  void AsyncStorage.setItem(STORAGE_KEY, lang);
}

export async function hydrateLanguage() {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  if (saved === 'en' || saved === 'he') {
    store.set({ lang: saved });
  }
}
