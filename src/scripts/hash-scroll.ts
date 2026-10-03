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
    return;
  }
  window.addEventListener('load', run, { once: true });
}
