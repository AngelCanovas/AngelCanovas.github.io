/**
 * Refresh the committed CV PDFs from the online CV pages.
 *
 * This is a manual maintenance command (`npm run cv:pdf`), not part of the
 * build: the ready-made PDFs in `public/cv/` are the default download, and the
 * online CV page offers printing itself as the "generate from the web" option.
 * Serves ./dist over HTTP, renders /cv/ and /cv/es/ with headless Chromium in
 * print media and writes public/cv/angel-canovas-cv-{en,es}.pdf.
 */
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { CV_PAGES, renderCvPdf } from './cv-pdf-core.mjs';
import { startStaticServer } from './serve-dist.mjs';

const DIST = process.argv[2] ?? 'dist';
const OUT = process.argv[3] ?? 'public';

async function main() {
  if (!existsSync(join(DIST, 'cv', 'index.html'))) {
    throw new Error(`No CV pages found in "${DIST}". Run "astro build" first.`);
  }

  mkdirSync(join(OUT, 'cv'), { recursive: true });
  const { server, origin } = await startStaticServer({ root: DIST });
  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 2 });

  try {
    for (const page of CV_PAGES) {
      const target = join(OUT, 'cv', page.file);
      const { structure, size } = await renderCvPdf(context, {
        origin,
        route: page.route,
        target,
      });
      console.log(
        `[cv-pdf] ${page.lang.toUpperCase()}: ${structure.name} -> ${target} (${size} bytes)`,
      );
    }
  } finally {
    await context.close();
    await browser.close();
    server.close();
  }
  console.log('[cv-pdf] done');
}

await main();
