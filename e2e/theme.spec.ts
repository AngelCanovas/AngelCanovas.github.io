import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.26, configurable: true });
  });
});

test.describe('theme toggle', () => {
  test('opens in dark regardless of the system preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const toggle = page.locator('[data-theme-toggle]');
    const lightMeta = page.locator('meta[name="theme-color"]').first();
    const darkMeta = page.locator('meta[name="theme-color"]').nth(1);

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(25, 26, 24)');
    await expect(lightMeta).toHaveAttribute('media', 'not all');
    await expect(darkMeta).toHaveAttribute('media', 'all');

    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to dark theme');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(246, 243, 235)');
    await expect(lightMeta).toHaveAttribute('media', 'all');
    await expect(darkMeta).toHaveAttribute('media', 'not all');
  });

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

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(lightMeta).toHaveAttribute('media', 'all');
    await expect(darkMeta).toHaveAttribute('media', 'not all');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBeNull();
  });

  test('starts dark, toggles and persists the choice across reloads', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('[data-theme-toggle]');
    const root = page.locator('html');

    await expect(root).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(25, 26, 24)');

    await toggle.click();
    await expect(root).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(root).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await toggle.click();
    await expect(root).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(root).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('synchronizes choices and cleared preferences across tabs', async ({ page, context }) => {
    await page.goto('/');
    const other = await context.newPage();
    await other.goto('/');
    const toggle = page.locator('[data-theme-toggle]');
    const root = page.locator('html');

    await expect(root).toHaveAttribute('data-theme', 'dark');
    await other.locator('[data-theme-toggle]').click();
    await expect(root).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await toggle.click();
    await expect(root).toHaveAttribute('data-theme', 'dark');
    await expect(other.locator('html')).toHaveAttribute('data-theme', 'dark');

    await other.evaluate(() => localStorage.removeItem('theme'));
    await expect(root).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute(
      'media',
      'not all',
    );

    await other.evaluate(() => localStorage.setItem('theme', 'light'));
    await expect(root).toHaveAttribute('data-theme', 'light');
    await other.evaluate(() => localStorage.clear());
    await expect(root).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(25, 26, 24)');
    await other.close();
  });

  test.describe('dark system preference', () => {
    test.use({ colorScheme: 'dark' });

    test('the online CV keeps its light tokens', async ({ page }) => {
      await page.goto('/cv/');
      await expect(page.locator('body')).toHaveClass(/cv-page/);
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    });
  });
});
