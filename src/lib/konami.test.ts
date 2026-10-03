import { describe, expect, it } from 'vitest';

import { createKonamiTracker, KONAMI_SEQUENCE } from './konami';

describe('createKonamiTracker', () => {
  it('fires only after the complete sequence', () => {
    const track = createKonamiTracker();
    const results = KONAMI_SEQUENCE.map((key) => track(key));
    expect(results.slice(0, -1).every((value) => value === false)).toBe(true);
    expect(results.at(-1)).toBe(true);
  });

  it('is case-insensitive for the letter keys', () => {
    const track = createKonamiTracker(['a', 'b']);
    expect(track('A')).toBe(false);
    expect(track('B')).toBe(true);
  });

  it('restarts after a wrong key, keeping a matching first key', () => {
    const track = createKonamiTracker(['a', 'b']);
    expect(track('x')).toBe(false);
    expect(track('a')).toBe(false);
    expect(track('b')).toBe(true);
  });

  it('can be completed more than once', () => {
    const track = createKonamiTracker(['a', 'b']);
    track('a');
    expect(track('b')).toBe(true);
    track('a');
    expect(track('b')).toBe(true);
  });
});
