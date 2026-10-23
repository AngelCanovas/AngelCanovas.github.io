// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initTypedText } from './typed-text';

let motion: EventTarget & { matches: boolean };

beforeEach(() => {
  vi.useFakeTimers();
  motion = Object.assign(new EventTarget(), { matches: false });
  vi.stubGlobal('matchMedia', () => motion);
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function setup(payload = '["AB", "CD"]') {
  const element = document.createElement('span');
  element.dataset.typedItems = payload;
  element.textContent = 'AB';
  return element;
}

describe('typed roles', () => {
  it('deletes the first role and types the next without changing the cadence', () => {
    const element = setup();
    const cleanup = initTypedText(element);
    vi.advanceTimersByTime(1400 + 1800 + 40);
    expect(element.textContent).toBe('A');
    vi.advanceTimersByTime(40);
    expect(element.textContent).toBe('');
    vi.advanceTimersByTime(350);
    expect(element.textContent).toBe('C');
    vi.advanceTimersByTime(85);
    expect(element.textContent).toBe('CD');
    cleanup();
  });

  it.each(['not json', 'null', '["AB"]', '[42, "AB", ""]'])(
    'preserves the server text for unusable payload %s',
    (payload) => {
      const element = setup(payload);
      initTypedText(element);
      expect(vi.getTimerCount()).toBe(0);
      expect(element.textContent).toBe('AB');
    },
  );

  it('keeps the server text with reduced motion', () => {
    motion.matches = true;
    const element = setup();
    initTypedText(element);
    expect(vi.getTimerCount()).toBe(0);
    expect(element.textContent).toBe('AB');
  });

  it('finishes the current role and stops when reduced motion is enabled live', () => {
    const element = setup();
    const cleanup = initTypedText(element);
    vi.advanceTimersByTime(1400 + 1800 + 40);
    expect(element.textContent).toBe('A');

    motion.matches = true;
    motion.dispatchEvent(new Event('change'));
    expect(element.textContent).toBe('AB');
    vi.advanceTimersByTime(10000);
    expect(element.textContent).toBe('AB');
    expect(vi.getTimerCount()).toBe(0);

    motion.matches = false;
    motion.dispatchEvent(new Event('change'));
    vi.advanceTimersByTime(1400 + 1800 + 40);
    expect(element.textContent).toBe('A');
    cleanup();
  });

  it('finishes the second role rather than restoring the first when reduced motion is enabled', () => {
    const element = setup();
    const cleanup = initTypedText(element);
    vi.advanceTimersByTime(1400 + 1800 + 40 + 40 + 350);
    expect(element.textContent).toBe('C');
    motion.matches = true;
    motion.dispatchEvent(new Event('change'));
    expect(element.textContent).toBe('CD');
    vi.advanceTimersByTime(10000);
    expect(element.textContent).toBe('CD');
    expect(vi.getTimerCount()).toBe(0);
    cleanup();
  });

  it.each([true, false])(
    'cancels timers and listeners on cleanup, reduced motion %s',
    (initial) => {
      motion.matches = initial;
      const element = setup();
      const cleanup = initTypedText(element);
      cleanup();
      motion.matches = false;
      motion.dispatchEvent(new Event('change'));
      vi.advanceTimersByTime(10000);
      expect(element.textContent).toBe('AB');
      expect(vi.getTimerCount()).toBe(0);
    },
  );
});
