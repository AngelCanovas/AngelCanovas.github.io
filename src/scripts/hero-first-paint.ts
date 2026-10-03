/** Defer the canvas work until load/idle, with a deadline for stalled loads.
 * Load and the deadline compete for one paint; cleanup cancels every route. */
export function scheduleHeroFirstPaint(paint: () => void): () => void {
  let scheduled = false;
  let cancelled = false;
  let timer: number | undefined;
  let idle: number | undefined;

  const run = () => {
    if (!cancelled) paint();
  };
  const schedule = () => {
    if (scheduled || cancelled) return;
    scheduled = true;
    window.removeEventListener('load', schedule);
    window.clearTimeout(timer);
    if (typeof window.requestIdleCallback === 'function') {
      idle = window.requestIdleCallback(run, { timeout: 250 });
    } else {
      timer = window.setTimeout(run, 80);
    }
  };

  if (document.readyState === 'complete') schedule();
  else {
    window.addEventListener('load', schedule, { once: true });
    timer = window.setTimeout(schedule, 1200);
  }

  return () => {
    cancelled = true;
    window.removeEventListener('load', schedule);
    window.clearTimeout(timer);
    if (idle !== undefined) window.cancelIdleCallback?.(idle);
  };
}
