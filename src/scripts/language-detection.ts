import { homeHref } from '../lib/routes';
import { isBotUserAgent } from '../lib/bots';
import { isLang, resolveLang, type Lang } from '../lib/types';
import { LANGUAGE_KEY, setLanguagePreference } from './navigation';

const SPANISH_PATH = homeHref('es');

/**
 * Best-effort automatic language routing for the default (English) entry page:
 *
 * 1. a stored preference wins;
 * 2. otherwise, a Spanish browser language redirects to `/es/`.
 *
 * Only the English page ever redirects (shared `/es/` links are never bounced),
 * query string and hash are preserved, and crawlers, automation browsers and
 * history navigations are never redirected, so Back always undoes a change.
 */
export function initLanguageDetection(): void {
  if (isBotUserAgent(navigator.userAgent ?? '')) return;

  const lang: Lang = resolveLang(document.documentElement.lang);
  if (lang !== 'en') return;

  // A page restored from the bfcache never runs this script again, so the
  // realignment has to listen for the persisted `pageshow` too.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) realignPreference(lang);
  });

  if (isHistoryNavigation()) {
    // Back/Forward: the visitor is looking at the language they chose, so the
    // stored preference follows the visible page. Otherwise a reload (or the
    // EN link) would bounce them to the language they just left.
    realignPreference(lang);
    return;
  }

  let stored: string | null = null;
  try {
    stored = localStorage.getItem(LANGUAGE_KEY);
  } catch {
    /* storage unavailable */
  }

  if (isLang(stored)) {
    if (stored === 'es') redirect(SPANISH_PATH);
    return;
  }

  if ((navigator.language || '').toLowerCase().startsWith('es')) {
    redirect(SPANISH_PATH);
  }
}

function isHistoryNavigation(): boolean {
  if (typeof performance?.getEntriesByType !== 'function') return false;
  const navigationEntry = performance.getEntriesByType('navigation')[0] as
    PerformanceNavigationTiming | undefined;
  return navigationEntry?.type === 'back_forward';
}

/** Align the stored preference with the language the visitor is actually seeing. */
function realignPreference(lang: Lang): void {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (isLang(stored) && stored !== lang) setLanguagePreference(lang);
  } catch {
    /* storage unavailable */
  }
}

function redirect(path: string): void {
  window.location.replace(path + window.location.search + window.location.hash);
}
