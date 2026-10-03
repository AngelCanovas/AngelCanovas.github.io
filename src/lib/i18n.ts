import { content, siteMeta } from '../data/site';
import type { Lang } from './types';

export type { Lang };
export { isLang, resolveLang } from './types';

/** Full site content (navigation, sections, projects, services…). */
export function getContent(lang: Lang) {
  return content[lang];
}

/** Page-level metadata (title, description, Open Graph locale…). */
export function getSiteMeta(lang: Lang) {
  return siteMeta[lang];
}
