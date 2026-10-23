// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initThemeToggle, THEME_KEY } from './theme';

function setup(): HTMLButtonElement {
  document.documentElement.removeAttribute('data-theme');
  document.head.innerHTML = `
    <meta name="theme-color" content="#f6f3eb" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#191a18" media="(prefers-color-scheme: dark)">`;
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

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('initThemeToggle', () => {
  it('switches to dark, persists it and updates the button state', () => {
    const button = setup();
    initThemeToggle();

    button.click();
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Switch to light');

    button.click();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Switch to dark');
  });

  it('starts from a stored choice', () => {
    localStorage.setItem(THEME_KEY, 'dark');
    const button = setup();
    initThemeToggle();

    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Switch to light');
  });

  it.each([null, 'light', 'dark'] as const)(
    'keeps browser metadata aligned with the visible theme when storage writes fail (%s)',
    (initial) => {
      const button = setup();
      if (initial) {
        localStorage.setItem(THEME_KEY, initial);
        document.documentElement.dataset.theme = initial;
      }
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('storage unavailable');
      });
      initThemeToggle();
      button.click();
      const next = initial === 'dark' ? 'light' : 'dark';
      expect(document.documentElement.dataset.theme).toBe(next);
      expect(localStorage.getItem(THEME_KEY)).toBe(initial);
      expect(button.getAttribute('aria-pressed')).toBe(String(next === 'dark'));
      expect(
        Array.from(
          document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
          (meta) => meta.media,
        ),
      ).toEqual(next === 'dark' ? ['not all', 'all'] : ['all', 'not all']);
    },
  );

  it('synchronizes a choice from another tab before the next toggle', () => {
    const button = setup();
    initThemeToggle();
    button.click();
    localStorage.setItem(THEME_KEY, 'light');
    window.dispatchEvent(
      new StorageEvent('storage', { key: THEME_KEY, newValue: 'light', storageArea: localStorage }),
    );
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Switch to dark');
    button.click();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it.each([THEME_KEY, null])('returns to the system when storage is cleared for %s', (key) => {
    const button = setup();
    initThemeToggle();
    button.click();
    localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key, storageArea: localStorage }));
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Switch to dark');
  });

  it.each([THEME_KEY, null])(
    'immediately restores a dark system when an explicit light choice is cleared for %s',
    (key) => {
      vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn() }));
      const button = setup();
      localStorage.setItem(THEME_KEY, 'light');
      document.documentElement.dataset.theme = 'light';
      initThemeToggle();
      if (key) localStorage.removeItem(key);
      else localStorage.clear();
      window.dispatchEvent(new StorageEvent('storage', { key, storageArea: localStorage }));
      expect(document.documentElement.dataset.theme).toBeUndefined();
      expect(button.getAttribute('aria-pressed')).toBe('true');
      expect(button.getAttribute('aria-label')).toBe('Switch to light');
      expect(
        Array.from(
          document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
          (meta) => meta.media,
        ),
      ).toEqual(['(prefers-color-scheme: light)', '(prefers-color-scheme: dark)']);
    },
  );

  it.each([true, false])(
    'toggles the visible theme before a storage event, explicit %s',
    (explicit) => {
      const button = setup();
      initThemeToggle();
      if (explicit) button.click();
      const next = explicit ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      button.click();
      expect(document.documentElement.dataset.theme).toBe(next);
    },
  );

  it('ignores junk stored values and does nothing without a button', () => {
    localStorage.setItem(THEME_KEY, 'sepia');
    setup();
    initThemeToggle();
    expect(document.documentElement.dataset.theme).toBeUndefined();

    document.body.innerHTML = '';
    expect(() => initThemeToggle()).not.toThrow();
  });
});
