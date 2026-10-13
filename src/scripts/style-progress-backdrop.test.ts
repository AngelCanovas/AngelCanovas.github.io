// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { initStyleProgressBackdrop } from './style-progress-backdrop';

let cleanup: () => void;
let intersect: IntersectionObserverCallback;
let resize: ResizeObserverCallback;
let root: HTMLElement;
let frames: Map<number, FrameRequestCallback>;
let queries: Map<string, MediaQueryList>;
let draw: ReturnType<typeof vi.fn>;

function setMedia(media: string, matches: boolean): void {
  const query = queries.get(media)!;
  Object.defineProperty(query, 'matches', { value: matches, configurable: true });
  const event = new Event('change');
  Object.defineProperty(event, 'matches', { value: matches });
  query.dispatchEvent(event);
}

function setHeroVisible(isIntersecting: boolean): void {
  intersect([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);
}

beforeEach(() => {
  document.body.innerHTML = `<section id="hero"></section><div data-style-progress-backdrop data-hero-visible="true" data-style-progress-state="running" style="--style-progress-ratio: 0.4"><canvas data-style-progress-canvas></canvas><canvas data-style-progress-tube-canvas></canvas></div>`;
  root = document.querySelector('[data-style-progress-backdrop]')!;
  draw = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    setTransform: vi.fn(),
    clearRect: draw,
    fillText: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  queries = new Map();
  vi.stubGlobal('matchMedia', (media: string) => {
    if (!queries.has(media)) {
      const query = new EventTarget();
      Object.assign(query, { matches: false, media });
      queries.set(media, query as MediaQueryList);
    }
    return queries.get(media);
  });
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        resize = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  frames = new Map();
  let nextFrame = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  cleanup = initStyleProgressBackdrop();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('does no canvas or animation-frame work behind Hero, including progress and resize events', () => {
  root.dispatchEvent(new CustomEvent('styleprogresschange'));
  window.dispatchEvent(new Event('resize'));
  resize([], {} as ResizeObserver);
  expect(draw).not.toHaveBeenCalled();
  expect(frames.size).toBe(0);
  expect(root.hasAttribute('inert')).toBe(true);
  setHeroVisible(false);
  expect(draw).toHaveBeenCalledTimes(2);
  expect(frames.size).toBe(1);
  setHeroVisible(true);
  expect(frames.size).toBe(0);
  root.dispatchEvent(new CustomEvent('styleprogresschange'));
  expect(draw).toHaveBeenCalledTimes(2);
});

it('cancels drawing at the mobile breakpoint and redraws current progress when restored', () => {
  setHeroVisible(false);
  setMedia('(max-width: 1199px)', true);
  expect(frames.size).toBe(0);
  expect(root.hasAttribute('aria-hidden')).toBe(true);
  draw.mockClear();
  root.style.setProperty('--style-progress-ratio', '0.8');
  root.dispatchEvent(new CustomEvent('styleprogresschange'));
  window.dispatchEvent(new Event('resize'));
  expect(draw).not.toHaveBeenCalled();
  setMedia('(max-width: 1199px)', false);
  expect(draw).toHaveBeenCalledTimes(2);
  expect(frames.size).toBe(1);
  expect(root.hasAttribute('inert')).toBe(false);
});

it('keeps paused and reduced-motion redraws event-driven without pending animation frames', () => {
  setHeroVisible(false);
  root.dataset.styleProgressState = 'paused';
  root.dispatchEvent(new CustomEvent('styleprogresschange'));
  expect(frames.size).toBe(0);
  window.dispatchEvent(new Event('resize'));
  expect(frames.size).toBe(0);
  root.dataset.styleProgressState = 'running';
  setMedia('(prefers-reduced-motion: reduce)', true);
  expect(frames.size).toBe(0);
  draw.mockClear();
  root.dispatchEvent(new CustomEvent('styleprogresschange'));
  expect(draw).toHaveBeenCalledTimes(2);
  expect(frames.size).toBe(0);
  setMedia('(prefers-reduced-motion: reduce)', false);
  expect(frames.size).toBe(1);
  window.dispatchEvent(new Event('resize'));
  resize([], {} as ResizeObserver);
  expect(frames.size).toBe(1);
});

it('suspends printing and hidden tabs, then resumes with one animation loop', () => {
  setHeroVisible(false);
  setMedia('print', true);
  expect(frames.size).toBe(0);
  setMedia('print', false);
  expect(frames.size).toBe(1);
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  document.dispatchEvent(new Event('visibilitychange'));
  expect(frames.size).toBe(0);
  draw.mockClear();
  root.dispatchEvent(new CustomEvent('styleprogresschange'));
  expect(draw).not.toHaveBeenCalled();
  hidden.mockReturnValue(false);
  document.dispatchEvent(new Event('visibilitychange'));
  expect(draw).toHaveBeenCalledTimes(2);
  expect(frames.size).toBe(1);
});

it('removes media and progress listeners when disposed', () => {
  setHeroVisible(false);
  cleanup();
  draw.mockClear();
  expect(frames.size).toBe(0);
  root.dispatchEvent(new CustomEvent('styleprogresschange'));
  setMedia('(max-width: 1199px)', true);
  setMedia('(prefers-reduced-motion: reduce)', true);
  expect(draw).not.toHaveBeenCalled();
  expect(frames.size).toBe(0);
  expect(root.hasAttribute('inert')).toBe(false);
});
