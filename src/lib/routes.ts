import { withBase } from './base-path';
import type { Lang } from './types';

/** Language-specific hrefs and locale tags, declared once for every consumer. */

const HOME: Record<Lang, string> = { en: '/', es: '/es/', fr: '/fr/' };
const CV_PAGE: Record<Lang, string> = { en: '/cv/', es: '/cv/es/', fr: '/cv/fr/' };
const CV_PDF: Record<Lang, string> = {
  en: '/cv/angel-canovas-cv-en.pdf',
  es: '/cv/angel-canovas-cv-es.pdf',
  fr: '/cv/angel-canovas-cv-fr.pdf',
};
const CV_TEXT: Record<Lang, string> = {
  en: '/cv/angel-canovas-cv-en.txt',
  es: '/cv/angel-canovas-cv-es.txt',
  fr: '/cv/angel-canovas-cv-fr.txt',
};
const LOCALE: Record<Lang, string> = { en: 'en-US', es: 'es-ES', fr: 'fr-FR' };

export function homeHref(lang: Lang): string {
  return withBase(HOME[lang]);
}

export function cvPageHref(lang: Lang): string {
  return withBase(CV_PAGE[lang]);
}

export function cvPdfHref(lang: Lang): string {
  return withBase(CV_PDF[lang]);
}

/** Plain-text CV for ATS forms and copy/paste; generated from the same content. */
export function cvTextHref(lang: Lang): string {
  return withBase(CV_TEXT[lang]);
}

export function localeTag(lang: Lang): string {
  return LOCALE[lang];
}
