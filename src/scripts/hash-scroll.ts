import { smoothBehavior } from './scroll-utils';

/**
 * Scroll to a section by id, respecting its `scroll-margin-top` (the fixed
 * header would otherwise cover the heading). Returns whether the target exists,
 * so callers can fall back to another destination.
 */
export function scrollToSection(id: string): boolean {
  if (!id) return false;
  const section = document.getElementById(id);
  if (!section) return false;

  const margin = Number.parseInt(getComputedStyle(section).scrollMarginTop, 10) || 0;
  window.scrollTo({ top: section.offsetTop - margin, behavior: smoothBehavior() });
  return true;
}

/**
 * Scroll to the URL hash target on load. `getElementById` ignores malformed
 * hashes (`#123`, `#%`) that would make `querySelector` throw.
 */
export function initHashScroll(): void {
  const run = () => {
    scrollToSection(window.location.hash.slice(1));
  };

  if (document.readyState === 'complete') {
    run();
  } else {
    window.addEventListener('load', run, { once: true });
  }
  // Fonts and late images can move the section after the first paint; re-apply
  // the hash target once they settle so the heading is not left off by a few
  // dozen pixels.
  document.fonts?.ready.then(run).catch(() => {});
}
