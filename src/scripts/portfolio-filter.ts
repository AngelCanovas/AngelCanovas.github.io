export interface PortfolioFilterOptions {
  buttonSelector?: string;
  itemSelector?: string;
  activeClass?: string;
  hiddenClass?: string;
  emptySelector?: string;
  statusSelector?: string;
}

/**
 * Category filter for the portfolio grid. Buttons carry `data-filter`; items
 * carry `data-category` (space-separated). `*` matches everything.
 *
 * Returns a cleanup function that removes the click listeners.
 */
export function initPortfolioFilter(
  root: HTMLElement,
  options: PortfolioFilterOptions = {},
): () => void {
  const buttonSelector = options.buttonSelector ?? '.filter-btn';
  const itemSelector = options.itemSelector ?? '.portfolio-item';
  const activeClass = options.activeClass ?? 'filter-active';
  const hiddenClass = options.hiddenClass ?? 'is-hidden';
  const emptySelector = options.emptySelector ?? '[data-portfolio-empty]';
  const statusSelector = options.statusSelector ?? '[data-portfolio-status]';

  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>(buttonSelector));
  const items = Array.from(root.querySelectorAll<HTMLElement>(itemSelector));
  const empty = root.querySelector<HTMLElement>(emptySelector);
  const status = root.querySelector<HTMLElement>(statusSelector);
  const statusTemplate = root.dataset.statusTemplate ?? '{shown} / {total}';
  if (buttons.length === 0 || items.length === 0) return () => {};

  function applyFilter(filter: string, announce = false) {
    let visible = 0;
    for (const item of items) {
      const categories = (item.dataset.category ?? '').split(/\s+/);
      const matches = filter === '*' || categories.includes(filter);
      item.classList.toggle(hiddenClass, !matches);
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
        candidate.classList.toggle(activeClass, isActive);
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
