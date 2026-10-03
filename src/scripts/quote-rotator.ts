import { prefersReducedMotion } from './scroll-utils';

export interface Quote {
  text: string;
  author: string;
}

export interface QuoteRotatorOptions {
  interval?: number;
  changeDelay?: number;
  reducedMotion?: boolean;
  pauseButton?: HTMLButtonElement | null;
}

/**
 * Rotate a quote card every `interval` ms with a fade transition, pausing while
 * the pointer hovers it, the keyboard focus is inside it or the user toggles the
 * pause button. Quotes are read from the card's `data-quotes` JSON. With
 * `prefers-reduced-motion` the rotator stays still and the button is hidden.
 *
 * Returns a cleanup function that clears timers and detaches listeners.
 */
export function initQuoteRotator(root: HTMLElement, options: QuoteRotatorOptions = {}): () => void {
  const textEl = root.querySelector<HTMLElement>('[data-quote-text]');
  const authorEl = root.querySelector<HTMLElement>('[data-quote-author]');
  if (!textEl || !authorEl) return () => {};
  const textNode: HTMLElement = textEl;
  const authorNode: HTMLElement = authorEl;

  let quotes: Quote[] = [];
  try {
    quotes = JSON.parse(root.dataset.quotes ?? '[]') as Quote[];
  } catch {
    return () => {};
  }
  if (quotes.length < 2) return () => {};

  const interval = options.interval ?? (Number(root.dataset.interval) || 30000);
  const changeDelay = options.changeDelay ?? 320;
  const pauseButton = options.pauseButton ?? null;
  const reducedMotion = options.reducedMotion ?? prefersReducedMotion();

  let index = Math.max(
    0,
    quotes.findIndex((quote) => quote.text === textEl.textContent),
  );
  let hovering = false;
  let userPaused = false;
  let pendingTimer = 0;

  function show(next: number) {
    index = next;
    const quote = quotes[index];
    const update = () => {
      pendingTimer = 0;
      textNode.textContent = quote.text;
      authorNode.textContent = `— ${quote.author}`;
      root.classList.remove('is-changing');
    };
    if (reducedMotion) {
      update();
      return;
    }
    root.classList.add('is-changing');
    window.clearTimeout(pendingTimer);
    pendingTimer = window.setTimeout(update, changeDelay);
  }

  function nextQuote() {
    if (hovering || userPaused) return;
    const offset = 1 + Math.floor(Math.random() * (quotes.length - 1));
    show((index + offset) % quotes.length);
  }

  function syncPauseButton() {
    if (!pauseButton) return;
    pauseButton.setAttribute('aria-pressed', String(userPaused));
    const label = userPaused ? pauseButton.dataset.labelResume : pauseButton.dataset.labelPause;
    if (label) pauseButton.setAttribute('aria-label', label);
  }

  const onPauseClick = () => {
    userPaused = !userPaused;
    syncPauseButton();
  };

  if (reducedMotion) {
    if (pauseButton) pauseButton.hidden = true;
  } else {
    pauseButton?.addEventListener('click', onPauseClick);
    syncPauseButton();
  }

  const timer = reducedMotion ? 0 : window.setInterval(nextQuote, interval);
  const onEnter = () => {
    hovering = true;
  };
  const onLeave = () => {
    hovering = false;
  };
  root.addEventListener('mouseenter', onEnter);
  root.addEventListener('mouseleave', onLeave);
  root.addEventListener('focusin', onEnter);
  root.addEventListener('focusout', onLeave);

  return () => {
    if (timer) window.clearInterval(timer);
    window.clearTimeout(pendingTimer);
    pauseButton?.removeEventListener('click', onPauseClick);
    root.removeEventListener('mouseenter', onEnter);
    root.removeEventListener('mouseleave', onLeave);
    root.removeEventListener('focusin', onEnter);
    root.removeEventListener('focusout', onLeave);
  };
}
