// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest';
import {
  initStyleToggle,
  randomStyle,
  resolveStyle,
  STYLE_AUTO_INTERVAL_MS,
  STYLE_PROGRESS_WARNING_MS,
  STYLES,
  STYLE_KEY,
} from './style';
import { initThemeToggle } from './theme';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.dataset.style = 'technical';
  document.documentElement.dataset.theme = 'light';
  document.body.innerHTML = `<button data-style-toggle data-label-technical="Blue and green" data-label-original="Original blue" data-label-editorial="Orange" data-label-noir="Ink grayscale"></button><button data-theme-toggle data-label-light="Light" data-label-dark="Dark"></button>`;
});

it('accepts the four styles and a 30-second automatic interval', () => {
  expect(STYLES).toEqual(['original', 'editorial', 'technical', 'noir']);
  expect(STYLE_AUTO_INTERVAL_MS).toBe(30_000);
  expect(STYLE_PROGRESS_WARNING_MS).toBe(5_000);
  for (const style of STYLES) expect(resolveStyle(style)).toBe(style);
  for (const value of [null, '', 'dark', 'sepia']) expect(resolveStyle(value)).toBe('technical');
  expect(randomStyle(() => 0)).toBe('original');
  expect(randomStyle(() => 0.25)).toBe('editorial');
  expect(randomStyle(() => 0.5)).toBe('technical');
  expect(randomStyle(() => 0.75)).toBe('noir');
  expect(randomStyle(() => 0.999)).toBe('noir');
});

