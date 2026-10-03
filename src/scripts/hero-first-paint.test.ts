// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { scheduleHeroFirstPaint } from './hero-first-paint';

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
  vi.stubGlobal('requestIdleCallback', undefined);
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Hero first paint', () => {
  it('paints once when load arrives before the deadline', () => {
    const paint = vi.fn();
    const cleanup = scheduleHeroFirstPaint(paint);
    window.dispatchEvent(new Event('load'));
    vi.runAllTimers();
    window.dispatchEvent(new Event('load'));
    vi.runAllTimers();
    expect(paint).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('paints once when the deadline wins and load arrives afterwards', () => {
    const paint = vi.fn();
    const cleanup = scheduleHeroFirstPaint(paint);
    vi.advanceTimersByTime(1200);
    window.dispatchEvent(new Event('load'));
    vi.runAllTimers();
    expect(paint).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('cancels both the deadline and the load listener on cleanup', () => {
    const paint = vi.fn();
    const cleanup = scheduleHeroFirstPaint(paint);
    cleanup();
    window.dispatchEvent(new Event('load'));
    vi.runAllTimers();
    expect(paint).not.toHaveBeenCalled();
  });

  it('defers an already loaded page until an idle slot and cancels that slot', () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
    let callback: IdleRequestCallback | undefined;
    vi.stubGlobal('requestIdleCallback', (run: IdleRequestCallback) => {
      callback = run;
      return 7;
    });
    const cancel = vi.fn();
    vi.stubGlobal('cancelIdleCallback', cancel);
    const paint = vi.fn();
    const cleanup = scheduleHeroFirstPaint(paint);
    expect(paint).not.toHaveBeenCalled();
    cleanup();
    expect(cancel).toHaveBeenCalledWith(7);
    // A callback already queued by the browser must remain harmless.
    callback?.({ didTimeout: false, timeRemaining: () => 5 });
    expect(paint).not.toHaveBeenCalled();
  });

  it('paints in the idle callback even if a late load event fires again', () => {
    let callback: IdleRequestCallback | undefined;
    const idle = vi.fn((run: IdleRequestCallback) => {
      callback = run;
      return 7;
    });
    vi.stubGlobal('requestIdleCallback', idle);
    vi.stubGlobal('cancelIdleCallback', vi.fn());
    const paint = vi.fn();
    const cleanup = scheduleHeroFirstPaint(paint);
    vi.advanceTimersByTime(1200);
    window.dispatchEvent(new Event('load'));
    expect(idle).toHaveBeenCalledTimes(1);
    callback?.({ didTimeout: true, timeRemaining: () => 0 });
    expect(paint).toHaveBeenCalledTimes(1);
    cleanup();
  });
});
