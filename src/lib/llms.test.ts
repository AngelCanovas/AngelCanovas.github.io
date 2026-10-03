import { describe, expect, it } from 'vitest';

import { content, personal } from '../data/site';
import { buildLlmsFullText } from './llms';

const en = buildLlmsFullText('en');
const es = buildLlmsFullText('es');

describe('buildLlmsFullText', () => {
  it('starts with the full name as a top-level heading', () => {
    expect(en.startsWith(`# ${personal.fullName}`)).toBe(true);
    expect(en.endsWith('\n')).toBe(true);
  });

  it('includes every experience entry with all its highlights', () => {
    for (const job of content.en.resume.experience) {
      expect(en).toContain(job.title);
      expect(en).toContain(job.company);
      for (const highlight of job.highlights) expect(en).toContain(highlight);
    }
  });

  it('includes education, certifications, languages and skill groups', () => {
    for (const entry of content.en.resume.education) expect(en).toContain(entry.degree);
    for (const certification of content.en.resume.certifications) {
      expect(en).toContain(certification);
    }
    for (const { language } of content.en.resume.languages) expect(en).toContain(language);
    for (const group of content.en.skills.groups) {
      expect(en).toContain(group.title);
      expect(en).toContain(group.skills[0] ?? group.title);
    }
  });

  it('includes projects, home lab and contact channels', () => {
    for (const project of content.en.portfolio.projects) expect(en).toContain(project.title);
    expect(en).toContain(content.en.about.homeLab.title);
    expect(en).toContain(personal.email);
    expect(en).toContain(personal.github);
    expect(en).toContain(personal.linkedin);
  });

  it('renders the Spanish variant from the Spanish content', () => {
    expect(es).toContain('# ' + personal.fullName);
    expect(es).toContain('## Resumen profesional');
    expect(es).toContain(content.es.resume.experienceTitle);
    expect(es).toContain(content.es.about.role);
  });

  it('keeps the Markdown tidy (no triple blank lines, single trailing newline)', () => {
    expect(en).not.toMatch(/\n{3,}/);
    expect(en.endsWith('\n\n')).toBe(false);
  });
});
