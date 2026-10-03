import { describe, expect, it } from 'vitest';

import { content } from '../data/site';
import { getContent, getSiteMeta, isLang, resolveLang } from './i18n';
import { DEFAULT_LANG } from './types';

describe('isLang', () => {
  it('accepts the supported locales', () => {
    expect(isLang('en')).toBe(true);
    expect(isLang('es')).toBe(true);
  });

  it('rejects everything else', () => {
    expect(isLang('fr')).toBe(false);
    expect(isLang(null)).toBe(false);
    expect(isLang(42)).toBe(false);
  });
});

describe('resolveLang', () => {
  it('falls back to the default locale for unknown values', () => {
    expect(resolveLang('de')).toBe(DEFAULT_LANG);
    expect(resolveLang(undefined)).toBe(DEFAULT_LANG);
  });
});

describe('content', () => {
  it('keeps both locales structurally in sync', () => {
    expect(Object.keys(content.en).sort()).toEqual(Object.keys(content.es).sort());
  });

  it('exposes the same number of projects per locale', () => {
    expect(content.en.portfolio.projects).toHaveLength(6);
    expect(content.es.portfolio.projects).toHaveLength(6);
  });
});

describe('getContent / getSiteMeta', () => {
  it('returns localized content and metadata', () => {
    expect(getContent('es').nav.home).toBe('Inicio');
    expect(getContent('en').nav.home).toBe('Home');
    expect(getSiteMeta('en').htmlLang).toBe('en');
    expect(getSiteMeta('es').ogLocale).toBe('es_ES');
  });
});
