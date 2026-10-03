/** True when the visitor asked the OS for reduced motion. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Scroll behaviour that respects `prefers-reduced-motion`. */
export function smoothBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

/**
 * Wrap a scroll handler so it runs at most once per animation frame.
 */
export function onScroll(callback: () => void): () => void {
  let ticking = false;
  return () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      try {
        callback();
      } finally {
        ticking = false;
      }
    });
  };
}
