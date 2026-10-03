import { content, personal } from '../data/site';
import type { Lang } from './types';
import { siteUrl } from './site-url';

/**
 * Render the full CV as plain Markdown (per llmstxt.org), built from the same
 * `site.ts` content as the website so it can never drift out of sync. Emitted
 * as a static file during the build by `src/pages/llms-full.txt.ts`.
 */
export function buildLlmsFullText(lang: Lang = 'en'): string {
  const c = content[lang];
  const { about, resume, skills, portfolio, notes, contact, cv } = c;
  const lines: string[] = [];

  lines.push(`# ${personal.fullName} — Full CV`, '');
  lines.push(
    `> ${about.role} · ${about.workModel} · ${about.location} · ${personal.email} · ${personal.github} · ${personal.linkedin}`,
    '',
  );

  lines.push(`## ${cv.summary}`, '');
  lines.push(about.summary, '', about.secureSummary, '', about.languages, '');

  lines.push(`## ${resume.experienceTitle}`, '');
  for (const job of resume.experience) {
    lines.push(`### ${job.title} — ${job.company} — ${job.location} — ${job.period}`, '');
    if (job.context) lines.push(job.context, '');
    lines.push(...job.highlights.map((highlight) => `- ${highlight}`), '');
    if (job.stack.length > 0) lines.push(`${cv.stack}: ${job.stack.join(', ')}.`, '');
    for (const assignment of job.assignments) {
      lines.push(`#### ${cv.assignment}: ${assignment.title}`, '');
      lines.push(...assignment.details.map((detail) => `- ${detail}`), '');
    }
  }

  lines.push(`## ${skills.title}`, '');
  for (const group of skills.groups) {
    lines.push(`- ${group.title}: ${group.skills.join(' · ')}`);
  }
  lines.push('');

  lines.push(`## ${resume.educationTitle}`, '');
  for (const entry of resume.education) {
    const detail = entry.detail ? ` ${entry.detail}.` : '';
    lines.push(`- ${entry.degree} — ${entry.school} — ${entry.period}.${detail}`);
  }
  lines.push('');

  lines.push(`## ${resume.certificationsTitle}`, '');
  lines.push(...resume.certifications.map((certification) => `- ${certification}`), '');

  lines.push(`## ${resume.languagesTitle}`, '');
  lines.push(...resume.languages.map(({ language, level }) => `- ${language} — ${level}`), '');

  lines.push(`## ${portfolio.title}`, '');
  for (const project of portfolio.projects) {
    const link = project.link ? ` (${project.link})` : '';
    lines.push(`- ${project.title} — ${project.description} [${project.tags.join(', ')}]${link}`);
    if (project.caseStudy) {
      lines.push(`  - ${portfolio.caseStudyProblem}: ${project.caseStudy.problem}`);
      lines.push(`  - ${portfolio.caseStudyApproach}: ${project.caseStudy.approach}`);
      lines.push(`  - ${portfolio.caseStudyImpact}: ${project.caseStudy.impact}`);
    }
  }
  lines.push('');

  if (notes.enabled) {
    lines.push(`## ${notes.title}`, '');
    for (const note of notes.items) {
      lines.push(`### ${note.title}`, '');
      lines.push(...note.body, '');
      lines.push(`Tags: ${note.tags.join(', ')}.`, '');
    }
  }

  lines.push(`## ${about.homeLab.title}`, '');
  lines.push(about.homeLab.intro, '');
  lines.push(...about.homeLab.points.map((point) => `- ${point}`), '');

  lines.push(`## ${contact.title}`, '');
  lines.push(
    `- Email: ${personal.email}`,
    `- LinkedIn: ${personal.linkedin}`,
    `- GitHub: ${personal.github}`,
    `- Online CV: ${siteUrl}/cv/`,
    `- Online CV (Spanish): ${siteUrl}/cv/es/`,
    `- Website: ${siteUrl}`,
    '',
  );

  return `${lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd()}\n`;
}
