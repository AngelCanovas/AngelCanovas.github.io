import { prefersReducedMotion } from './scroll-utils';

const TYPE_DELAY = 85;
const DELETE_DELAY = 40;
const HOLD_DELAY = 1800;
const INITIAL_DELAY = 1400;
const NEXT_ITEM_DELAY = 350;

/**
 * Lightweight "typewriter" effect: types each item, holds, deletes it and moves
 * on to the next, looping forever. Respects `prefers-reduced-motion` (in which
 * case the element keeps its server-rendered text).
 */
function readItems(element: HTMLElement): string[] {
  try {
    const parsed: unknown = JSON.parse(element.dataset.typedItems ?? '[]');
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string' && item.length > 0);
    }
  } catch {
    /* malformed payload: keep the server-rendered text */
  }
  return [];
}

export function initTypedText(element: HTMLElement): () => void {
  const items = readItems(element);
  if (items.length < 2 || prefersReducedMotion()) return () => {};

  let itemIndex = 0;
  let charIndex = items[0].length;
  let deleting = false;
  let timer = 0;

  function tick() {
    const current = items[itemIndex];
    charIndex += deleting ? -1 : 1;
    element.textContent = current.slice(0, Math.max(0, charIndex));

    let delay = deleting ? DELETE_DELAY : TYPE_DELAY;
    if (!deleting && charIndex >= current.length) {
      delay = HOLD_DELAY;
      deleting = true;
    } else if (deleting && charIndex <= 0) {
      deleting = false;
      itemIndex = (itemIndex + 1) % items.length;
      delay = NEXT_ITEM_DELAY;
    }
    timer = window.setTimeout(tick, delay);
  }

  timer = window.setTimeout(tick, INITIAL_DELAY);
  return () => window.clearTimeout(timer);
}
