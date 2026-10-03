import { describe, expect, it } from 'vitest';

import { content, personal } from '../data/site';
import { buildPersonSchema, buildWebSiteSchema, currentEmployer } from './structured-data';

const base = buildPersonSchema({
  lang: 'en',
  url: 'https://acanovas.dev/',
  image: 'https://acanovas.dev/profile.webp',
});

describe('buildPersonSchema', () => {
  it('builds a schema.org Person node with the canonical url and image', () => {
    expect(base['@context']).toBe('https://schema.org');
    expect(base['@type']).toBe('Person');
    expect(base.url).toBe('https://acanovas.dev/');
    expect(base.image).toBe('https://acanovas.dev/profile.webp');
  });

  it('links the public professional profiles', () => {
    expect(base.sameAs).toHaveLength(2);
    expect(base.sameAs.some((url) => url.includes('github.com'))).toBe(true);
    expect(base.sameAs.some((url) => url.includes('linkedin.com'))).toBe(true);
  });

  it('localizes the job title', () => {
    const es = buildPersonSchema({ lang: 'es', url: 'u', image: 'i' });
    expect(es.jobTitle).toBe('Ingeniero Full-Stack Java');
  });

  it('exposes a deduplicated, bounded skill list', () => {
    expect(base.knowsAbout.length).toBeLessThanOrEqual(14);
    expect(new Set(base.knowsAbout).size).toBe(base.knowsAbout.length);
  });

  it('describes the person, employer, education and credentials', () => {
    expect(base['@id']).toBe('https://acanovas.dev/#person');
    expect(base.description.length).toBeGreaterThan(80);
    expect(base.worksFor?.name).toBe('Capgemini');
    expect(base.alumniOf.map((entry) => entry.name)).toContain('IES Ingeniero de la Cierva');
    expect(base.hasCredential).toHaveLength(3);
    expect(base.hasOccupation.name).toBe(base.jobTitle);
  });

  it('describes the occupation with skills and experience requirements', () => {
    expect(base.hasOccupation['@type']).toBe('Occupation');
    expect(base.hasOccupation.name).toBe(content.en.about.role);
    expect(base.hasOccupation.skills.length).toBeGreaterThan(0);
    expect(base.hasOccupation.experienceRequirements.monthsOfExperience).toBeGreaterThanOrEqual(48);
  });

  it('counts whole months from the earliest documented start date', () => {
    const schema = buildPersonSchema({
      lang: 'en',
      url: 'u',
      image: 'i',
      now: new Date(2026, 5, 1),
    });
    expect(schema.hasOccupation.experienceRequirements.monthsOfExperience).toBe(63);
  });

  it('never exposes data the CV omits', () => {
    const serialized = JSON.stringify(base);
    expect(serialized).not.toContain(personal.email);
    expect(serialized).not.toContain('+34');
    expect(serialized).not.toContain('dateOfBirth');
  });

  it('links the employer only when a company URL is known', () => {
    expect(base.worksFor?.name).toBe('Capgemini');
    expect(base.worksFor?.url).toBe('https://www.capgemini.com');
  });

  it('maps every CV language to a schema.org Language with its ISO code', () => {
    expect(base.knowsLanguage).toHaveLength(content.en.resume.languages.length);
    const codes = base.knowsLanguage.map((language) => language.alternateName);
    expect(codes).toEqual(['es', 'en', 'fr']);
    const english = base.knowsLanguage.find((language) => language.alternateName === 'en');
    expect(english?.description).toBe('C1');
  });

  it('turns every certification into a credential with its issuer', () => {
    expect(base.hasCredential).toHaveLength(content.en.resume.certifications.length);
    expect(base.hasCredential[0]?.name).toBe('AWS Academy Cloud Foundations');
    expect(base.hasCredential[0]?.recognizedBy?.name).toBe('Amazon Web Services');
  });

  it('lists the schools from the CV without duplicates', () => {
    const names = base.alumniOf.map((school) => school.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain('IES Ingeniero de la Cierva');
  });
});

describe('currentEmployer', () => {
  const present = { company: 'Capgemini', period: 'Jun 2021 — present' };
  const past = { company: 'Acme', period: 'Mar 2021 — May 2021' };

  it('picks the open-ended job even when it is not the first entry', () => {
    const employer = currentEmployer([past, present]);
    expect(employer?.name).toBe('Capgemini');
    expect(employer?.url).toBe('https://www.capgemini.com');
  });

  it('declares no employer when every period is closed', () => {
    expect(currentEmployer([past])).toBeUndefined();
  });

  it('accepts the Spanish "actualidad" wording', () => {
    expect(currentEmployer([{ company: 'Capgemini', period: 'Jun 2021 — actualidad' }])?.name).toBe(
      'Capgemini',
    );
  });
});

describe('buildWebSiteSchema', () => {
  it('builds a WebSite node declared in both site languages', () => {
    const site = buildWebSiteSchema({
      url: 'https://acanovas.dev/',
      name: 'Angel Cánovas Mula',
    });
    expect(site['@context']).toBe('https://schema.org');
    expect(site['@type']).toBe('WebSite');
    expect(site.url).toBe('https://acanovas.dev/');
    expect(site.inLanguage).toEqual(['en', 'es']);
  });
});
