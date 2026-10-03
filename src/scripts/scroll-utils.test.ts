// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

import { onScroll } from './scroll-utils';

describe('onScroll', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps dispatching after the callback throws', () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });

    let calls = 0;
    const handler = onScroll(() => {
      calls += 1;
      if (calls === 1) throw new Error('boom');
    });

    expect(() => handler()).toThrow('boom');
    handler();
    expect(calls).toBe(2);
  });

  it('runs at most once per frame', () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });

    const callback = vi.fn();
    const handler = onScroll(callback);

    handler();
    handler();
    handler();
    expect(frames).toHaveLength(1);

    frames[0](0);
    expect(callback).toHaveBeenCalledTimes(1);

    handler();
    expect(frames).toHaveLength(2);
  });
});
