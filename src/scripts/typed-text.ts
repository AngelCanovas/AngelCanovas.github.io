import { prefersReducedMotion } from './scroll-utils';

export interface TypedTextOptions {
  typeDelay?: number;
  deleteDelay?: number;
  holdDelay?: number;
  initialDelay?: number;
  reducedMotion?: boolean;
}

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

export function initTypedText(element: HTMLElement, options: TypedTextOptions = {}): () => void {
  const items = readItems(element);
  if (items.length < 2) return () => {};

  const reducedMotion = options.reducedMotion ?? prefersReducedMotion();
  if (reducedMotion) return () => {};

  const typeDelay = options.typeDelay ?? 85;
  const deleteDelay = options.deleteDelay ?? 40;
  const holdDelay = options.holdDelay ?? 1800;
  const initialDelay = options.initialDelay ?? 1400;

  let itemIndex = 0;
  let charIndex = items[0].length;
  let deleting = false;
  let timer = 0;

  function tick() {
    const current = items[itemIndex];
    charIndex += deleting ? -1 : 1;
    element.textContent = current.slice(0, Math.max(0, charIndex));

    let delay = deleting ? deleteDelay : typeDelay;
    if (!deleting && charIndex >= current.length) {
      delay = holdDelay;
      deleting = true;
    } else if (deleting && charIndex <= 0) {
      deleting = false;
      itemIndex = (itemIndex + 1) % items.length;
      delay = 350;
    }
    timer = window.setTimeout(tick, delay);
  }

  timer = window.setTimeout(tick, initialDelay);
  return () => window.clearTimeout(timer);
}
