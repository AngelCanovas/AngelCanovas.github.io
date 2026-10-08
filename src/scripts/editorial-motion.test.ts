// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { editorialDepth, initEditorialMotion } from './editorial-motion';

describe('editorial depth', () => {
  it('has a neutral centre and bounded scroll travel', () => {
    expect(editorialDepth(400, 200, 1000)).toBe(0);
    expect(editorialDepth(-10000, 200, 1000)).toBe(10);
    expect(editorialDepth(10000, 200, 1000)).toBe(-10);
  });

  it('is deterministic and handles an unavailable viewport', () => {
    expect(editorialDepth(150, 200, 1000)).toBe(5);
    expect(editorialDepth(150, 200, 0)).toBe(0);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function setup(reduced = false, fine = true) {
  const motion = new EventTarget();
  Object.assign(motion, { matches: reduced });
  vi.stubGlobal('matchMedia', (query: string) =>
    query.includes('reduced-motion') ? motion : { matches: fine },
  );
  const frames: FrameRequestCallback[] = [];
  const schedule = vi.fn((callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.stubGlobal('requestAnimationFrame', schedule);
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  document.body.innerHTML = '<div data-editorial-depth></div>';
  const element = document.querySelector<HTMLElement>('div')!;
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 150, 200, 200));
  return { element, motion, schedule, flush: () => frames.splice(0).forEach((frame) => frame(0)) };
}

describe('editorial motion lifecycle', () => {
  it('coalesces scroll events and removes depth and listeners on cleanup', () => {
    const { element, schedule, flush } = setup();
    const cleanup = initEditorialMotion();
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    expect(schedule).toHaveBeenCalledTimes(1);
    flush();
    expect(element.style.getPropertyValue('--editorial-y')).not.toBe('');
    cleanup();
    expect(element.style.getPropertyValue('--editorial-y')).toBe('');
    schedule.mockClear();
    window.dispatchEvent(new Event('scroll'));
    expect(schedule).not.toHaveBeenCalled();
  });

  it('never starts motion when reduced motion is requested', () => {
    const { element, schedule } = setup(true);
    const cleanup = initEditorialMotion();
    element.dispatchEvent(new MouseEvent('pointermove', { clientX: 180, clientY: 180 }));
    window.dispatchEvent(new Event('scroll'));
    expect(schedule).not.toHaveBeenCalled();
    expect(element.style.length).toBe(0);
    cleanup();
  });

  it('resets depth immediately on a live reduced-motion change and can resume', () => {
    const { element, motion, flush } = setup();
    const cleanup = initEditorialMotion();
    flush();
    Object.assign(motion, { matches: true });
    motion.dispatchEvent(new Event('change'));
    expect(element.style.length).toBe(0);
    Object.assign(motion, { matches: false });
    motion.dispatchEvent(new Event('change'));
    flush();
    expect(element.style.getPropertyValue('--editorial-y')).not.toBe('');
    cleanup();
  });

  it('ignores proximity on touch and updates it on fine input', () => {
    const touch = setup(false, false);
    let cleanup = initEditorialMotion();
    touch.flush();
    touch.element.dispatchEvent(new MouseEvent('pointermove', { clientX: 180, clientY: 180 }));
    touch.flush();
    expect(touch.element.style.getPropertyValue('--editorial-x')).toBe('0px');
    cleanup();
    const mouse = setup();
    cleanup = initEditorialMotion();
    mouse.flush();
    mouse.element.dispatchEvent(new MouseEvent('pointermove', { clientX: 180, clientY: 180 }));
    mouse.flush();
    expect(mouse.element.style.getPropertyValue('--editorial-x')).not.toBe('0px');
    cleanup();
  });

  it('does not schedule frames while the document is hidden', () => {
    const { schedule, flush } = setup();
    const cleanup = initEditorialMotion();
    flush();
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    schedule.mockClear();
    window.dispatchEvent(new Event('scroll'));
    expect(schedule).not.toHaveBeenCalled();
    cleanup();
  });
});
