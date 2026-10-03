import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { personal } from '../src/data/site';
import packageInfo from '../package.json' with { type: 'json' };

const siteUrl = 'https://angelcanovas.github.io/CV';

test('build metadata identifies the version, origin and revision that will be deployed', async ({
  request,
}) => {
  const response = await request.get('/CV/build-info.json');
  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({
    version: packageInfo.version,
    site: siteUrl,
    revision: process.env.PUBLIC_SITE_REVISION || 'local',
  });
});

test('site feeds and canonical URLs share the configured deployment origin', async ({
  request,
}) => {
  const expectations = [
    ['/CV/', `rel="canonical" href="${siteUrl}/"`],
    ['/CV/es/', `rel="canonical" href="${siteUrl}/es/"`],
    ['/CV/robots.txt', `Sitemap: ${siteUrl}/sitemap.xml`],
    ['/CV/sitemap.xml', `<loc>${siteUrl}/cv/es/</loc>`],
    ['/CV/llms.txt', `(${siteUrl}/cv/)`],
    ['/CV/llms-full.txt', `- Website: ${siteUrl}`],
    ['/CV/.well-known/security.txt', `Canonical: ${siteUrl}/.well-known/security.txt`],
  ];
  for (const [path, expected] of expectations) {
    const response = await request.get(path);
    expect(response.ok(), path).toBe(true);
    expect(await response.text(), path).toContain(expected);
  }
});

test('website identifies its owner and retains full third-party notices', async ({
  page,
  request,
}) => {
  await page.goto('/CV/es/');
  await expect(page.locator('#footer .copyright')).toContainText(personal.fullName);
  await expect(page.locator('#footer .credits a[href="https://astro.build"]')).toBeVisible();
  await expect(page.locator('#footer a[href*="bootstrapmade"]')).toHaveCount(0);
  await expect(page.locator('#footer a[href="/CV/third-party-notices.txt"]')).toBeVisible();
  const response = await request.get('/CV/third-party-notices.txt');
  expect(response.ok()).toBe(true);
  const text = await response.text();
  expect(text).toContain('Bootstrap 5 (MIT)');
  expect(text).toContain('Bootstrap Icons 1.11.3');
  expect(text).toContain('## Roboto');
  expect(text).toContain('## Raleway');
  expect(text).toContain('Permission is hereby granted');
  expect(text).toContain('SIL OPEN FONT LICENSE');
});

for (const page of [
  'index.html',
  'es/index.html',
  'cv/index.html',
  'cv/es/index.html',
  '404.html',
]) {
  test(`every inline script hash is embedded in the CSP of ${page}`, () => {
    const html = readFileSync(join(process.cwd(), 'dist', page), 'utf8');
    const csp =
      html.match(/<meta[^>]*http-equiv="content-security-policy"[^>]*content="([^"]*)"/i)?.[1] ??
      '';
    expect(csp).not.toContain('unsafe-inline');
    const blocks = [
      ...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi),
    ].filter((block) => block[1].trim().length > 0);
    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      const digest = createHash('sha256').update(block[1], 'utf8').digest('base64');
      expect(csp).toContain(`'sha256-${digest}'`);
    }
  });

  test(`every inline style is embedded in the CSP of ${page}`, () => {
    const html = readFileSync(join(process.cwd(), 'dist', page), 'utf8');
    const csp =
      html.match(/<meta[^>]*http-equiv="content-security-policy"[^>]*content="([^"]*)"/i)?.[1] ??
      '';
    const styleDirective = csp.match(/(?:^|;)\s*style-src([^;]*)/i)?.[1] ?? '';
    expect(styleDirective).toContain("'self'");
    const blocks = [...html.matchAll(/<style\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/style>/gi)].filter(
      (block) => block[1].trim().length > 0,
    );
    for (const block of blocks) {
      const digest = createHash('sha256').update(block[1], 'utf8').digest('base64');
      expect(styleDirective).toContain(`'sha256-${digest}'`);
    }
    // Nothing may rely on an inline style or event attribute: the policy blocks
    // them, and the build-time guard rejects them before they get this far.
    expect(html).not.toMatch(/<[a-z][^>]*\sstyle="/i);
    expect(html).not.toMatch(/<[a-z][^>]*\son[a-z]+="/i);
  });

  test(`the CSP is delivered before any script in ${page}`, () => {
    const html = readFileSync(join(process.cwd(), 'dist', page), 'utf8');
    const cspIndex = html.search(/<meta[^>]*http-equiv="content-security-policy"/i);
    const scriptIndex = html.search(/<script/i);
    expect(cspIndex).toBeGreaterThan(-1);
    expect(scriptIndex).toBeGreaterThan(-1);
    expect(cspIndex).toBeLessThan(scriptIndex);
  });
}

