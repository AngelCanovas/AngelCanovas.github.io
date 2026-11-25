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
    ['en', '08b7d34a7ebcc468c2e7e44c80d76ea57cde6fd8299d465d6a47607634077fb6'],
    ['es', 'ec6c8ff6b6299bbc2390f099fde3d897a881c35a850dd6a9e1c9b74070b567cf'],
    ['fr', '4eeb53509e4a6c3d2e3818cbdecfc35e1059a9692a18649ae9909d786f167007'],
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
