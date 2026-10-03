import { describe, expect, it } from 'vitest';

import { emailParts, obfuscateEmail, safeJson } from './security';

describe('safeJson', () => {
  it('escapes `<` so a payload cannot close the surrounding script tag', () => {
    expect(safeJson({ text: '</script>' })).toBe('{"text":"\\u003c/script>"}');
  });

  it('still produces valid JSON', () => {
    expect(JSON.parse(safeJson({ a: 1, b: 'x' }))).toEqual({ a: 1, b: 'x' });
  });
});

describe('obfuscateEmail', () => {
  it('encodes `@` and `.` as HTML entities', () => {
    expect(obfuscateEmail('aca_dev@hotmail.com')).toBe('aca_dev&#64;hotmail&#46;com');
  });
});

describe('emailParts', () => {
  it('splits the address into user and domain', () => {
    expect(emailParts('aca_dev@hotmail.com')).toEqual({
      user: 'aca_dev',
      domain: 'hotmail.com',
    });
  });
});
