import { onScroll, smoothBehavior } from './scroll-utils';

/** Show a "back to top" button after scrolling and smooth-scroll on click. */
export function initScrollTop(): void {
  const control = document.getElementById('scroll-top');
  if (!control) return;
  const sync = () => {
    const visible = window.scrollY > 100;
    if (control.classList.contains('active') !== visible) {
      control.classList.toggle('active', visible);
    }
  };
  const returnToStart = (event: MouseEvent) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: smoothBehavior() });
  };
  control.addEventListener('click', returnToStart);
  document.addEventListener('scroll', onScroll(sync), { passive: true });
  window.addEventListener('load', sync, { once: true });
  sync();
}
