import { describe, expect, it } from 'vitest';

import { content, personal } from '../data/site';
import { buildAtsText } from './ats-text';

describe('buildAtsText', () => {
  it.each(['en', 'es', 'fr'] as const)(
    'builds a plain-text CV with standard headings (%s)',
    (lang: 'en' | 'es' | 'fr') => {
      const text = buildAtsText(lang);
      const c = content[lang];

      expect(text).toContain(personal.fullName.toUpperCase());
      expect(text).toContain(personal.email);
      expect(text).toContain(c.cv.summary.toUpperCase());
      expect(text).toContain(c.skills.title.toUpperCase());
      expect(text).toContain(c.resume.experienceTitle.toUpperCase());
      expect(text).toContain(c.resume.educationTitle.toUpperCase());
      expect(text).toContain(c.resume.certificationsTitle.toUpperCase());
      expect(text).toContain(c.resume.languagesTitle.toUpperCase());
      expect(text).toContain(c.resume.experience[0].highlights[0]);
    },
  );

  it('contains no Markdown, tables, tabs or smart dashes', () => {
    const text = buildAtsText('en');
    expect(text).not.toMatch(/^#/m);
    expect(text).not.toMatch(/\|.*\|/);
    expect(text).not.toContain('\t');
    expect(text).not.toMatch(/[—–]/);
    expect(text).not.toMatch(/^\s*[*+]\s/m);
    expect(text).not.toContain(' - .');
  });

  it('keeps every experience bullet verbatim (normalised dashes only)', () => {
    const text = buildAtsText('es');
    for (const job of content.es.resume.experience) {
      for (const highlight of job.highlights) {
        const normalised = highlight.replace(/[—–]/g, '-').replace(/\s+/g, ' ').trim();
        expect(text).toContain(normalised);
      }
    }
  });
});
