import { describe, expect, it } from 'vitest';
import { withBase } from './base-path';
import { absoluteUrl, siteUrl } from './site-url';

describe('project URLs', () => {
  it('preserves a case-sensitive base, trailing slash, query and hash', () => {
    expect(withBase('/')).toBe('/CV/');
    expect(withBase('/es/?utm=qa#contact')).toBe('/CV/es/?utm=qa#contact');
    expect(withBase('/CV/cv/')).toBe('/CV/cv/');
    expect(withBase('/sprite.svg', '/CV')).toBe('/CV/sprite.svg');
    expect(withBase('/cv/', '/')).toBe('/cv/');
    expect(() => withBase('//other.example/')).toThrow();
  });
  it('keeps the origin separate from the full project URL', () => {
    expect(siteUrl).toBe('https://angelcanovas.github.io/CV');
    expect(absoluteUrl('/cv/es/')).toBe('https://angelcanovas.github.io/CV/cv/es/');
  });
});
