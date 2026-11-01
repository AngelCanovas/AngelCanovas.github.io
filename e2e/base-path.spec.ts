import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';

test('root-hosted pages and assets do not retain the former project mount', async ({ page }) => {
  for (const path of ['/', '/es/', '/cv/', '/cv/es/', '/404.html']) {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(path);
    const invalid = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[href], [src]')).flatMap((element) => {
        const value = element.getAttribute('href') ?? element.getAttribute('src') ?? '';
        if (!value || value.startsWith('#') || /^(mailto:|data:|tel:)/.test(value)) return [];
        const url = new URL(value, location.href);
        return url.origin === location.origin && url.pathname.startsWith('/CV/') ? [value] : [];
      }),
    );
    expect(invalid).toEqual([]);
    expect(errors).toEqual([]);
    const assets = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img[src], script[src], link[href], use[href]'))
        .map((element) => element.getAttribute('src') ?? element.getAttribute('href') ?? '')
        .map((value) => new URL(value, location.href))
        .filter((url) => url.origin === location.origin)
        .map((url) => url.href),
    );
    for (const asset of new Set(assets)) {
      expect((await page.request.get(asset)).status(), asset).toBe(200);
    }
  }
});

test('canonical PDF bytes retain their approved hashes', async ({ request }) => {
  for (const [lang, hash] of [
    ['en', '6d49c505010e855345bf1550c06294966b9261fa14ebfea3c7d5bd07838ccb42'],
    ['es', '37c3737f7df6d10575075a4f92596b7d6419e864e39c14b2c47235fad6859f71'],
  ]) {
    const response = await request.get(`/cv/angel-canovas-cv-${lang}.pdf`);
    expect(response.ok()).toBe(true);
    expect(
      createHash('sha256')
        .update(await response.body())
        .digest('hex'),
    ).toBe(hash);
  }
});
