import { prefersReducedMotion } from './scroll-utils';

export interface Quote {
  text: string;
  author: string;
}

export interface QuoteRotatorOptions {
  reducedMotion?: boolean;
  pauseButton?: HTMLButtonElement | null;
}

function readQuotes(root: HTMLElement): Quote[] {
  try {
    const value: unknown = JSON.parse(root.dataset.quotes ?? '[]');
    if (!Array.isArray(value)) return [];
    return value.filter(
      (quote: unknown): quote is Quote =>
        typeof quote === 'object' &&
        quote !== null &&
        'text' in quote &&
        typeof quote.text === 'string' &&
        'author' in quote &&
        typeof quote.author === 'string',
    );
  } catch {
    return [];
  }
}

/**
 * Rotate a quote card at its `data-interval` with a fade transition, pausing while
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

  const quotes = readQuotes(root);
  if (quotes.length < 2) return () => {};

  const interval = Number(root.dataset.interval) || 30000;
  const pauseButton = options.pauseButton ?? null;
  if (options.reducedMotion ?? prefersReducedMotion()) {
    if (pauseButton) pauseButton.hidden = true;
    return () => {};
  }

  let index = Math.max(
    0,
    quotes.findIndex((quote) => quote.text === textEl.textContent),
  );
  let hovering = false;
  let focused = false;
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
    root.classList.add('is-changing');
    window.clearTimeout(pendingTimer);
    pendingTimer = window.setTimeout(update, 320);
  }

  function nextQuote() {
    if (hovering || focused || userPaused) return;
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

  pauseButton?.addEventListener('click', onPauseClick);
  syncPauseButton();

  const timer = window.setInterval(nextQuote, interval);
  const onEnter = () => {
    hovering = true;
  };
  const onLeave = () => {
    hovering = false;
  };
  const onFocusIn = () => {
    focused = true;
  };
  const onFocusOut = (event: FocusEvent) => {
    focused = event.relatedTarget instanceof Node && root.contains(event.relatedTarget);
  };
  root.addEventListener('mouseenter', onEnter);
  root.addEventListener('mouseleave', onLeave);
  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('focusout', onFocusOut);

  return () => {
    window.clearInterval(timer);
    window.clearTimeout(pendingTimer);
    pauseButton?.removeEventListener('click', onPauseClick);
    root.removeEventListener('mouseenter', onEnter);
    root.removeEventListener('mouseleave', onLeave);
    root.removeEventListener('focusin', onFocusIn);
    root.removeEventListener('focusout', onFocusOut);
    root.classList.remove('is-changing');
  };
}
