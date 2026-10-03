// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initScrollReveal } from './scroll-reveal';

const observe = vi.fn();
const unobserve = vi.fn();
const disconnect = vi.fn();
let notify: (entries: { isIntersecting: boolean; target: HTMLElement }[]) => void;

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: typeof notify) {
        notify = callback;
      }
      observe = observe;
      unobserve = unobserve;
      disconnect = disconnect;
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

function setup(top: number) {
  const element = document.createElement('div');
  element.dataset.aos = 'fade-up';
  const rect = vi.spyOn(element, 'getBoundingClientRect');
  rect.mockReturnValue(new DOMRect(0, top, 50, 50));
  document.body.append(element);
  return { element, rect };
}

describe('scroll reveal lifecycle', () => {
  it('does not observe content already visible on startup', () => {
    const { element } = setup(0);
    initScrollReveal();
    expect(element.classList.contains('aos-animate')).toBe(true);
    expect(observe).not.toHaveBeenCalled();
  });

  it('releases the observer and event listeners after the last reveal', () => {
    const first = setup(1200).element;
    const last = setup(1400).element;
    initScrollReveal();
    notify([{ target: first, isIntersecting: true }]);
    expect(disconnect).not.toHaveBeenCalled();
    notify([{ target: last, isIntersecting: true }]);
    expect(first.classList.contains('aos-animate')).toBe(true);
    expect(last.classList.contains('aos-animate')).toBe(true);
    expect(disconnect).toHaveBeenCalledTimes(1);

    const schedule = vi.fn(() => 1);
    vi.stubGlobal('requestAnimationFrame', schedule);
    for (const event of ['scroll', 'load', 'pageshow']) window.dispatchEvent(new Event(event));
    expect(schedule).not.toHaveBeenCalled();
  });

  it('still reveals a section skipped by a fast scroll', () => {
    const { element, rect } = setup(1200);
    initScrollReveal();
    expect(element.classList.contains('aos-animate')).toBe(false);
    rect.mockReturnValue(new DOMRect(0, -100, 50, 50));
    window.dispatchEvent(new Event('scroll'));
    expect(element.classList.contains('aos-animate')).toBe(true);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