it('cycles through all styles and ignores the previous stored style independently of theme', () => {
  localStorage.setItem(STYLE_KEY, 'editorial');
  initStyleToggle();
  initThemeToggle();
  const button = document.querySelector<HTMLButtonElement>('[data-style-toggle]')!;
  expect(document.documentElement.dataset.style).toBe('technical');
  expect(button.getAttribute('aria-label')).toBe('Blue and green. Ink grayscale');
  for (const style of ['noir', 'original', 'editorial', 'technical']) {
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

it('automatically cycles styles and lets the progress bar freeze and resume it', () => {
  vi.useFakeTimers();
  try {
    document.body.innerHTML = `<button data-style-toggle data-label-technical="Blue and green" data-label-original="Original blue" data-label-editorial="Orange" data-label-noir="Ink grayscale"></button><button data-style-progress data-label-running="Pause" data-label-paused="Resume" aria-pressed="false"><span data-style-progress-track></span></button>`;
    initStyleToggle();
    const styleButton = document.querySelector<HTMLButtonElement>('[data-style-toggle]')!;
    const progress = document.querySelector<HTMLButtonElement>('[data-style-progress]')!;

    vi.advanceTimersByTime(STYLE_AUTO_INTERVAL_MS - 1);
    expect(document.documentElement.dataset.style).toBe('technical');
    progress.click();
    expect(progress.getAttribute('aria-pressed')).toBe('true');
    vi.advanceTimersByTime(STYLE_AUTO_INTERVAL_MS * 2);
    expect(document.documentElement.dataset.style).toBe('technical');

    styleButton.click();
    expect(document.documentElement.dataset.style).toBe('noir');
    expect(progress.getAttribute('aria-pressed')).toBe('true');
    vi.advanceTimersByTime(STYLE_AUTO_INTERVAL_MS);
    expect(document.documentElement.dataset.style).toBe('noir');

    progress.click();
    expect(progress.getAttribute('aria-pressed')).toBe('false');
    vi.advanceTimersByTime(1);
    expect(document.documentElement.dataset.style).toBe('original');

    styleButton.click();
    expect(document.documentElement.dataset.style).toBe('editorial');
  } finally {
    vi.useRealTimers();
  }
});

it('updates the accessible progress value while running and freezes it when paused', () => {
  vi.useFakeTimers();
  try {
    document.body.innerHTML = `<button data-style-toggle data-label-technical="Blue and green" data-label-original="Original blue" data-label-editorial="Orange" data-label-noir="Ink grayscale"></button><button data-style-progress data-label-running="Pause" data-label-paused="Resume" aria-pressed="false"><span data-style-progress-track role="progressbar" aria-valuenow="0"></span></button>`;
    initStyleToggle();
    const progress = document.querySelector<HTMLButtonElement>('[data-style-progress]')!;
    const track = document.querySelector<HTMLElement>('[data-style-progress-track]')!;

    vi.advanceTimersByTime(3_000);
    expect(track.getAttribute('aria-valuenow')).toBe('10');

    progress.click();
    expect(progress.getAttribute('aria-pressed')).toBe('true');
    vi.advanceTimersByTime(5_000);
    expect(track.getAttribute('aria-valuenow')).toBe('10');
  } finally {
    vi.useRealTimers();
  }
});

it.each([true, false])('pauses automatic styles for reduced motion, initially %s', (initial) => {
  vi.useFakeTimers();
  const motion = Object.assign(new EventTarget(), { matches: initial });
  vi.stubGlobal('matchMedia', () => motion);
  try {
    document.body.innerHTML = `<button data-style-toggle></button><button data-style-progress data-label-running="Pause" data-label-paused="Resume"><span data-style-progress-track></span></button>`;
    initStyleToggle();
    const progress = document.querySelector<HTMLButtonElement>('[data-style-progress]')!;
    if (!initial) {
      vi.advanceTimersByTime(5_000);
      motion.matches = true;
      motion.dispatchEvent(new Event('change'));
    }
    expect(progress.getAttribute('aria-pressed')).toBe('true');
    expect(progress.getAttribute('aria-label')).toBe('Resume');
    vi.advanceTimersByTime(STYLE_AUTO_INTERVAL_MS * 2);
    expect(document.documentElement.dataset.style).toBe('technical');

    document.querySelector<HTMLButtonElement>('[data-style-toggle]')!.click();
    expect(document.documentElement.dataset.style).toBe('noir');
    vi.advanceTimersByTime(STYLE_AUTO_INTERVAL_MS * 2);
    expect(document.documentElement.dataset.style).toBe('noir');

    motion.matches = false;
    motion.dispatchEvent(new Event('change'));
    expect(progress.getAttribute('aria-pressed')).toBe('true');
    progress.click();
    vi.advanceTimersByTime(STYLE_AUTO_INTERVAL_MS);
    expect(document.documentElement.dataset.style).toBe('original');
  } finally {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  }
});

it('warns on the progress indicator during the last five seconds and pauses the warning', () => {
  vi.useFakeTimers();
  try {
    document.body.innerHTML = `<button data-style-toggle data-label-technical="Blue and green" data-label-original="Original blue" data-label-editorial="Orange" data-label-noir="Ink grayscale"></button><button data-style-progress data-label-running="Pause" data-label-paused="Resume" aria-pressed="false"><span data-style-progress-track role="progressbar" aria-valuenow="0"></span></button>`;
    initStyleToggle();
    const progress = document.querySelector<HTMLElement>('[data-style-progress]')!;

    vi.advanceTimersByTime(STYLE_AUTO_INTERVAL_MS - STYLE_PROGRESS_WARNING_MS - 1_000);
    expect(progress.classList.contains('style-progress--warning')).toBe(false);

    vi.advanceTimersByTime(1_000);
    expect(progress.classList.contains('style-progress--warning')).toBe(true);

    progress.click();
    expect(progress.getAttribute('aria-pressed')).toBe('true');
    expect(progress.classList.contains('style-progress--warning')).toBe(false);
    vi.advanceTimersByTime(STYLE_AUTO_INTERVAL_MS);
    expect(document.documentElement.dataset.style).toBe('technical');

    progress.click();
    expect(progress.classList.contains('style-progress--warning')).toBe(true);
    vi.advanceTimersByTime(STYLE_PROGRESS_WARNING_MS);
    expect(document.documentElement.dataset.style).toBe('noir');
    expect(progress.classList.contains('style-progress--warning')).toBe(false);
  } finally {
    vi.useRealTimers();
  }
});

it('keeps the reading position when the layout moves the viewport during a style change', () => {
  vi.useFakeTimers();
  try {
    document.body.innerHTML = `<button data-style-toggle data-label-technical="Blue and green" data-label-original="Original blue" data-label-editorial="Orange" data-label-noir="Ink grayscale"></button><button data-style-progress data-label-running="Pause" data-label-paused="Resume" aria-pressed="false"><span data-style-progress-track role="progressbar" aria-valuenow="0"></span></button>`;
    let scrollY = 2_400;
    Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scrollY });
    Object.defineProperty(window, 'scrollX', { configurable: true, get: () => 0 });
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      writable: true,
      value: scrollTo,
    });

    initStyleToggle();
    vi.advanceTimersByTime(STYLE_AUTO_INTERVAL_MS);
    expect(document.documentElement.dataset.style).toBe('noir');
    expect(scrollTo).not.toHaveBeenCalled();

    // The engine moves the document while the new style settles.
    scrollY = 0;
    vi.advanceTimersByTime(16);
    expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 2_400, behavior: 'instant' });

    // A visitor scroll gesture hands the viewport back before the guard expires.
    window.dispatchEvent(new Event('wheel'));
    scrollY = 900;
    vi.advanceTimersByTime(1_000);
    expect(scrollTo).toHaveBeenCalledTimes(1);
  } finally {
    vi.restoreAllMocks();
    vi.useRealTimers();
  }
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
    [0.25, 'editorial'],
    [0.5, 'technical'],
    [0.75, 'noir'],
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
