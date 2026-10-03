import { onScroll, prefersReducedMotion } from './scroll-utils';

const REVEAL_MARGIN = 80;

/**
 * Scroll reveal without a library: elements tagged `data-aos` fade in the first
 * time they enter the viewport. Elements are only hidden after this module runs
 * (`.aos-ready`), so a no-JS visit, a blocked bundle or `prefers-reduced-motion`
 * always keeps the content visible. The delay comes from `data-aos-delay`.
 */
export function initScrollReveal(): void {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-aos]'));
  if (elements.length === 0) return;
  if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;

  const pending = new Set<HTMLElement>();

  for (const element of elements) {
    // Elements already painted must not fade out: show them immediately and
    // only hide the ones that were never visible (they animate on scroll).
    if (element.getBoundingClientRect().top < window.innerHeight) {
      element.classList.add('aos-animate');
      continue;
    }
    // Enter the hidden state without a transition; otherwise the browser would
    // fade every off-screen element out (1 → 0) before the reveal ever runs.
    element.classList.add('aos-ready', 'aos-preload');
    void element.offsetHeight;
    element.classList.remove('aos-preload');

    const delay = Number(element.dataset.aosDelay);
    if (delay > 0) element.style.transitionDelay = `${delay}ms`;
    pending.add(element);
  }

  if (pending.size === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) reveal(entry.target as HTMLElement);
      }
    },
    { rootMargin: `0px 0px -${REVEAL_MARGIN}px 0px`, threshold: 0 },
  );

  function reveal(element: HTMLElement): void {
    if (!pending.delete(element)) return;
    element.classList.add('aos-animate');
    observer.unobserve(element);
    if (pending.size === 0) {
      observer.disconnect();
      window.removeEventListener('scroll', revealCrossed);
      window.removeEventListener('load', revealCrossed);
      window.removeEventListener('pageshow', revealCrossed);
    }
  }

  // Safety net: a fast scroll (dragging the scrollbar, repeated PageDown, an
  // anchor jump) can move an element from below the viewport to above it
  // between two observer samples, so it never intersects and would stay
  // invisible. Revealing what already crossed the bottom edge keeps the CSS
  // transition for the normal scroll (the observer still fires first there).
  const revealCrossed = onScroll(() => {
    for (const element of pending) {
      if (element.getBoundingClientRect().top < window.innerHeight) reveal(element);
    }
  });

  for (const element of pending) observer.observe(element);

  window.addEventListener('scroll', revealCrossed, { passive: true });
  window.addEventListener('load', revealCrossed);
  window.addEventListener('pageshow', revealCrossed);
}
