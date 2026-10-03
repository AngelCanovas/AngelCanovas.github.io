import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

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
      test(`shows autonomous halos and usable content on ${path}`, async ({ page }, info) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
          if (/Content Security Policy|Refused to/i.test(message.text()))
            errors.push(message.text());
        });
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        const atmosphere = page.locator('.hero-atmosphere');
        await expect(atmosphere).toBeVisible();
        await expect(page.locator('#hero-canvas')).toBeHidden();
        await expect(page.locator('#hero-canvas')).not.toHaveAttribute('data-ready');
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('.hero-actions a')).toHaveCount(3);

        // Both CSS animations finish without a pointer, leaving visible halos.
        await expect
          .poll(
            () =>
              atmosphere.evaluate((element) =>
                element
                  .getAnimations({ subtree: true })
                  .every((animation) => animation.playState === 'finished'),
              ),
            { timeout: 7000 },
          )
          .toBe(true);
        for (const pseudo of ['::before', '::after']) {
          const style = await atmosphere.evaluate((element, pseudo) => {
            const computed = getComputedStyle(element, pseudo);
            return { background: computed.backgroundImage, opacity: computed.opacity };
          }, pseudo);
          expect(style.background).toContain('radial-gradient');
          expect(style.background).not.toContain('light-dark');
          expect(style.opacity).toBe('1');
        }
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
          await expect(atmosphere).toBeVisible();
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

    test('updates the halos when the chosen theme overrides the system', async ({ page }) => {
      await page.goto('/');
      const halo = page.locator('.hero-atmosphere');
      const background = () =>
        halo.evaluate((element) => getComputedStyle(element, '::before').backgroundImage);
      const initial = await background();
      await page.locator('.header-toggle').tap();
      await page.locator('[data-theme-toggle]').tap();
      await expect(page.locator('html')).toHaveAttribute(
        'data-theme',
        colorScheme === 'light' ? 'dark' : 'light',
      );
      await expect.poll(background).not.toBe(initial);
      const chosen = await background();
      await page.reload();
      await expect.poll(background).toBe(chosen);
    });

    test('keeps a visible static background with reduced motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      const atmosphere = page.locator('.hero-atmosphere');
      await expect(atmosphere).toBeVisible();
      for (const pseudo of ['::before', '::after']) {
        const animation = await atmosphere.evaluate(
          (element, pseudo) => getComputedStyle(element, pseudo).animationName,
          pseudo,
        );
        expect(animation).toBe('none');
      }
      expect(
        await atmosphere.evaluate((element) => element.getAnimations({ subtree: true }).length),
      ).toBe(0);
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
      await expect(page.locator('.hero-atmosphere')).toBeVisible();
      await expect(page.locator('#hero-canvas')).toBeHidden();
      await expect(page.locator('h1')).toBeVisible();
      await context.close();
    });
  });
}
