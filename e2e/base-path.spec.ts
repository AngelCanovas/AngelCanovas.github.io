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
    ['en', '54f8f28da5b60a7b313a14b34eb4d7ecea1f518785ab3d8a85eb4dcd2fe65dec'],
    ['es', 'de486b7a82ca983a5dac303996ff5afd3bf5a39d395b655d2285323c4cc8beeb'],
    ['fr', 'd18dccca2b570d80bac93fdd1f852f458c6d93fbb16e8eb2a818f7ab77d10e26'],
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
