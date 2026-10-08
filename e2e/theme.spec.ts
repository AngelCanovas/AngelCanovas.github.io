import { expect, test } from '@playwright/test';

import { HERO_CANVAS, canvasChecksum } from './hero-canvas';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('page-style', 'editorial'));
});

test.describe('theme toggle', () => {
  test('starts from the system preference, toggles and persists the choice', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('[data-theme-toggle]');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(246, 243, 235)');
    await expect(page.locator('#header')).toHaveCSS('background-color', 'rgb(238, 234, 223)');
    await expect(page.locator(HERO_CANVAS)).toBeVisible();
    await expect.poll(() => canvasChecksum(page)).toBeGreaterThan(0);
    const lightFrame = await canvasChecksum(page);
    await expect(page.locator('.home-lab-box')).toHaveCSS('background-color', 'rgb(238, 234, 223)');

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(25, 26, 24)');
    await expect(page.locator('#header')).toHaveCSS('background-color', 'rgb(30, 32, 28)');
    await expect(page.locator(HERO_CANVAS)).toBeVisible();
    // The hero backdrop repaints itself with the dark tokens.
    await expect.poll(() => canvasChecksum(page)).not.toBe(lightFrame);
    await expect(page.locator('.home-lab-box')).toHaveCSS('background-color', 'rgb(30, 32, 28)');
    await expect(page.locator('.assignment-box')).toHaveCSS('background-color', 'rgb(30, 32, 28)');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  test.describe('dark system preference', () => {
    test.use({ colorScheme: 'dark' });

    test('an explicit light choice overrides the system', async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('theme', 'light'));
      await page.goto('/');

      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
      await expect(page.locator('[data-theme-toggle]')).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(246, 243, 235)');
      await expect(page.locator('#header')).toHaveCSS('background-color', 'rgb(238, 234, 223)');
      await expect(page.locator(HERO_CANVAS)).toBeVisible();
      await expect(page.locator('.home-lab-box')).toHaveCSS(
        'background-color',
        'rgb(238, 234, 223)',
      );

      await page.locator('[data-theme-toggle]').click();
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(25, 26, 24)');
    });

    test('the theme-color metas keep following the system without a stored choice', async ({
      page,
    }) => {
      await page.goto('/');
      const lightMeta = page.locator('meta[name="theme-color"]').first();
      const darkMeta = page.locator('meta[name="theme-color"]').nth(1);
      await expect(lightMeta).toHaveAttribute('media', '(prefers-color-scheme: light)');
      await expect(darkMeta).toHaveAttribute('media', '(prefers-color-scheme: dark)');

      await page.emulateMedia({ colorScheme: 'light' });
      await expect(darkMeta).toHaveAttribute('media', '(prefers-color-scheme: dark)');

      await page.locator('[data-theme-toggle]').click();
      await expect(darkMeta).toHaveAttribute('media', 'all');
      await expect(lightMeta).toHaveAttribute('media', 'not all');
    });
  });
});
