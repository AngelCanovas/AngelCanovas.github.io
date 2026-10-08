// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest';
import { initStyleToggle, resolveStyle, STYLES, STYLE_KEY } from './style';
import { initThemeToggle } from './theme';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.dataset.style = 'technical';
  document.documentElement.dataset.theme = 'light';
  document.body.innerHTML = `<button data-style-toggle data-label-technical="Technical" data-label-original="Original" data-label-editorial="Editorial"></button><button data-theme-toggle data-label-light="Light" data-label-dark="Dark"></button>`;
});

it('accepts exactly three styles and defaults invalid storage to technical', () => {
  expect(STYLES).toEqual(['technical', 'original', 'editorial']);
  for (const style of STYLES) expect(resolveStyle(style)).toBe(style);
  for (const value of [null, '', 'dark', 'sepia']) expect(resolveStyle(value)).toBe('technical');
});

it('cycles, persists and exposes current and next style independently of theme', () => {
  initStyleToggle();
  initThemeToggle();
  const button = document.querySelector<HTMLButtonElement>('[data-style-toggle]')!;
  expect(button.getAttribute('aria-label')).toBe('Technical. Original');
  for (const style of ['original', 'editorial', 'technical']) {
    button.click();
    expect(document.documentElement.dataset.style).toBe(style);
    expect(button.dataset.style).toBe(style);
    expect(localStorage.getItem(STYLE_KEY)).toBe(style);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(button.title).toBe(button.getAttribute('aria-label'));
  }
  document.querySelector<HTMLButtonElement>('[data-theme-toggle]')!.click();
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(document.documentElement.dataset.style).toBe('technical');
});

it('restores storage and tolerates unavailable storage', () => {
  localStorage.setItem(STYLE_KEY, 'editorial');
  initStyleToggle();
  expect(document.documentElement.dataset.style).toBe('editorial');
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  expect(() => initStyleToggle()).not.toThrow();
  vi.restoreAllMocks();
});

it('applies persisted style in the head bootstrap before client modules', () => {
  const layout = readFileSync('src/layouts/Layout.astro', 'utf8');
  const script = layout.match(/<script is:inline>([\s\S]*?)<\/script>/)?.[1];
  expect(script).toBeTruthy();
  for (const stored of [...STYLES, 'invalid', null]) {
    const root = { dataset: {} as Record<string, string> };
    runInNewContext(script!, {
      document: { documentElement: root },
      localStorage: { getItem: (key: string) => (key === STYLE_KEY ? stored : 'dark') },
    });
    expect(root.dataset.style).toBe(resolveStyle(stored));
    expect(root.dataset.theme).toBe('dark');
  }
});
