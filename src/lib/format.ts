import type { Period } from './types';

/** Dash separator used by the periods in `site.ts` (em dash, en dash or hyphen). */
const PERIOD_SEPARATOR = /\s+[—–-]\s+/;

const MONTHS: Record<string, string> = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
  ene: '01',
  abr: '04',
  ago: '08',
  dic: '12',
};

/** `"Jun 2021"` → `"2021-06"`; `"2024"` → `"2024"`; `"present"` → `""`. */
function toIso(value: string): string {
  const monthFirst = value.match(/^([A-Za-zÁ-ÿ]{3,})\s+(\d{4})/);
  if (monthFirst) {
    const month = MONTHS[monthFirst[1].slice(0, 3).toLowerCase()];
    return month ? `${monthFirst[2]}-${month}` : monthFirst[2];
  }
  return value.match(/^(\d{4})/)?.[1] ?? '';
}

/**
 * Parse a human period such as `"Jun 2021 — present"` or `"2024 — 2025"` into
 * display labels plus the ISO values used by `<time datetime="…">` and by the
 * structured-data builder.
 */
export function splitPeriod(period: string): Period {
  const [start = period, end = ''] = period.split(PERIOD_SEPARATOR);
  return { start, end, startIso: toIso(start), endIso: toIso(end) };
}

/**
 * Locale-aware number formatting used by the impact counters. `4` decimals
 * renders as `"4.23"` in `en-US` and `"4,23"` in `es-ES`.
 */
export function formatNumber(value: number, decimals: number, locale: string): string {
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Cubic ease-out used by the metric counter animation. */
export function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

const WORDS_PER_MINUTE = 200;

/** Estimated reading time of a text, in whole minutes, never below one. */
export function readingMinutes(paragraphs: readonly string[]): number {
  const words = paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
