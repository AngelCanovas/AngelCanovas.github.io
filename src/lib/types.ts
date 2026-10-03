const LANGS = ['en', 'es'] as const;

export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = 'en';

/** Narrow an unknown value (e.g. `localStorage.lang`) to a supported locale. */
export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

/** Resolve the active locale, falling back to the default for invalid input. */
export function resolveLang(value: unknown): Lang {
  return isLang(value) ? value : DEFAULT_LANG;
}

/**
 * Widen the literal types produced by `as const` so a translation object can be
 * checked for structural parity with the reference locale.
 */
export type DeepWiden<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? readonly DeepWiden<U>[]
        : T extends object
          ? { readonly [K in keyof T]: DeepWiden<T[K]> }
          : T;

/**
 * A start/end date range split into display labels and machine-readable ISO
 * values (`YYYY-MM` when the month is known, `YYYY` otherwise or `''` for an
 * open range such as "present").
 */
export interface Period {
  readonly start: string;
  readonly end: string;
  readonly startIso: string;
  readonly endIso: string;
}
