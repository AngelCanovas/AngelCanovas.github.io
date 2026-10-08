export function editorialDepth(top: number, height: number, viewport: number): number {
  if (viewport <= 0) return 0;
  return Math.max(-10, Math.min(10, ((viewport / 2 - top - height / 2) / viewport) * 20));
}

export function initEditorialMotion(): () => void {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-editorial-depth]'));
  if (!elements.length) return () => {};
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const proximity = new Map<HTMLElement, number>();
  let frame = 0;
  let stopped = false;

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    proximity.clear();
    for (const element of elements) {
      element.style.removeProperty('--editorial-y');
      element.style.removeProperty('--editorial-x');
    }
  }

  function paint() {
    frame = 0;
    if (motion.matches || document.hidden || stopped) return;
    const measurements = elements.map((element) => ({
      element,
      rect: element.getBoundingClientRect(),
    }));
    for (const { element, rect } of measurements) {
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
      element.style.setProperty(
        '--editorial-y',
        `${editorialDepth(rect.top, rect.height, window.innerHeight).toFixed(2)}px`,
      );
      element.style.setProperty('--editorial-x', `${proximity.get(element) ?? 0}px`);
    }
  }

  function schedule() {
    if (!frame && !motion.matches && !document.hidden && !stopped)
      frame = requestAnimationFrame(paint);
  }

  function syncMotion() {
    reset();
    schedule();
  }

  const listeners = elements.map((element) => {
    const move = (event: PointerEvent) => {
      if (!pointer.matches || motion.matches || event.pointerType === 'touch') return;
      const rect = element.getBoundingClientRect();
      const x = rect.width ? ((event.clientX - rect.left) / rect.width - 0.5) * 8 : 0;
      proximity.set(element, Math.max(-4, Math.min(4, x)));
      schedule();
    };
    const leave = () => {
      proximity.delete(element);
      schedule();
    };
    element.addEventListener('pointermove', move, { passive: true });
    element.addEventListener('pointerleave', leave);
    element.addEventListener('focusin', leave);
    return () => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', leave);
      element.removeEventListener('focusin', leave);
    };
  });
  motion.addEventListener('change', syncMotion);
  pointer.addEventListener?.('change', syncMotion);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('visibilitychange', syncMotion);
  schedule();

  return () => {
    stopped = true;
    reset();
    listeners.forEach((remove) => remove());
    motion.removeEventListener('change', syncMotion);
    pointer.removeEventListener?.('change', syncMotion);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    document.removeEventListener('visibilitychange', syncMotion);
  };
}
