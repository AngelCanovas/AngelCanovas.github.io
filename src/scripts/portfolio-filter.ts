/**
 * Category filter for the portfolio grid. Buttons carry `data-filter`; items
 * carry `data-category` (space-separated). `*` matches everything.
 *
 * Returns a cleanup function that removes the click listeners.
 */
export function initPortfolioFilter(root: HTMLElement): () => void {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('.filter-btn'));
  const items = Array.from(root.querySelectorAll<HTMLElement>('.portfolio-item')).map(
    (element) => ({
      element,
      categories: (element.dataset.category ?? '').split(/\s+/),
    }),
  );
  const empty = root.querySelector<HTMLElement>('[data-portfolio-empty]');
  const status = root.querySelector<HTMLElement>('[data-portfolio-status]');
  const statusTemplate = root.dataset.statusTemplate ?? '{shown} / {total}';
  if (buttons.length === 0 || items.length === 0) return () => {};

  function applyFilter(filter: string, announce = false) {
    let visible = 0;
    for (const { element, categories } of items) {
      const matches = filter === '*' || categories.includes(filter);
      element.classList.toggle('is-hidden', !matches);
      if (matches) visible += 1;
    }
    if (empty) empty.hidden = visible > 0;
    if (announce && status) {
      status.textContent = statusTemplate
        .replace('{shown}', String(visible))
        .replace('{total}', String(items.length));
    }
  }

  const listeners: Array<[HTMLButtonElement, () => void]> = buttons.map((button) => {
    const listener = () => {
      const filter = button.dataset.filter ?? '*';
      for (const candidate of buttons) {
        const isActive = candidate === button;
        candidate.classList.toggle('filter-active', isActive);
        candidate.setAttribute('aria-pressed', String(isActive));
      }
      applyFilter(filter, true);
    };
    button.addEventListener('click', listener);
    return [button, listener];
  });

  applyFilter('*');

  return () => {
    for (const [button, listener] of listeners) button.removeEventListener('click', listener);
  };
}
