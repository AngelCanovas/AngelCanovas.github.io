import { describe, expect, it } from 'vitest';
import { withBase } from './base-path';
import { absoluteUrl, siteUrl, siteHost } from './site-url';

describe('site URLs', () => {
  it('serves root paths without changing trailing slash, query or hash', () => {
    expect(withBase('/')).toBe('/');
    expect(withBase('/es/?utm=qa#contact')).toBe('/es/?utm=qa#contact');
    expect(withBase('/cv/')).toBe('/cv/');
    expect(withBase('/sprite.svg')).toBe('/sprite.svg');
    expect(() => withBase('//other.example/')).toThrow();
    expect(() => withBase('https://other.example/')).toThrow();
  });
  it('retains generic support for an explicit case-sensitive mount', () => {
    expect(withBase('/cv/', '/CV/')).toBe('/CV/cv/');
    expect(withBase('/CV/cv/', '/CV')).toBe('/CV/cv/');
  });
  it('uses the hosting root for canonical URLs and the visible CV footer', () => {
    expect(siteUrl).toBe('https://angelcanovas.github.io');
    expect(absoluteUrl('/cv/es/')).toBe('https://angelcanovas.github.io/cv/es/');
    expect(siteHost).toBe('angelcanovas.github.io/');
  });
});
