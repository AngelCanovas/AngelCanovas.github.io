# Recruiter readiness

This document records why the site publishes a plain-text CV and how it stays in
sync with the portfolio. It is the implementation note for the changes derived
from the job-search research summarised in `~/cv/GUIA-ALIFEAFTERLAYOFF.md`.

## Plain-text CV for ATS

Applicant tracking systems (ATS) parse PDFs with varying success. Recruiters and
candidates still need a clean, copy-pasteable version for application forms and
for keyword matching. The site therefore emits:

- `/cv/angel-canovas-cv-en.txt`
- `/cv/angel-canovas-cv-es.txt`

Both are generated at build time from the same `src/data/site.ts` content used
by the HTML CV and the PDF. `src/lib/ats-text.ts` renders a single-column
document with standard section headings (`PROFESSIONAL SUMMARY`, `SKILLS`,
`EXPERIENCE`, `EDUCATION`, `CERTIFICATIONS`, `LANGUAGES`, `ADDITIONAL`), no
tables, no Markdown, no tabs, no smart dashes, and no contact details hidden
behind scripts. Every experience bullet is copied verbatim; only typographic
characters are normalised.

The Astro endpoints live in `src/pages/cv/angel-canovas-cv-{en,es}.txt.ts`.
`src/lib/routes.ts` exposes `cvTextHref(lang)` so other surfaces can link to the
files without hard-coding the base path.

## Title metadata

The document title now names the target role instead of the generic `CV` suffix:
`Angel Cánovas Mula — Full-Stack Java Engineer` (EN) and `... — Ingeniero
Full-Stack Java` (ES). This is what search results and browser tabs show when a
recruiter opens the page.

## Verification

```sh
npm test                                  # includes ats-text and route tests
npm run build                             # emits dist/cv/*.txt
head -20 dist/cv/angel-canovas-cv-en.txt
```

The plain-text output is intentionally not linked from the visual CV page: the
PDF remains the primary download, and the `.txt` files are for ATS forms and
copy/paste. Keeping them out of the navigation also keeps the visual regression
references stable.

## Maintenance rule

`src/data/site.ts` is the single source of truth. When experience, skills or
contact details change, the `.txt` files change automatically on the next build;
do not edit files under `public/cv/` or `dist/` by hand. If a new section is
added to the CV, add it to `buildAtsText` and to `src/lib/ats-text.test.ts`.