test.describe('ready-made CV PDFs', () => {
  for (const { lang, file } of [
    { lang: 'en', file: 'angel-canovas-cv-en.pdf' },
    { lang: 'es', file: 'angel-canovas-cv-es.pdf' },
  ]) {
    test(`the ${lang.toUpperCase()} CV PDF is served and is a real PDF`, async ({ request }) => {
      const response = await request.get(`/CV/cv/${file}`);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/pdf');
      const body = await response.body();
      expect(body.length).toBeGreaterThan(15_000);
      expect(body.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    });
  }

  test('download links point to the PDF in the visitor language', async ({ page }) => {
    await page.goto('/CV/cv/');
    await expect(page.locator('a[download]').first()).toHaveAttribute(
      'href',
      '/CV/cv/angel-canovas-cv-en.pdf',
    );

    await page.goto('/CV/cv/es/');
    await expect(page.locator('a[download]').first()).toHaveAttribute(
      'href',
      '/CV/cv/angel-canovas-cv-es.pdf',
    );
  });

  test('the online CV offers generating a PDF from the page', async ({ page }) => {
    await page.goto('/CV/cv/');
    await page.evaluate(() => {
      window.print = () => {
        document.body.dataset.printed = 'true';
      };
    });
    await page.locator('[data-print-cv]').click();
    await expect(page.locator('body')).toHaveAttribute('data-printed', 'true');
  });
});

test('the 404 page is not indexable and keeps a self canonical', async ({ request }) => {
  const html = await (await request.get('/CV/404.html')).text();
  expect(html).toContain('name="robots" content="noindex, follow"');
  expect(html).toContain(`rel="canonical" href="${siteUrl}/404.html"`);
});

test('the security.txt is published with a contact and a canonical URL', async ({ request }) => {
  const response = await request.get('/CV/.well-known/security.txt');
  expect(response.status()).toBe(200);
  const text = await response.text();
  expect(text).toContain('Contact: https://github.com/AngelCanovas/CV/security/advisories/new');
  expect(text).toContain(`Canonical: ${siteUrl}/.well-known/security.txt`);
});

test('cache headers revalidate mutable files and keep hashed assets immutable', async ({
  request,
}) => {
  for (const path of ['/CV/', '/CV/sitemap.xml', '/CV/llms-full.txt', '/CV/sprite.svg']) {
    const response = await request.get(path);
    expect(response.headers()['cache-control'], path).toBe('no-cache');
  }

  const binary = await request.get('/CV/cv/angel-canovas-cv-en.pdf');
  expect(binary.headers()['cache-control']).toContain('max-age=604800');

  const asset = readdirSync(join(process.cwd(), 'dist', '_astro')).find((name) =>
    name.endsWith('.js'),
  );
  expect(asset).toBeTruthy();
  const hashed = await request.get(`/CV/_astro/${asset}`);
  expect(hashed.headers()['cache-control']).toContain('immutable');
});

test('no client bundle leaks the personal email', () => {
  const dir = join(process.cwd(), 'dist', '_astro');
  const leaks = readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map((entry) => join(entry.parentPath, entry.name))
    .filter((file) => readFileSync(file, 'utf8').includes(personal.email));
  expect(leaks).toEqual([]);
});

test('the Open Graph image is served as a 1200x630 JPEG', async ({ page }) => {
  await page.goto('/CV/');
  const dimensions = await page.evaluate(
    () =>
      new Promise<{ width: number; height: number }>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error('og-image.jpg failed to load'));
        image.src = '/CV/og-image.jpg';
      }),
  );
  expect(dimensions).toEqual({ width: 1200, height: 630 });
});

test('llms-full.txt is generated at build time from the site content', async ({ request }) => {
  const response = await request.get('/CV/llms-full.txt');
  expect(response.status()).toBe(200);
  const text = await response.text();
  expect(text).toContain('# Angel Cánovas Mula — Full CV');
  expect(text).toContain('## Professional Experience');
  expect(text).toContain('## Certifications');
});

test('the icon sprite is served and the page logs no CSP errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/CV/', { waitUntil: 'networkidle' });
  const response = await page.request.get('/CV/sprite.svg');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/svg+xml');
  await expect(page.locator('.navmenu svg').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('fonts are self-hosted: no request leaves the origin', async ({ page }) => {
  const externalFontRequests: string[] = [];
  const woff2Requests: string[] = [];
  page.on('request', (request) => {
    const url = request.url();
    if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(new URL(url).hostname)) {
      externalFontRequests.push(url);
    }
    if (url.endsWith('.woff2')) woff2Requests.push(url);
  });

  await page.goto('/CV/', { waitUntil: 'networkidle' });
  expect(externalFontRequests).toEqual([]);
  expect(woff2Requests.length).toBeGreaterThan(0);
  expect(woff2Requests.every((url) => url.startsWith('http://127.0.0.1:4321/'))).toBe(true);
});
