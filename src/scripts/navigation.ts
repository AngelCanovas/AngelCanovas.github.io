import { scrollToSection } from './hash-scroll';

export const LANGUAGE_KEY = 'lang';
const SCROLL_SECTION_KEY = 'portfolio-scroll-section';

/** Persist the visitor's language choice so auto-detection respects it. */
export function setLanguagePreference(value: string): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, value);
  } catch {
    /* storage can be unavailable (private mode) */
  }
}

function currentSectionId(): string {
  const threshold = window.scrollY + 140;
  const passed = Array.from(document.querySelectorAll<HTMLElement>('main section')).filter(
    (section) => section.offsetTop <= threshold,
  );
  return passed[passed.length - 1]?.id ?? '';
}

function readStoredSection(): string | null {
  try {
    return sessionStorage.getItem(SCROLL_SECTION_KEY);
  } catch {
    return null;
  }
}

function restoreScroll(): void {
  const id = readStoredSection();
  if (!id) return;
  try {
    sessionStorage.removeItem(SCROLL_SECTION_KEY);
  } catch {
    /* ignore */
  }
  scrollToSection(id);
}

/**
 * Language switcher: remembers the choice and the section currently in view so
 * the target page can restore the same scroll position, and carries the query
 * string and hash over to the other language.
 */
export function initLanguageSwitch(): void {
  document.querySelectorAll<HTMLAnchorElement>('[data-set-lang]').forEach((element) => {
    element.addEventListener('click', () => {
      const value = element.dataset.setLang;
      if (!value) return;
      if (value === document.documentElement.lang) {
        try {
          sessionStorage.removeItem(SCROLL_SECTION_KEY);
        } catch {
          /* ignore */
        }
        return;
      }
      setLanguagePreference(value);
      const section = currentSectionId() || 'hero';
      try {
        sessionStorage.setItem(SCROLL_SECTION_KEY, section);
      } catch {
        /* ignore */
      }
      const target = new URL(element.href, window.location.href);
      target.search = window.location.search;
      // Point at the section actually in view instead of dragging a stale hash
      // along, which would fight the scroll restoration on the other page.
      target.hash = section === 'hero' ? '' : `#${section}`;
      element.href = target.href;
    });
  });
}

/** Restore the saved section on load, overriding the browser's own restore. */
export function initScrollRestore(): void {
  if (!readStoredSection()) return;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  window.addEventListener(
    'load',
    () => {
      window.requestAnimationFrame(() => {
        restoreScroll();
        // Hand restoration back to the browser: keeping it on 'manual' would
        // break the normal Back/Forward scroll for the rest of the visit.
        if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
      });
    },
    { once: true },
  );

  // If the visit ends before `load` (or on a full navigation away), make sure
  // the browser still saves this entry's scroll position.
  window.addEventListener(
    'pagehide',
    () => {
      if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
    },
    { once: true },
  );
}

/** Standalone language links (e.g. the online CV) only store the preference. */
export function initStandaloneLanguageSwitch(): void {
  document.querySelectorAll<HTMLElement>('[data-set-standalone-lang]').forEach((element) => {
    element.addEventListener('click', () => {
      const value = element.dataset.setStandaloneLang;
      if (value) setLanguagePreference(value);
    });
  });
}
