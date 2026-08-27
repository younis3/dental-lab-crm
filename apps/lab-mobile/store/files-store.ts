import AsyncStorage from '@react-native-async-storage/async-storage';

import type { IconName } from '@/components/ui/icon';
import type { Tone } from '@/components/ui/pill';
import { RECENT_FILES, type RecentFile } from '@/lib/mock-data';
import { createStore } from '@/lib/store';

/** The upload kinds the folders screen offers from its upload sheet. */
export type UploadKind = 'scan' | 'photo' | 'document';

export const UPLOAD_META: Record<UploadKind, { icon: IconName; tone: Tone; extension: string }> = {
  scan: { icon: 'cube-outline', tone: 'brand', extension: 'stl' },
  photo: { icon: 'image-outline', tone: 'accent', extension: 'jpg' },
  document: { icon: 'document-text-outline', tone: 'success', extension: 'pdf' },
};

const STORAGE_KEY = 'lab-mobile:files:v1';

const store = createStore<{ recent: RecentFile[] }>({ recent: RECENT_FILES });

function persist(recent: RecentFile[]) {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
}

export function useFiles() {
  return store.use();
}

/**
 * Adds a freshly "uploaded" file to the top of the recent list. There is no real
 * storage layer yet, so the name is synthesised from the kind and a short stamp.
 */
export function addRecentFile(kind: UploadKind) {
  const meta = UPLOAD_META[kind];
  const stamp = new Date().toISOString().slice(11, 16).replace(':', '');

  const file: RecentFile = {
    id: `up-${Date.now()}`,
    name: `${kind}_${stamp}.${meta.extension}`,
    meta: { en: '0 MB · Just now', he: '0 MB · עכשיו' },
    icon: meta.icon,
    tone: meta.tone,
  };

  store.set((prev) => {
    const recent = [file, ...prev.recent];
    persist(recent);
    return { recent };
  });
}

export async function hydrateFiles() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved) as RecentFile[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      store.set({ recent: parsed });
    }
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}
