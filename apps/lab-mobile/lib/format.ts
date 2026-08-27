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

export const CURRENCY = '₪';

const group = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * `₪1,240` / `₪1,240.50`. Formatted by hand rather than through `Intl` so the
 * digits stay Latin and the symbol stays leading in all three languages; render
 * the result with `ltr` so it never reverses inside a right-to-left line.
 */
export function formatMoney(amount: number): string {
  const rounded = Math.round(Math.abs(amount) * 100) / 100;
  const [whole, cents] = rounded.toFixed(2).split('.');
  const sign = amount < 0 ? '-' : '';
  return `${sign}${CURRENCY}${group(whole)}${cents === '00' ? '' : `.${cents}`}`;
}

/** `₪18.4k` — for stat tiles and chart axes, where the full number will not fit. */
export function formatMoneyShort(amount: number): string {
  const value = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (value >= 1_000_000) return `${sign}${CURRENCY}${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 10_000) return `${sign}${CURRENCY}${Math.round(value / 1000)}k`;
  if (value >= 1000) return `${sign}${CURRENCY}${(value / 1000).toFixed(1)}k`;
  return formatMoney(amount);
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
