import { withBase } from './base-path';
import type { Lang } from './types';

/** Language-specific hrefs and locale tags, declared once for every consumer. */

export function homeHref(lang: Lang): string {
  return withBase(lang === 'es' ? '/es/' : '/');
}

export function cvPageHref(lang: Lang): string {
  return withBase(lang === 'es' ? '/cv/es/' : '/cv/');
}

export function cvPdfHref(lang: Lang): string {
  return withBase(lang === 'es' ? '/cv/angel-canovas-cv-es.pdf' : '/cv/angel-canovas-cv-en.pdf');
}

export function localeTag(lang: Lang): string {
  return lang === 'es' ? 'es-ES' : 'en-US';
}
