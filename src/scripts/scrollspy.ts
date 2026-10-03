import { onScroll } from './scroll-utils';

/** The reading cursor sits 200px below the viewport top. Resolve destinations
 * once, then measure the document rectangles together before painting links. */
export function initScrollspy(): void {
  const destinations = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('#navmenu a'),
  ).flatMap((link) => {
    const href = link.getAttribute('href') || '';
    const section = href.startsWith('#') ? document.getElementById(href.slice(1)) : null;
    return section ? [{ link, section }] : [];
  });
  const render = () => {
    const selected = new Set(
      destinations
        .filter(({ section }) => {
          const { top, bottom } = section.getBoundingClientRect();
          return top <= 200 && bottom >= 200;
        })
        .map(({ link }) => link),
    );
    for (const { link } of destinations) {
      const current = selected.has(link);
      link.classList.toggle('active', current);
      if (current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };
  render();
  window.addEventListener('load', render, { once: true });
  document.addEventListener('scroll', onScroll(render), { passive: true });
}
