import { content, personal } from '../data/site';
import type { Lang } from './types';

/**
 * Render the CV as plain text for applicant tracking systems (ATS) and for
 * pasting into application forms. It is built from the same `site.ts` content
 * as the website, uses standard section headings, contains no tables, columns,
 * icons or Markdown, and keeps every experience bullet verbatim.
 *
 * Emitted as a static file by `src/pages/cv/angel-canovas-cv-<lang>.txt.ts`.
 */
export function buildAtsText(lang: Lang = 'en'): string {
  const c = content[lang];
  const { about, resume, skills } = c;
  const lines: string[] = [];

  lines.push(personal.fullName.toUpperCase());
  lines.push(clean(about.role));
  lines.push(`${clean(about.workModel)} - ${clean(about.location)}`);
  lines.push(`Email: ${personal.email}`);
  lines.push(`LinkedIn: ${personal.linkedin}`);
  lines.push(`GitHub: ${personal.github}`);
  lines.push('');

  lines.push('PROFESSIONAL SUMMARY');
  lines.push(clean(about.summary));
  lines.push(clean(about.secureSummary));
  lines.push(clean(about.languages));
  lines.push('');

  lines.push('SKILLS');
  for (const group of skills.groups) {
    lines.push(`${clean(group.title)}: ${group.skills.join(', ')}`);
  }
  lines.push('');

  lines.push('EXPERIENCE');
  for (const job of resume.experience) {
    lines.push(`${clean(job.title)} - ${job.company}, ${job.location} - ${job.period}`);
    if (job.context) lines.push(clean(job.context));
    for (const highlight of job.highlights) {
      lines.push(`- ${clean(highlight)}`);
    }
    if (job.stack.length > 0) {
      lines.push(`Stack: ${job.stack.join(', ')}`);
    }
    for (const assignment of job.assignments) {
      lines.push('');
      lines.push(`Assignment: ${clean(assignment.title)}`);
      for (const detail of assignment.details) {
        lines.push(`- ${clean(detail)}`);
      }
    }
    lines.push('');
  }

  lines.push('EDUCATION');
  for (const entry of resume.education) {
    const detail = entry.detail ? ` ${clean(entry.detail)}.` : '';
    lines.push(`- ${clean(entry.degree)} - ${entry.school} - ${entry.period}.${detail}`);
  }
  lines.push('');

  lines.push('CERTIFICATIONS');
  for (const certification of resume.certifications) {
    lines.push(`- ${clean(certification)}`);
  }
  lines.push('');

  lines.push('LANGUAGES');
  for (const { language, level } of resume.languages) {
    lines.push(`- ${language}: ${clean(level)}`);
  }
  lines.push('');

  lines.push('ADDITIONAL');
  lines.push(clean(about.homeLab.intro));
  for (const point of about.homeLab.points) {
    lines.push(`- ${clean(point)}`);
  }
  lines.push('');

  const text = lines.join('\n').replace(/[—–]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  return `${text.replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
}

/** Normalise prose for plain-text ATS output: no smart dashes or typographic marks. */
function clean(text: string): string {
  return text
    .replace(/[—–]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
