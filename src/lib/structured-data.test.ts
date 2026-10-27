import { describe, expect, it } from 'vitest';

import { content, personal } from '../data/site';
import {
  buildPersonSchema,
  buildProfilePageSchema,
  buildWebSiteSchema,
  currentEmployer,
} from './structured-data';

const base = buildPersonSchema({
  lang: 'en',
  url: 'https://angelcanovas.github.io/',
  image: 'https://angelcanovas.github.io/profile.webp',
});

describe('buildPersonSchema', () => {
  it('builds a schema.org Person node with the canonical url and image', () => {
    expect(base['@context']).toBe('https://schema.org');
    expect(base['@type']).toBe('Person');
    expect(base.url).toBe('https://angelcanovas.github.io/');
    expect(base.image).toBe('https://angelcanovas.github.io/profile.webp');
  });

  it('links the public professional profiles', () => {
    expect(base.sameAs).toHaveLength(2);
    expect(base.sameAs.some((url) => new URL(url).hostname === 'github.com')).toBe(true);
    expect(base.sameAs.some((url) => new URL(url).hostname === 'www.linkedin.com')).toBe(true);
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
    expect(base['@id']).toBe('https://angelcanovas.github.io/#person');
    expect(base.description.length).toBeGreaterThan(80);
    expect(base.worksFor?.name).toBe('Capgemini');
    expect(base.alumniOf.map((entry) => entry.name)).toContain('IES Ingeniero de la Cierva');
    expect(base.hasCredential).toHaveLength(3);
    expect(base.hasOccupation.name).toBe(base.jobTitle);
  });

  it('describes the occupation with the published role and skills', () => {
    expect(base.hasOccupation['@type']).toBe('Occupation');
    expect(base.hasOccupation.name).toBe(content.en.about.role);
    expect(base.hasOccupation.skills.length).toBeGreaterThan(0);
  });

  it.each(['en', 'es'] as const)(
    'does not model personal tenure as job requirements in %s',
    (lang) => {
      const schema = buildPersonSchema({
        lang,
        url: 'u',
        image: 'i',
      });
      expect(schema.hasOccupation).not.toHaveProperty('experienceRequirements');
      expect(JSON.stringify(schema)).not.toContain('monthsOfExperience');
    },
  );

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

describe('buildProfilePageSchema', () => {
  it.each([
    ['en', '/'],
    ['es', '/es/'],
    ['en', '/cv/'],
    ['es', '/cv/es/'],
  ] as const)('keeps a common Person identity on the %s profile %s', (lang, path) => {
    const personUrl = 'https://example.test/';
    const url = new URL(path, personUrl).href;
    const schema = buildProfilePageSchema({ lang, url, personUrl, image: `${personUrl}image.jpg` });
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('ProfilePage');
    expect(schema['@id']).toBe(`${url}#profile`);
    expect(schema.url).toBe(url);
    expect(schema.inLanguage).toBe(lang);
    expect(schema.mainEntity['@type']).toBe('Person');
    expect(schema.mainEntity['@id']).toBe(`${personUrl}#person`);
    expect(schema.mainEntity.url).toBe(personUrl);
    expect(schema.mainEntity.jobTitle).toBe(content[lang].about.role);
    expect(schema.mainEntity).not.toHaveProperty('@context');
    expect(schema.mainEntity.hasOccupation).not.toHaveProperty('experienceRequirements');
  });

  it('reuses published Person fields without inventing profile dates or omitted data', () => {
    const url = 'https://example.test/';
    const schema = buildProfilePageSchema({ lang: 'en', url, personUrl: url, image: 'image.jpg' });
    const { '@context': context, ...person } = buildPersonSchema({
      lang: 'en',
      url,
      image: 'image.jpg',
    });
    expect(schema['@context']).toBe(context);
    expect(schema.mainEntity).toEqual(person);
    expect(schema).not.toHaveProperty('dateCreated');
    expect(schema).not.toHaveProperty('dateModified');
    expect(JSON.stringify(schema)).not.toContain(personal.email);
    expect(JSON.stringify(schema)).not.toContain('birthDate');
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
      url: 'https://angelcanovas.github.io/',
      name: 'Angel Cánovas Mula',
    });
    expect(site['@context']).toBe('https://schema.org');
    expect(site['@type']).toBe('WebSite');
    expect(site.url).toBe('https://angelcanovas.github.io/');
    expect(site.inLanguage).toEqual(['en', 'es']);
  });
});
