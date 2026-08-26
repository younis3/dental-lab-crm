import { interpolate, type UiStrings } from '@/lib/i18n';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Short "how long ago" label, e.g. `12m` / `3h` / `2d`. */
export function formatRelative(iso: string, ui: UiStrings, now: number = Date.now()): string {
  const elapsed = Math.max(0, now - new Date(iso).getTime());

  if (elapsed < MINUTE) return ui.timeJustNow;
  if (elapsed < HOUR) return interpolate(ui.timeMinutes, { count: Math.floor(elapsed / MINUTE) });
  if (elapsed < DAY) return interpolate(ui.timeHours, { count: Math.floor(elapsed / HOUR) });
  return interpolate(ui.timeDays, { count: Math.floor(elapsed / DAY) });
}

/** `Layla Hassan` → `LH`; falls back to the first character for single names. */
export function initials(name: string): string {
  const parts = name
    .replace(/^(Dr|Dr\.)\s+/i, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
