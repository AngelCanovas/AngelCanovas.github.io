import { describe, expect, it } from 'vitest';

import { easeOutCubic, formatNumber, readingMinutes, splitPeriod } from './format';

describe('splitPeriod', () => {
  it('parses an open-ended range into ISO-aware parts', () => {
    expect(splitPeriod('Jun 2021 — present')).toEqual({
      start: 'Jun 2021',
      end: 'present',
      startIso: '2021-06',
      endIso: '',
    });
  });

  it('parses a closed year range', () => {
    expect(splitPeriod('2024 — 2025')).toEqual({
      start: '2024',
      end: '2025',
      startIso: '2024',
      endIso: '2025',
    });
  });

  it('keeps the Spanish month abbreviations', () => {
    expect(splitPeriod('Mar 2021 — May 2021').startIso).toBe('2021-03');
    expect(splitPeriod('Ene 2020 — Dic 2020').endIso).toBe('2020-12');
  });

  it('treats a single value as an open range with no end', () => {
    expect(splitPeriod('2023')).toEqual({
      start: '2023',
      end: '',
      startIso: '2023',
      endIso: '',
    });
  });

  it('accepts en dashes and hyphens as separators', () => {
    expect(splitPeriod('Jun 2021 – present').end).toBe('present');
    expect(splitPeriod('Jun 2021 - present').end).toBe('present');
  });
});

describe('formatNumber', () => {
  it('applies the locale grouping separator', () => {
    expect(formatNumber(10000, 0, 'en-US')).toBe('10,000');
    expect(formatNumber(10000, 0, 'es-ES')).toBe('10.000');
  });

  it('honours the decimal count', () => {
    expect(formatNumber(4.23, 2, 'en-US')).toBe('4.23');
    expect(formatNumber(4.23, 2, 'es-ES')).toBe('4,23');
    expect(formatNumber(2, 0, 'en-US')).toBe('2');
  });
});

describe('easeOutCubic', () => {
  it('is bounded to [0, 1] and front-loaded', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});

describe('readingMinutes', () => {
  it('never reports less than one minute', () => {
    expect(readingMinutes(['Hello world.'])).toBe(1);
    expect(readingMinutes([])).toBe(1);
  });

  it('rounds the word count at 200 words per minute', () => {
    const paragraph = Array.from({ length: 400 }, () => 'word').join(' ');
    expect(readingMinutes([paragraph])).toBe(2);
    expect(readingMinutes([paragraph, paragraph])).toBe(4);
  });
});
