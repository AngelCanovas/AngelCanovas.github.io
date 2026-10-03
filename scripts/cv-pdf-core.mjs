import { statSync } from 'node:fs';

/** Shared CV PDF rendering, used by the manual CV PDF refresh script. */
export const CV_PAGES = [
  { lang: 'en', route: '/CV/cv/', file: 'angel-canovas-cv-en.pdf' },
  { lang: 'es', route: '/CV/cv/es/', file: 'angel-canovas-cv-es.pdf' },
];

export const PDF_OPTIONS = {
  format: 'A4',
  printBackground: true,
  margin: { top: '10mm', bottom: '10mm', left: '12mm', right: '12mm' },
};

const MIN_PDF_BYTES = 15_000;

/**
 * Render one CV page from a running server (built preview or dev) into a PDF,
 * validating the structure so a broken page never ships as a download.
 */
export async function renderCvPdf(context, { origin, route, target }) {
  const tab = await context.newPage();
  try {
    await tab.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await tab.emulateMedia({ media: 'print' });
    // The dev-only Astro toolbar must not leak into the PDF.
    await tab.evaluate(() => document.querySelector('astro-dev-toolbar')?.remove());
    await tab.evaluate(() => document.fonts.ready.then(() => undefined));
    await tab.waitForFunction(
      () =>
        document.querySelector('a[data-email-link]')?.getAttribute('href')?.startsWith('mailto:') ??
        false,
      undefined,
      { timeout: 5000 },
    );

    const structure = await tab.evaluate(() => ({
      name: document.querySelector('h1')?.textContent?.trim() ?? '',
      sections: document.querySelectorAll('article.cv-doc section').length,
      legacyIcons: document.querySelectorAll('i[class*="bi-"]').length,
    }));
    if (!structure.name || structure.sections < 7 || structure.legacyIcons > 0) {
      throw new Error(`Unexpected CV structure on ${route}: ${JSON.stringify(structure)}`);
    }

    await tab.pdf({ path: target, ...PDF_OPTIONS });

    const size = statSync(target).size;
    if (size < MIN_PDF_BYTES) throw new Error(`${target} looks empty (${size} bytes)`);
    return { structure, size };
  } finally {
    await tab.close();
  }
}
