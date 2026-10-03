// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initQuoteRotator } from './quote-rotator';

const QUOTES = [
  { text: 'First quote', author: 'A' },
  { text: 'Second quote', author: 'B' },
  { text: 'Third quote', author: 'C' },
];

function setup(quotes: typeof QUOTES | string = QUOTES) {
  const payload = typeof quotes === 'string' ? quotes : JSON.stringify(quotes);
  document.body.innerHTML = `
    <figure data-quote data-quotes='${payload}' data-interval="1000">
      <blockquote data-quote-text>First quote</blockquote>
      <figcaption data-quote-author>— A</figcaption>
      <button
        type="button"
        data-quote-pause
        aria-pressed="false"
        data-label-pause="Pause"
        data-label-resume="Resume"
      ></button>
    </figure>`;
  const root = document.querySelector<HTMLElement>('[data-quote]');
  const button = document.querySelector<HTMLButtonElement>('[data-quote-pause]');
  if (!root || !button) throw new Error('fixture not mounted');
  return { root, button };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('initQuoteRotator', () => {
  it('rotates to a different quote once the interval elapses', () => {
    const { root } = setup();
    initQuoteRotator(root);

    vi.advanceTimersByTime(1000);
    expect(root.classList.contains('is-changing')).toBe(true);
    vi.advanceTimersByTime(320);

    const text = root.querySelector('[data-quote-text]')?.textContent;
    expect(text).not.toBe('First quote');
    expect(QUOTES.map((quote) => quote.text)).toContain(text);
  });

  it('stops rotating while the pause button is pressed and resumes after', () => {
    const { root, button } = setup();
    initQuoteRotator(root, { pauseButton: button });

    button.click();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Resume');

    vi.advanceTimersByTime(5000);
    expect(root.querySelector('[data-quote-text]')?.textContent).toBe('First quote');

    button.click();
    expect(button.getAttribute('aria-label')).toBe('Pause');
    vi.advanceTimersByTime(1000 + 320);
    expect(root.querySelector('[data-quote-text]')?.textContent).not.toBe('First quote');
  });

  it('does nothing with malformed JSON or a single quote', () => {
    const { root } = setup('not json');
    const cleanup = initQuoteRotator(root);
    vi.advanceTimersByTime(5000);
    expect(root.querySelector('[data-quote-text]')?.textContent).toBe('First quote');
    cleanup();

    document.body.innerHTML = '';
    const single = setup([QUOTES[0]]);
    initQuoteRotator(single.root);
    vi.advanceTimersByTime(5000);
    expect(single.root.querySelector('[data-quote-text]')?.textContent).toBe('First quote');
  });

  it('pauses while the keyboard focus is inside the card', () => {
    const { root } = setup();
    initQuoteRotator(root);

    root.dispatchEvent(new Event('focusin'));
    vi.advanceTimersByTime(5000);
    expect(root.querySelector('[data-quote-text]')?.textContent).toBe('First quote');

    root.dispatchEvent(new Event('focusout'));
    vi.advanceTimersByTime(1000 + 320);
    expect(root.querySelector('[data-quote-text]')?.textContent).not.toBe('First quote');
  });

  it('hides the pause button when the visitor prefers reduced motion', () => {
    const { root, button } = setup();
    const cleanup = initQuoteRotator(root, { reducedMotion: true, pauseButton: button });
    vi.advanceTimersByTime(5000);
    expect(root.querySelector('[data-quote-text]')?.textContent).toBe('First quote');
    expect(button.hidden).toBe(true);

    button.click();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    cleanup();
  });

  it('cancels timers on cleanup', () => {
    const { root } = setup();
    const cleanup = initQuoteRotator(root);
    cleanup();
    vi.advanceTimersByTime(5000);
    expect(root.querySelector('[data-quote-text]')?.textContent).toBe('First quote');
  });

  it('keeps paused under the pointer when keyboard focus leaves', () => {
    const { root } = setup();
    const cleanup = initQuoteRotator(root);
    root.dispatchEvent(new Event('mouseenter'));
    root.dispatchEvent(new Event('focusin'));
    root.dispatchEvent(new FocusEvent('focusout'));
    vi.advanceTimersByTime(5000);
    expect(root.querySelector('[data-quote-text]')?.textContent).toBe('First quote');
    root.dispatchEvent(new Event('mouseleave'));
    vi.advanceTimersByTime(1000 + 320);
    expect(root.querySelector('[data-quote-text]')?.textContent).not.toBe('First quote');
    cleanup();
  });

  it('keeps paused while focus moves between controls within the card', () => {
    const { root, button } = setup();
    const cleanup = initQuoteRotator(root);
    root.dispatchEvent(new Event('focusin'));
    root.dispatchEvent(new FocusEvent('focusout', { relatedTarget: button }));
    vi.advanceTimersByTime(5000);
    expect(root.querySelector('[data-quote-text]')?.textContent).toBe('First quote');
    cleanup();
  });

  it.each(['null', '{}', '[null, 42]', '[{"text": "Missing author"}]'])(
    'ignores a valid JSON payload with an invalid quote shape: %s',
    (payload) => {
      const { root } = setup(payload);
      const cleanup = initQuoteRotator(root);
      vi.advanceTimersByTime(5000);
      expect(root.querySelector('[data-quote-text]')?.textContent).toBe('First quote');
      cleanup();
    },
  );

  it('restores visibility when disposed during a fade', () => {
    const { root } = setup();
    const cleanup = initQuoteRotator(root);
    vi.advanceTimersByTime(1000);
    expect(root.classList.contains('is-changing')).toBe(true);
    cleanup();
    expect(root.classList.contains('is-changing')).toBe(false);
    vi.advanceTimersByTime(320);
    expect(root.querySelector('[data-quote-text]')?.textContent).toBe('First quote');
  });
});
