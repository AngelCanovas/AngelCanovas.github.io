import { describe, expect, expectTypeOf, it } from 'vitest';

import { content } from '../data/site';
import { getContent } from './i18n';

type NoteItems = readonly {
  title: string;
  tags: readonly string[];
  body: readonly string[];
}[];

function projectSemantics(locale: keyof typeof content) {
  return getContent(locale)
    .portfolio.projects.map((project) =>
      JSON.stringify([project.category, [...project.tags].sort(), project.featured]),
    )
    .sort();
}

describe.each(['en', 'es'] as const)('content invariants: %s', (locale) => {
  const { portfolio, notes } = getContent(locale);

  it('keeps unpublished notes disabled and empty', () => {
    expect(notes.enabled, `${locale}: notes must remain disabled`).toBe(false);
    expect(notes.items.length, `${locale}: unpublished notes must remain empty`).toBe(0);
  });

  it('uses unique non-empty category keys distinct from the all-projects filter', () => {
    const keys: string[] = portfolio.categories.map(({ key }) => key);

    expect(new Set(keys).size, `${locale}: duplicate category keys`).toBe(keys.length);
    expect(
      keys.every((key) => key.length > 0 && !/\s/.test(key) && key !== '*'),
      `${locale}: invalid or reserved category key`,
    ).toBe(true);
  });

  it('provides a card label for exactly the declared categories', () => {
    const keys = portfolio.categories.map(({ key }) => key).sort();

    expect(Object.keys(portfolio.categoryLabels).sort(), `${locale}: category label keys`).toEqual(
      keys,
    );
    expect(
      Object.values(portfolio.categoryLabels).every((label) => label.trim().length > 0),
      `${locale}: blank category card label`,
    ).toBe(true);
  });

  it('references existing categories for every project without requiring populated categories', () => {
    const keys = new Set<string>(portfolio.categories.map(({ key }) => key));

    expect(
      portfolio.projects.every((project) => keys.has(project.category)),
      `${locale}: project references an undeclared category`,
    ).toBe(true);
  });

  it('keeps technology tags non-blank, trimmed and unique within each project', () => {
    expect(
      portfolio.projects.every(
        ({ tags }) =>
          new Set(tags).size === tags.length &&
          tags.every((tag) => tag.trim().length > 0 && tag === tag.trim()),
      ),
      `${locale}: invalid or duplicate project tag`,
    ).toBe(true);
  });

  it('keeps the shown and total placeholders consumed by the filter status formatter', () => {
    const placeholders = portfolio.filterStatus.match(/\{[^{}]+\}/g) ?? [];

    expect(placeholders.sort(), `${locale}: filter status placeholders`).toEqual([
      '{shown}',
      '{total}',
    ]);
  });
});

describe('shared content semantics', () => {
  it('declares the same category keys independently of their labels and order', () => {
    const keys = (locale: keyof typeof content) =>
      getContent(locale)
        .portfolio.categories.map(({ key }) => key)
        .sort();

    expect(keys('en')).toEqual(keys('es'));
  });

  it('keeps project category, technology and featured combinations aligned without title matching', () => {
    expect(
      JSON.stringify(projectSemantics('en')) === JSON.stringify(projectSemantics('es')),
      'EN/ES project category, tag or featured semantics differ',
    ).toBe(true);
  });

  it('declares matching readonly note item types even while the arrays are empty', () => {
    expectTypeOf(content.en.notes.items).toEqualTypeOf<NoteItems>();
    expectTypeOf(content.es.notes.items).toEqualTypeOf<NoteItems>();
  });
});
