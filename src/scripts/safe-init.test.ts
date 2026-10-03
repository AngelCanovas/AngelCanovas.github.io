import { afterEach, describe, expect, it, vi } from 'vitest';

import { safeInit } from './safe-init';

describe('safeInit', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs the module', () => {
    const init = vi.fn();
    safeInit(init);
    expect(init).toHaveBeenCalledTimes(1);
  });

  it('swallows the failure so the next module still runs', () => {
    const error = new Error('boom');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failing = vi.fn(() => {
      throw error;
    });
    const next = vi.fn();

    expect(() => safeInit(failing)).not.toThrow();
    safeInit(next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith('[init]', error);
  });
});
