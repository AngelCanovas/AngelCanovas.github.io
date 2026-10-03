// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

import { initCounters } from './counters';

describe('initCounters', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('cancels every pending frame on cleanup', () => {
    document.body.innerHTML = `
      <span data-count-to="10"></span>
      <span data-count-to="20"></span>`;

    const pending = new Set<number>();
    let nextId = 0;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      nextId += 1;
      pending.add(nextId);
      void callback;
      return nextId;
    });
    const cancelled: number[] = [];
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      cancelled.push(id);
      pending.delete(id);
    });

    const cleanup = initCounters({ reducedMotion: false });
    expect(pending.size).toBe(2);

    cleanup();
    expect(cancelled).toHaveLength(2);
    expect(pending.size).toBe(0);
  });

  it('renders the final value without scheduling frames with reduced motion', () => {
    document.body.innerHTML = '<span data-count-to="4.23" data-count-decimals="2"></span>';

    const schedule = vi.fn(() => 1);
    vi.stubGlobal('requestAnimationFrame', schedule);

    initCounters({ reducedMotion: true, locale: 'en-US' });
    expect(schedule).not.toHaveBeenCalled();
    expect(document.querySelector('[data-count-to]')?.textContent).toBe('4.23');
  });
});
