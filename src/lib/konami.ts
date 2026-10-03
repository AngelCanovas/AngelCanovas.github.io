/** Event dispatched on `window` when the Konami sequence is completed. */
export const KONAMI_EVENT = 'portfolio:konami';

export const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const;

/**
 * Stateful matcher for a key sequence. Returns `true` exactly once the whole
 * sequence has been entered, then starts over. Pressing the first key again
 * after a wrong input restarts the match instead of losing all progress.
 */
export function createKonamiTracker(sequence: readonly string[] = KONAMI_SEQUENCE) {
  const expected = sequence.map((key) => key.toLowerCase());
  let index = 0;

  return (key: string): boolean => {
    const pressed = key.toLowerCase();
    if (pressed === expected[index]) {
      index += 1;
      if (index === expected.length) {
        index = 0;
        return true;
      }
      return false;
    }
    index = pressed === expected[0] ? 1 : 0;
    return false;
  };
}
