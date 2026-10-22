export const THEME_KEY = 'theme';

export type Theme = 'light' | 'dark';

const SYSTEM_MEDIA: Record<Theme, string> = {
  light: '(prefers-color-scheme: light)',
  dark: '(prefers-color-scheme: dark)',
};

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** The theme actually in effect: applied choice, stored choice, then system. */
function currentTheme(): Theme {
  const applied = document.documentElement.dataset.theme;
  if (applied === 'light' || applied === 'dark') return applied;
  const stored = readStoredTheme();
  if (stored) return stored;
  return systemTheme();
}

/**
 * Light/dark toggle: the site starts from the system preference and stores an
 * explicit choice in `localStorage`. A tiny inline script in `Layout.astro`
 * applies the stored theme before first paint, so there is no flash; this
 * module only keeps the button state and the theme-color metas in sync. With no
 * stored choice the metas keep their system media queries, so a live system
 * change still reaches the browser chrome.
 */
export function initThemeToggle(): void {
  const button = document.querySelector<HTMLElement>('[data-theme-toggle]');
  if (!button) return;

  const metas = Array.from(
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
  ).map((meta) => ({
    meta,
    theme: ((meta.getAttribute('media') ?? '').includes('dark') ? 'dark' : 'light') as Theme,
  }));

  const syncThemeColorMeta = () => {
    const stored = readStoredTheme();
    for (const { meta, theme } of metas) {
      meta.media = stored ? (theme === stored ? 'all' : 'not all') : SYSTEM_MEDIA[theme];
    }
  };

  const sync = () => {
    const theme = currentTheme();
    const next = theme === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    const label = next === 'dark' ? button.dataset.labelDark : button.dataset.labelLight;
    if (label) button.setAttribute('aria-label', label);
    syncThemeColorMeta();
  };

  button.addEventListener('click', () => {
    const applied = document.documentElement.dataset.theme;
    const theme = applied === 'light' || applied === 'dark' ? applied : systemTheme();
    const next = theme === 'dark' ? 'light' : 'dark';
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
    if (stored) document.documentElement.dataset.theme = stored;
    else delete document.documentElement.dataset.theme;
    sync();
  });

  if (typeof window.matchMedia === 'function') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (!readStoredTheme()) sync();
    });
  }

  sync();
}
