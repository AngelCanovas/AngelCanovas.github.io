// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initThemeToggle, THEME_KEY } from './theme';

function setup(): HTMLButtonElement {
  document.documentElement.removeAttribute('data-theme');
  document.head.innerHTML = `
    <meta name="theme-color" content="#f6f3eb" media="all" data-theme="light">
    <meta name="theme-color" content="#191a18" media="not all" data-theme="dark">`;
  document.body.innerHTML = `
    <button
      type="button"
      data-theme-toggle
      data-label-light="Switch to light"
      data-label-dark="Switch to dark"
      aria-pressed="false"
    ></button>`;
  const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!button) throw new Error('fixture not mounted');
  return button;
}

function metaMedia(): string[] {
  return Array.from(
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    (meta) => meta.media,
  );
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('initThemeToggle', () => {
  it('opens in dark by default and toggles to light and back', () => {
    const button = setup();
    initThemeToggle();

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Switch to light');
    expect(metaMedia()).toEqual(['not all', 'all']);

    button.click();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Switch to dark');
    expect(metaMedia()).toEqual(['all', 'not all']);

    button.click();
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
  });

  it('ignores the system preference', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn() }));
    const button = setup();
    initThemeToggle();

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it.each(['light', 'dark'] as const)('starts from a stored %s choice', (choice) => {
    localStorage.setItem(THEME_KEY, choice);
    const button = setup();
    initThemeToggle();

    expect(document.documentElement.dataset.theme).toBe(choice);
    expect(button.getAttribute('aria-pressed')).toBe(String(choice === 'dark'));
    expect(button.getAttribute('aria-label')).toBe(
      choice === 'dark' ? 'Switch to light' : 'Switch to dark',
    );
  });

  it.each([null, 'light', 'dark'] as const)(
    'keeps browser metadata aligned with the visible theme when storage writes fail (%s)',
    (initial) => {
      const button = setup();
      if (initial) localStorage.setItem(THEME_KEY, initial);
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('storage unavailable');
      });
      initThemeToggle();
      button.click();
      const next = initial === 'light' ? 'dark' : 'light';
      expect(document.documentElement.dataset.theme).toBe(next);
      expect(localStorage.getItem(THEME_KEY)).toBe(initial);
      expect(button.getAttribute('aria-pressed')).toBe(String(next === 'dark'));
      expect(metaMedia()).toEqual(next === 'dark' ? ['not all', 'all'] : ['all', 'not all']);
    },
  );

  it('synchronizes a choice from another tab before the next toggle', () => {
    const button = setup();
    initThemeToggle();
    expect(document.documentElement.dataset.theme).toBe('dark');
    button.click();
    expect(document.documentElement.dataset.theme).toBe('light');
    localStorage.setItem(THEME_KEY, 'dark');
    window.dispatchEvent(
      new StorageEvent('storage', { key: THEME_KEY, newValue: 'dark', storageArea: localStorage }),
    );
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    button.click();
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it.each([THEME_KEY, null])(
    'returns to the dark default when storage is cleared for %s',
    (key) => {
      const button = setup();
      initThemeToggle();
      button.click();
      localStorage.clear();
      window.dispatchEvent(new StorageEvent('storage', { key, storageArea: localStorage }));
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(button.getAttribute('aria-pressed')).toBe('true');
      expect(button.getAttribute('aria-label')).toBe('Switch to light');
      expect(metaMedia()).toEqual(['not all', 'all']);
    },
  );

  it.each([true, false])(
    'toggles the visible theme before a storage event, explicit %s',
    (explicit) => {
      const button = setup();
      initThemeToggle();
      if (explicit) button.click();
      const next = explicit ? 'dark' : 'light';
      localStorage.setItem(THEME_KEY, next);
      button.click();
      expect(document.documentElement.dataset.theme).toBe(next);
    },
  );

  it('ignores junk stored values and does nothing without a button', () => {
    localStorage.setItem(THEME_KEY, 'sepia');
    setup();
    initThemeToggle();
    expect(document.documentElement.dataset.theme).toBe('dark');

    document.body.innerHTML = '';
    expect(() => initThemeToggle()).not.toThrow();
  });
});
