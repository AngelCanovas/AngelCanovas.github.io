// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initTypedText } from './typed-text';

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
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
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const element = setup();
    initTypedText(element);
    expect(vi.getTimerCount()).toBe(0);
    expect(element.textContent).toBe('AB');
  });

  it('cancels pending changes on cleanup', () => {
    const element = setup();
    const cleanup = initTypedText(element);
    cleanup();
    vi.advanceTimersByTime(10000);
    expect(element.textContent).toBe('AB');
    expect(vi.getTimerCount()).toBe(0);
  });
});
