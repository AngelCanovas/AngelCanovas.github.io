// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

import { initCvPrint } from './cv-print';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('initCvPrint', () => {
  it('opens the print dialog when the button is clicked', () => {
    document.body.innerHTML = '<button type="button" data-print-cv>Generate</button>';
    const print = vi.fn();
    window.print = print;
    initCvPrint();

    document.querySelector<HTMLButtonElement>('[data-print-cv]')?.click();
    expect(print).toHaveBeenCalledTimes(1);
  });

  it('does nothing without the button', () => {
    document.body.innerHTML = '';
    expect(() => initCvPrint()).not.toThrow();
  });
});
