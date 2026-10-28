export const THEME_KEY = 'theme';
export const DEFAULT_THEME = 'dark';

export type Theme = 'light' | 'dark';

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

/** The theme actually in effect: applied choice, stored choice, then the site default. */
function currentTheme(): Theme {
  const applied = document.documentElement.dataset.theme;
  if (applied === 'light' || applied === 'dark') return applied;
  const stored = readStoredTheme();
  if (stored) return stored;
  return DEFAULT_THEME;
}

/**
 * Light/dark toggle: the site opens in dark by default, ignoring the system
 * preference, and stores an explicit choice in `localStorage`. A tiny inline
 * script in `Layout.astro` applies the stored theme before first paint, so
 * there is no flash; this module only keeps the button state and the
 * theme-color metas in sync.
 */
export function initThemeToggle(): void {
  const button = document.querySelector<HTMLElement>('[data-theme-toggle]');
  if (!button) return;

  const metas = Array.from(
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
  ).map((meta) => ({
    meta,
    theme: (meta.dataset.theme === 'dark' ? 'dark' : 'light') as Theme,
  }));

  const syncThemeColorMeta = () => {
    const choice = currentTheme();
    for (const { meta, theme } of metas) {
      meta.media = theme === choice ? 'all' : 'not all';
    }
  };

  const sync = () => {
    const theme = currentTheme();
    document.documentElement.dataset.theme = theme;
    const next = theme === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    const label = next === 'dark' ? button.dataset.labelDark : button.dataset.labelLight;
    if (label) button.setAttribute('aria-label', label);
    syncThemeColorMeta();
  };

  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage can be unavailable (private mode) */
    }
    sync();
  });

  window.addEventListener('storage', (event) => {
    if (event.storageArea !== localStorage || (event.key !== THEME_KEY && event.key !== null)) {
      return;
    }
    const stored = readStoredTheme();
    document.documentElement.dataset.theme = stored ?? DEFAULT_THEME;
    sync();
  });

  sync();
}
