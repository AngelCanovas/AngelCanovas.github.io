import { personal } from '../data/site';
import { splitPeriod } from './format';
import { getContent } from './i18n';
import type { Lang } from './types';

export interface PersonSchemaInput {
  lang: Lang;
  /** Canonical URL of the page the schema is embedded in. */
  url: string;
  /** Absolute URL of the profile image. */
  image: string;
  /** Injectable clock, so the experience length stays deterministic in tests. */
  now?: Date;
}

interface PersonLanguage {
  '@type': 'Language';
  name: string;
  alternateName: string;
  description: string;
}

const MAX_SKILLS = 14;
const CREDENTIAL_SEPARATOR = ' — ';

const LANGUAGE_CODES: Record<string, string> = {
  Spanish: 'es',
  Español: 'es',
  English: 'en',
  Inglés: 'en',
  French: 'fr',
  Francés: 'fr',
};

function parseStart(period: string): { year: number; month: number } | null {
  const [year, month] = splitPeriod(period).startIso.split('-');
  if (!year) return null;
  return { year: Number(year), month: Math.max(0, Number(month ?? '1') - 1) };
}

/**
 * The current employer is the job with an open-ended period ("present"), not
 * simply the first entry: reordering the CV must not declare a past employer.
 */
export function currentEmployer(
  experience: ReadonlyArray<{ readonly company: string; readonly period: string }>,
): { '@type': 'Organization'; name: string; url?: string } | undefined {
  const job = experience.find((entry) => /present|actual/i.test(splitPeriod(entry.period).end));
  if (!job) return undefined;
  const url = personal.companyUrls[job.company as keyof typeof personal.companyUrls];
  return {
    '@type': 'Organization',
    name: job.company,
    ...(url ? { url } : {}),
  };
}

/**
 * Build the `schema.org/Person` JSON-LD used for rich search results. Kept pure
 * so it can be unit tested and reused across pages.
 */
export function buildPersonSchema({ lang, url, image, now = new Date() }: PersonSchemaInput) {
  const content = getContent(lang);
  const { about, resume, skills } = content;

  const allSkills = [...new Set(skills.groups.flatMap((group) => group.skills))];
  const schools = [...new Set(resume.education.map((entry) => entry.school))];

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${url}#person`,
    name: personal.fullName,
    alternateName: personal.name,
    url,
    image,
    description: about.summary,
    jobTitle: about.role,
    address: {
      '@type': 'PostalAddress',
      addressLocality: personal.address.locality,
      addressRegion: personal.address.region,
      addressCountry: personal.address.country,
    },
    knowsLanguage: resume.languages.map((entry): PersonLanguage => ({
      '@type': 'Language',
      name: entry.language,
      alternateName: LANGUAGE_CODES[entry.language] ?? '',
      description: entry.level.split(CREDENTIAL_SEPARATOR)[0] ?? entry.level,
    })),
    worksFor: currentEmployer(resume.experience),
    hasOccupation: {
      '@type': 'Occupation',
      name: about.role,
      occupationalCategory: 'Software Development',
      skills: allSkills,
      experienceRequirements: {
        '@type': 'OccupationalExperienceRequirements',
        monthsOfExperience: monthsOfExperience(resume.experience, now),
      },
    },
    alumniOf: schools.map((name) => ({ '@type': 'EducationalOrganization', name })),
    hasCredential: resume.certifications.map((certification) => {
      const [name = certification, issuer = ''] = certification.split(CREDENTIAL_SEPARATOR);
      return {
        '@type': 'EducationalOccupationalCredential',
        name,
        ...(issuer ? { recognizedBy: { '@type': 'Organization', name: issuer } } : {}),
      };
    }),
    sameAs: [personal.github, personal.linkedin],
    knowsAbout: allSkills.slice(0, MAX_SKILLS),
  } as const;
}

function monthsOfExperience(
  experience: ReadonlyArray<{ readonly period: string }>,
  now: Date,
): number {
  const starts = experience
    .map((job) => parseStart(job.period))
    .filter((start): start is { year: number; month: number } => start !== null);
  if (starts.length === 0) return 0;
  const earliest = starts.reduce((min, start) =>
    start.year < min.year || (start.year === min.year && start.month < min.month) ? start : min,
  );
  return Math.max(0, (now.getFullYear() - earliest.year) * 12 + (now.getMonth() - earliest.month));
}

/** `schema.org/WebSite` node for the home page, declared in both site languages. */
export function buildWebSiteSchema({ url, name }: { url: string; name: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    inLanguage: ['en', 'es'],
  } as const;
}
