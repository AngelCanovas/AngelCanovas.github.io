/**
 * Render the 1200x630 Open Graph card from the built home page so the social
 * preview always matches the real design. Runs after `astro build` and writes
 * dist/og-image.jpg.
 */
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { startStaticServer } from './serve-dist.mjs';

const DIST = process.argv[2] ?? 'dist';

async function main() {
  const { server, origin } = await startStaticServer({ root: DIST });
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.goto(`${origin}/CV/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const hide = (selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          element.style.setProperty('display', 'none', 'important');
        });
      };
      hide('.header');
      hide('.scroll-top');
      document.querySelectorAll('[data-aos]').forEach((element) => {
        element.style.opacity = '1';
        element.style.transform = 'none';
      });
      const main = document.querySelector('main');
      if (main) main.style.marginLeft = '0';
    });
    // Wait for the real paint signals instead of a fixed delay: the fonts, the
    // first hero backdrop paint (deferred to an idle slot, so the canvas
    // announces itself with `data-ready`) and two animation frames.
    await page
      .waitForSelector('#hero-canvas[data-ready]', { timeout: 5_000 })
      .catch(() => undefined);
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          void document.fonts.ready.then(() =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined))),
          );
        }),
    );

    const target = join(DIST, 'og-image.jpg');
    await page.screenshot({
      path: target,
      type: 'jpeg',
      quality: 85,
      clip: { x: 0, y: 0, width: 1200, height: 630 },
    });

    const size = statSync(target).size;
    if (size < 10_000) throw new Error(`${target} looks empty (${size} bytes)`);
    console.log(`[og-image] ${target} (${size} bytes)`);
  } finally {
    await browser.close();
    server.close();
  }
}

await main();
