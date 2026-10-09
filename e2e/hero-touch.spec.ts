import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.26, configurable: true });
  });
});

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`touch hero in ${colorScheme} mode`, () => {
    test.use({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 375, height: 812 },
      colorScheme,
      locale: 'en-US',
    });

    for (const path of ['/', '/es/']) {
      test(`hides the dotted atmosphere and keeps usable content on ${path}`, async ({
        page,
      }, info) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
          if (/Content Security Policy|Refused to/i.test(message.text()))
            errors.push(message.text());
        });
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        const atmosphere = page.locator('.hero-atmosphere');
        await expect(atmosphere).toBeHidden();
        await expect(page.locator('#hero-canvas')).toBeHidden();
        await expect(page.locator('#hero-canvas')).not.toHaveAttribute('data-ready');
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('.hero-actions a')).toHaveCount(3);
        await page.screenshot({ path: info.outputPath('hero-touch-portrait.png') });

        const accessibility = await new AxeBuilder({ page })
          .include('#hero')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(
          accessibility.violations.filter(
            (item) => item.impact === 'critical' || item.impact === 'serious',
          ),
        ).toEqual([]);

        for (const viewport of [
          { width: 320, height: 823 },
          { width: 412, height: 823 },
          { width: 768, height: 1024 },
          { width: 844, height: 390 },
        ]) {
          await page.setViewportSize(viewport);
          await expect(atmosphere).toBeHidden();
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          );
          expect(overflow).toBeLessThanOrEqual(0);
          await expect(page.locator('.hero-actions')).toBeVisible();
        }
        await page.screenshot({ path: info.outputPath('hero-touch-landscape.png') });
        await page.setViewportSize({ width: 375, height: 812 });
        await page.locator('.hero-actions a[href="#contact"]').tap();
        await expect(page).toHaveURL(/#contact$/);
        await expect(page.locator('#contact')).toBeInViewport();
        await expect(page.locator('#hero')).toHaveAttribute('data-hero-paused', '');
        expect(errors).toEqual([]);
      });
    }

    test('keeps the orange atmosphere hidden when the chosen theme changes', async ({ page }) => {
      await page.goto('/');
      const halo = page.locator('.hero-atmosphere');
      await expect(halo).toBeHidden();
      await page.locator('.header-toggle').tap();
      await page.locator('[data-theme-toggle]').tap();
      await expect(page.locator('html')).toHaveAttribute(
        'data-theme',
        colorScheme === 'light' ? 'dark' : 'light',
      );
      await expect(halo).toBeHidden();
      await page.reload();
      await expect(page.locator('.hero-atmosphere')).toBeHidden();
    });

    test('keeps the removed atmosphere hidden with reduced motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      const atmosphere = page.locator('.hero-atmosphere');
      await expect(atmosphere).toBeHidden();
    });

    test('works without JavaScript', async ({ browser }) => {
      const context = await browser.newContext({
        hasTouch: true,
        isMobile: true,
        javaScriptEnabled: false,
        colorScheme,
        reducedMotion: 'reduce',
        viewport: { width: 375, height: 812 },
      });
      const page = await context.newPage();
      await page.goto('/');
      await expect(page.locator('[data-technical-graph]')).toBeVisible();
      await expect(page.locator('#hero-canvas')).toBeHidden();
      await expect(page.locator('h1')).toBeVisible();
      await context.close();
    });
  });
}
