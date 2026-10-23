import { expect, test } from '@playwright/test';

import { HERO_CANVAS, canvasChecksum } from './hero-canvas';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.26, configurable: true });
  });
});

test.describe('theme toggle', () => {
  test('keeps browser metadata in sync when theme persistence is unavailable', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.addInitScript(() => {
      const setItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === 'theme') throw new DOMException('Storage unavailable', 'QuotaExceededError');
        setItem.call(this, key, value);
      };
    });
    await page.goto('/');
    const toggle = page.locator('[data-theme-toggle]');
    const lightMeta = page.locator('meta[name="theme-color"]').first();
    const darkMeta = page.locator('meta[name="theme-color"]').nth(1);
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(lightMeta).toHaveAttribute('media', 'not all');
    await expect(darkMeta).toHaveAttribute('media', 'all');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBeNull();

    await page.emulateMedia({ colorScheme: 'dark' });
    await toggle.click();
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(246, 243, 235)');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(lightMeta).toHaveAttribute('media', 'all');
    await expect(darkMeta).toHaveAttribute('media', 'not all');
  });

  test('synchronizes changes and cleared preferences across tabs', async ({ page, context }) => {
    await page.goto('/');
    const other = await context.newPage();
    await other.goto('/');
    const toggle = page.locator('[data-theme-toggle]');
    const root = page.locator('html');
    await other.locator('[data-theme-toggle]').click();
    await expect(root).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');

    await toggle.click();
    await expect(root).toHaveAttribute('data-theme', 'light');
    await expect(other.locator('html')).toHaveAttribute('data-theme', 'light');
    await other.evaluate(() => localStorage.removeItem('theme'));
    await expect(root).not.toHaveAttribute('data-theme');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute(
      'media',
      '(prefers-color-scheme: light)',
    );

    await other.evaluate(() => localStorage.setItem('theme', 'dark'));
    await expect(root).toHaveAttribute('data-theme', 'dark');
    await other.evaluate(() => localStorage.clear());
    await expect(root).not.toHaveAttribute('data-theme');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(25, 26, 24)');
    await other.close();
  });

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

    test('removing a light choice in another tab immediately restores the dark system', async ({
      page,
      context,
    }) => {
      await page.addInitScript(() => localStorage.setItem('theme', 'light'));
      await page.goto('/');
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(246, 243, 235)');
      const other = await context.newPage();
      await other.goto('/');
      await other.evaluate(() => localStorage.removeItem('theme'));
      await expect(page.locator('html')).not.toHaveAttribute('data-theme');
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(25, 26, 24)');
      await expect(page.locator('[data-theme-toggle]')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[data-theme-toggle]')).toHaveAttribute(
        'aria-label',
        'Switch to light theme',
      );
      await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute(
        'media',
        '(prefers-color-scheme: light)',
      );
      await expect(page.locator('meta[name="theme-color"]').nth(1)).toHaveAttribute(
        'media',
        '(prefers-color-scheme: dark)',
      );
      await other.close();
    });

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
