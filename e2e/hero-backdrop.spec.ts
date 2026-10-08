import { expect, test } from '@playwright/test';

import { HERO_CANVAS, canvasChecksum, sweepHero } from './hero-canvas';

test.describe('hero backdrop', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('page-style', 'editorial'));
  });
  test('paints the label grid, stays still while idle and lights up under the pointer', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator(HERO_CANVAS)).toBeVisible();
    await expect.poll(() => canvasChecksum(page)).toBeGreaterThan(0);

    // No rAF loop while idle: the resting grid is painted once.
    const resting = await canvasChecksum(page);
    await page.waitForTimeout(400);
    expect(await canvasChecksum(page)).toBe(resting);

    await sweepHero(page);
    await expect.poll(() => canvasChecksum(page)).not.toBe(resting);
  });

  test('a click sends a ring through the grid', async ({ page }) => {
    await page.goto('/');
    await expect.poll(() => canvasChecksum(page)).toBeGreaterThan(0);
    const resting = await canvasChecksum(page);

    const box = await page.locator('#hero').boundingBox();
    if (!box) throw new Error('the hero section has no box');
    await page.mouse.click(box.x + box.width * 0.45, box.y + box.height * 0.85);

    await expect.poll(() => canvasChecksum(page)).not.toBe(resting);
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('keeps the grid painted but still', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator(HERO_CANVAS)).toBeVisible();
      await expect.poll(() => canvasChecksum(page)).toBeGreaterThan(0);
      const resting = await canvasChecksum(page);

      await sweepHero(page, 8);
      await page.waitForTimeout(300);
      expect(await canvasChecksum(page)).toBe(resting);
    });
  });
});
