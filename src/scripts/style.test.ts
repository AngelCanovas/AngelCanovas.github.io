// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest';
import { initStyleToggle, randomStyle, resolveStyle, STYLES, STYLE_KEY } from './style';
import { initThemeToggle } from './theme';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.dataset.style = 'technical';
  document.documentElement.dataset.theme = 'light';
  document.body.innerHTML = `<button data-style-toggle data-label-technical="Blue and green" data-label-original="Original blue" data-label-editorial="Orange"></button><button data-theme-toggle data-label-light="Light" data-label-dark="Dark"></button>`;
});

it('accepts exactly three styles and maps random values to each style', () => {
  expect(STYLES).toEqual(['original', 'editorial', 'technical']);
  for (const style of STYLES) expect(resolveStyle(style)).toBe(style);
  for (const value of [null, '', 'dark', 'sepia']) expect(resolveStyle(value)).toBe('technical');
  expect(randomStyle(() => 0)).toBe('original');
  expect(randomStyle(() => 0.34)).toBe('editorial');
  expect(randomStyle(() => 0.67)).toBe('technical');
  expect(randomStyle(() => 0.999)).toBe('technical');
});

it('cycles through all styles and ignores the previous stored style independently of theme', () => {
  localStorage.setItem(STYLE_KEY, 'editorial');
  initStyleToggle();
  initThemeToggle();
  const button = document.querySelector<HTMLButtonElement>('[data-style-toggle]')!;
  expect(document.documentElement.dataset.style).toBe('technical');
  expect(button.getAttribute('aria-label')).toBe('Blue and green. Original blue');
  for (const style of ['original', 'editorial', 'technical']) {
    button.click();
    expect(document.documentElement.dataset.style).toBe(style);
    expect(button.dataset.style).toBe(style);
    expect(localStorage.getItem(STYLE_KEY)).toBe('editorial');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(button.title).toBe(button.getAttribute('aria-label'));
  }
  document.querySelector<HTMLButtonElement>('[data-theme-toggle]')!.click();
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(document.documentElement.dataset.style).toBe('technical');
});

it('tolerates unavailable storage', () => {
  localStorage.setItem(STYLE_KEY, 'editorial');
  initStyleToggle();
  expect(document.documentElement.dataset.style).toBe('technical');
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  expect(() => initStyleToggle()).not.toThrow();
  vi.restoreAllMocks();
});

it('chooses a random style in the head bootstrap before client modules', () => {
  const layout = readFileSync('src/layouts/Layout.astro', 'utf8');
  const script = layout.match(/<script is:inline>([\s\S]*?)<\/script>/)?.[1];
  expect(script).toBeTruthy();
  for (const [random, expected] of [
    [0, 'original'],
    [0.34, 'editorial'],
    [0.67, 'technical'],
  ] as const) {
    const root = { dataset: {} as Record<string, string> };
    runInNewContext(script!, {
      document: { documentElement: root },
      localStorage: { getItem: (key: string) => (key === STYLE_KEY ? 'editorial' : 'dark') },
      Math: { floor: Math.floor, min: Math.min, random: () => random },
    });
    expect(root.dataset.style).toBe(expected);
    expect(root.dataset.theme).toBe('dark');
  }
});
