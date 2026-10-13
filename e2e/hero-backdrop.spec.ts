import { expect, test } from '@playwright/test';

import { HERO_CANVAS, canvasChecksum, sweepHero } from './hero-canvas';

test.describe('hero backdrop', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Math, 'random', { value: () => 0.26, configurable: true });
    });
  });
  test('paints curved linework, stays still while idle and reacts under the pointer', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator(HERO_CANVAS)).toBeVisible();
    await page.waitForTimeout(1500);
    await expect.poll(() => canvasChecksum(page)).toBeGreaterThan(0);

    // No rAF loop while idle: the resting grid is painted once.
    const resting = await canvasChecksum(page);
    await page.waitForTimeout(400);
    expect(await canvasChecksum(page)).toBe(resting);

    await sweepHero(page);
    await expect.poll(() => canvasChecksum(page)).not.toBe(resting);
  });

  test('a click sends a pulse through the linework', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await expect.poll(() => canvasChecksum(page)).toBeGreaterThan(0);
    const resting = await canvasChecksum(page);

    const box = await page.locator('#hero').boundingBox();
    if (!box) throw new Error('the hero section has no box');
    await page.mouse.click(box.x + box.width * 0.45, box.y + box.height * 0.85);

    await expect.poll(() => canvasChecksum(page)).not.toBe(resting);
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('keeps the linework painted but still', async ({ page }) => {
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

test('keeps the original code field visible across the touch Hero', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0, configurable: true });
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-style', 'original');
  const hero = page.locator('#hero');
  const backdrop = page.locator('.hero-backdrop');
  await expect(backdrop).toHaveCSS('display', 'block');
  await expect(page.locator('#hero-canvas')).toHaveAttribute('data-ready', 'true');
  const coverage = await hero.evaluate((element) => {
    const canvas = element.querySelector<HTMLCanvasElement>('#hero-canvas');
    if (!canvas) throw new Error('mobile Hero canvas is missing');
    return {
      heroHeight: element.getBoundingClientRect().height,
      canvasHeight: canvas.getBoundingClientRect().height,
    };
  });
  expect(coverage.canvasHeight).toBeGreaterThanOrEqual(coverage.heroHeight * 0.95);
  await context.close();
});

test.describe('original blue hero backdrop', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Math, 'random', { value: () => 0, configurable: true });
    });
  });

  test('renders the interactive code labels and switches renderers cleanly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-style', 'original');
    await page.locator('[data-style-progress-control]').evaluate((element) => {
      (element as HTMLButtonElement).click();
    });
    await expect(page.locator('[data-style-progress-control]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('#hero')).toHaveAttribute('data-hero-backdrop-mode', 'code');
    await expect(page.locator(HERO_CANVAS)).toBeVisible();
    // The restored renderer defers its intentionally heavy first label layout until idle.
    await page.waitForTimeout(3500);
    await expect.poll(() => canvasChecksum(page)).toBeGreaterThan(0);

    const lowerBandInk = await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>('#hero-canvas');
      if (!canvas) throw new Error('hero canvas is missing');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('hero canvas context is missing');
      const y = Math.floor(canvas.height * 0.7);
      const height = Math.max(1, Math.floor(canvas.height * 0.22));
      const pixels = context.getImageData(0, y, canvas.width, height).data;
      let ink = 0;
      for (let index = 3; index < pixels.length; index += 4) {
        if (pixels[index] > 0) ink += 1;
      }
      return ink;
    });
    expect(lowerBandInk).toBeGreaterThan(0);

    const heroCoverage = await page.evaluate(() => {
      const hero = document.querySelector<HTMLElement>('#hero');
      const canvas = document.querySelector<HTMLCanvasElement>('#hero-canvas');
      if (!hero || !canvas) throw new Error('hero coverage elements are missing');
      const heroHeight = hero.getBoundingClientRect().height;
      const canvasHeight = canvas.getBoundingClientRect().height;
      return { heroHeight, canvasHeight };
    });
    expect(heroCoverage.canvasHeight).toBeGreaterThanOrEqual(heroCoverage.heroHeight * 0.95);

    const resting = await canvasChecksum(page);
    await sweepHero(page, 4);
    await expect.poll(() => canvasChecksum(page)).not.toBe(resting);

    const styleToggle = page.locator('[data-style-toggle]');
    await styleToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-style', 'editorial');
    await expect(page.locator('#hero')).toHaveAttribute('data-hero-backdrop-mode', 'waves');
    await styleToggle.dispatchEvent('click');
    await expect(page.locator('html')).toHaveAttribute('data-style', 'technical');
    await expect(page.locator('#hero')).toHaveAttribute('data-hero-backdrop-mode', 'none');
    await expect(page.locator(HERO_CANVAS)).toBeHidden();
  });
});
