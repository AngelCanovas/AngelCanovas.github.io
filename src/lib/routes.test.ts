import { describe, expect, it } from 'vitest';

import { cvPageHref, cvPdfHref, homeHref, localeTag } from './routes';

describe('localized routes', () => {
  it('maps every language to its page and PDF paths', () => {
    expect(homeHref('en')).toBe('/CV/');
    expect(homeHref('es')).toBe('/CV/es/');
    expect(cvPageHref('en')).toBe('/CV/cv/');
    expect(cvPageHref('es')).toBe('/CV/cv/es/');
    expect(cvPdfHref('en')).toBe('/CV/cv/angel-canovas-cv-en.pdf');
    expect(cvPdfHref('es')).toBe('/CV/cv/angel-canovas-cv-es.pdf');
  });

  it('maps every language to its number-formatting locale', () => {
    expect(localeTag('en')).toBe('en-US');
    expect(localeTag('es')).toBe('es-ES');
  });
});
