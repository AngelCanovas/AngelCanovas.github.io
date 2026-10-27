import { expect, test } from '@playwright/test';
import { JSDOM } from 'jsdom';
import { personal } from '../src/data/site';
import { getContent, getSiteMeta, type Lang } from '../src/lib/i18n';
import { withBase } from '../src/lib/base-path';

const siteUrl = 'https://angelcanovas.github.io';
const absoluteUrl = (path: string) => new URL(withBase(path, '/'), siteUrl).href;

type SchemaNode = Record<string, unknown>;

function schemaObjects(value: unknown): SchemaNode[] {
  if (Array.isArray(value)) return value.flatMap(schemaObjects);
  if (value === null || typeof value !== 'object') return [];
  return [value as SchemaNode, ...Object.values(value).flatMap(schemaObjects)];
}

function hasSchemaType(node: SchemaNode, type: string): boolean {
  const types = [node['@type']].flat();
  return types.includes(type);
}

const routes = [
  {
    path: '/',
    lang: 'en',
    ...getSiteMeta('en'),
    alternateEn: '/',
    alternateEs: '/es/',
    types: ['ProfilePage', 'WebSite'],
    profiles: 1,
    robots: 'index, follow',
  },
  {
    path: '/es/',
    lang: 'es',
    ...getSiteMeta('es'),
    alternateEn: '/',
    alternateEs: '/es/',
    types: ['ProfilePage', 'WebSite'],
    profiles: 1,
    robots: 'index, follow',
  },
  {
    path: '/cv/',
    lang: 'en',
    title: 'Angel Cánovas Mula — Online CV',
    description:
      'Machine-readable online CV of Angel Cánovas Mula, Full-Stack Java Engineer: experience, skills, education, certifications and languages.',
    alternateEn: '/cv/',
    alternateEs: '/cv/es/',
    types: ['ProfilePage'],
    profiles: 1,
    robots: 'index, follow',
  },
  {
    path: '/cv/es/',
    lang: 'es',
    title: 'Angel Cánovas Mula — CV online',
    description:
      'CV online legible por máquinas de Angel Cánovas Mula, Ingeniero Full-Stack Java: experiencia, habilidades, formación, certificaciones e idiomas.',
    alternateEn: '/cv/',
    alternateEs: '/cv/es/',
    types: ['ProfilePage'],
    profiles: 1,
    robots: 'index, follow',
  },
  {
    path: '/404.html',
    lang: 'en',
    title: '404 — Angel Cánovas Mula',
    description: 'Page not found. La página que buscas no existe o se ha movido.',
    alternateEn: '/',
    alternateEs: '/es/',
    types: [],
    profiles: 0,
    robots: 'noindex, follow',
  },
] satisfies {
  path: string;
  lang: Lang;
  title: string;
  description: string;
  alternateEn: string;
  alternateEs: string;
  types: string[];
  profiles: number;
  robots: string;
}[];

for (const route of routes) {
  test(`${route.path} serves coherent metadata and only its authorized profile schema`, async ({
    request,
  }) => {
    const response = await request.get(route.path);
    expect(response.ok()).toBe(true);
    const dom = new JSDOM(await response.text());

    try {
      const document = dom.window.document as Document;
      const canonical = absoluteUrl(route.path);
      const meta = getSiteMeta(route.lang);
      const attribute = (selector: string, name: string) => {
        const elements = document.head.querySelectorAll(selector);
        expect(elements.length, selector).toBe(1);
        return elements[0].getAttribute(name);
      };
      const content = (selector: string) => attribute(selector, 'content');

      expect(document.documentElement.lang).toBe(meta.htmlLang);
      expect(document.head.querySelectorAll('title').length).toBe(1);
      expect(document.title).toBe(route.title);
      expect(content('meta[name="description"]')).toBe(route.description);
      expect(content('meta[name="robots"]')).toBe(route.robots);
      expect(attribute('link[rel="canonical"]', 'href')).toBe(canonical);
      expect(document.head.querySelectorAll('link[hreflang]').length).toBe(3);
      for (const [lang, path] of [
        ['en', route.alternateEn],
        ['es', route.alternateEs],
        ['x-default', route.alternateEn],
      ]) {
        expect(attribute(`link[rel="alternate"][hreflang="${lang}"]`, 'href')).toBe(
          absoluteUrl(path),
        );
      }

      expect(content('meta[property="og:title"]')).toBe(route.title);
      expect(content('meta[property="og:description"]')).toBe(route.description);
      expect(content('meta[property="og:url"]')).toBe(canonical);
      expect(content('meta[property="og:locale"]')).toBe(meta.ogLocale);
      expect(content('meta[property="og:image"]')).toBe(absoluteUrl('/og-image.jpg'));
      expect(content('meta[property="og:image:width"]')).toBe('1200');
      expect(content('meta[property="og:image:height"]')).toBe('630');
      expect(content('meta[name="twitter:card"]')).toBe('summary_large_image');
      expect(content('meta[name="twitter:title"]')).toBe(route.title);
      expect(content('meta[name="twitter:description"]')).toBe(route.description);
      expect(content('meta[name="twitter:image"]')).toBe(absoluteUrl('/og-image.jpg'));

      const schemas = Array.from(
        document.querySelectorAll('script[type="application/ld+json"]'),
      ).map((script) => JSON.parse(script.textContent ?? '') as SchemaNode);
      const nodes = schemaObjects(schemas);
      const profiles = schemas.filter((schema) => schema['@type'] === 'ProfilePage');
      expect(profiles.length).toBe(route.profiles);
      expect(schemas.map((schema) => schema['@type']).sort()).toEqual([...route.types].sort());
      expect(nodes.filter((node) => hasSchemaType(node, 'ProfilePage')).length).toBe(
        route.profiles,
      );
      expect(nodes.filter((node) => hasSchemaType(node, 'Person')).length).toBe(route.profiles);

      for (const profile of profiles) {
        expect(profile['@context']).toBe('https://schema.org');
        expect(profile['@id']).toBe(`${canonical}#profile`);
        expect(profile.url).toBe(canonical);
        expect(profile.inLanguage).toBe(route.lang);
        const person = profile.mainEntity as SchemaNode;
        expect(person['@type']).toBe('Person');
        expect(person['@context']).toBeUndefined();
        expect(person['@id']).toBe(`${siteUrl}/#person`);
        expect(person.url).toBe(`${siteUrl}/`);
        expect(person.name).toBe(personal.fullName);
        expect(person.jobTitle).toBe(getContent(route.lang).about.role);
        expect(person.image).toBe(absoluteUrl('/og-image.jpg'));
      }

      for (const website of schemas.filter((schema) => schema['@type'] === 'WebSite')) {
        expect(website['@context']).toBe('https://schema.org');
        expect(website.url).toBe(`${siteUrl}/`);
        expect(website.name).toBe(personal.fullName);
        expect(website.inLanguage).toEqual(['en', 'es']);
      }

      for (const key of [
        'experienceRequirements',
        'monthsOfExperience',
        'email',
        'telephone',
        'birthDate',
      ]) {
        expect(nodes.filter((node) => Object.hasOwn(node, key)).length, key).toBe(0);
      }
    } finally {
      dom.window.close();
    }
  });
}
