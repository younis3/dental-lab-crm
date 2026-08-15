import type { Asset } from 'expo-asset';

import type { LocalizedText } from '@/lib/i18n';

/** Opaque asset handle produced by `require` — never a readable path. */
export type ExocadSource = Parameters<typeof Asset.fromModule>[0];

export type ExocadFile = {
  /** Stable id passed to the viewer route. */
  id: string;
  /** Shown verbatim; file names are never translated. */
  fileName: string;
  title: LocalizedText;
  description: LocalizedText;
  source: ExocadSource;
};

/**
 * exocad webview exports that ship inside `assets/exocad`. Metro only follows
 * static `require` calls, so every new export has to be listed here by hand.
 */
export const EXOCAD_FILES: ExocadFile[] = [
  {
    id: 'demo',
    fileName: 'exocad-demo.html',
    title: {
      en: 'Demo case',
      he: 'תיק הדגמה',
      ar: 'حالة تجريبية',
    },
    description: {
      en: 'Sample export with the STL meshes embedded in the page.',
      he: 'קובץ דוגמה שבו קבצי ה-STL משובצים בתוך העמוד.',
      ar: 'ملف نموذجي تُدمج فيه شبكات STL داخل الصفحة.',
    },
    source: require('../assets/exocad/exocad-demo.html') as ExocadSource,
  },
];

export function findExocadFile(id: string | undefined): ExocadFile | undefined {
  return EXOCAD_FILES.find((file) => file.id === id);
}
