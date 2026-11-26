import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';

test('root-hosted pages and assets do not retain the former project mount', async ({ page }) => {
  for (const path of ['/', '/es/', '/fr/', '/cv/', '/cv/es/', '/cv/fr/', '/404.html']) {
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
    ['en', '4f44bce959d8f8887458bd189e9ef590fe374ee749f136f3e044618a109fc998'],
    ['es', '4817ddc9a11e40e633880766ae20f7f31ea4efb5dc76f76117abfa45fffb76e1'],
    ['fr', '457f3e6b77f5c77af09fd7883ab69a629c990e7050c62d000f2b7d571450dcfa'],
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
