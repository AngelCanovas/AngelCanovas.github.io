import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('page-style', 'editorial'));
});

for (const width of [375, 1440]) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`editorial presentation at ${width} in ${colorScheme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      await page.goto('/');
      await expect(page.locator('#header')).toHaveCSS('transition-duration', '0s');
      await expect(page.locator('.service-number, .section-number')).toHaveCount(0);
      await expect(page.locator('.hero-atmosphere')).toHaveAttribute('aria-hidden', 'true');
      await expect(page.locator('[data-editorial-depth]')).not.toHaveCount(0);
      const controls = page.locator(
        '.hero-btn, .filter-btn, .theme-toggle, .lang-option, .contact-copy, .quote-pause, .resume-download, .sidebar-cv, .header-toggle, .scroll-top',
      );
      const radii = await controls.evaluateAll((elements) =>
        elements.map((element) => Number.parseFloat(getComputedStyle(element).borderTopLeftRadius)),
      );
      expect(radii.every((radius) => radius <= 6)).toBe(true);
      const labels = await page
        .locator('.hero-eyebrow, .section-title, .portfolio-category, .contact-label')
        .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).fontFamily));
      expect(labels.every((font) => !/mono/i.test(font))).toBe(true);
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        result.violations.filter((item) => item.impact === 'critical' || item.impact === 'serious'),
      ).toEqual([]);
    });
  }
}

test('the new canvas is linework rather than a text label field', async ({ page }) => {
  await page.addInitScript(() => {
    const original = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (...args) {
      document.getElementById('hero')?.setAttribute('data-text-painted', 'true');
      original.apply(this, args);
    };
  });
  await page.goto('/');
  await expect(page.locator('#hero-canvas')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#hero')).not.toHaveAttribute('data-text-painted');
});

test('depth responds to scroll and resets on a live motion preference', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (/Content Security Policy|Refused to/i.test(message.text())) errors.push(message.text());
  });
  await page.goto('/');
  const target = page.locator('#about [data-editorial-depth]').first();
  await target.scrollIntoViewIfNeeded();
  await expect
    .poll(() => target.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe('none');
  const before = await target.evaluate((element) => getComputedStyle(element).transform);
  await page.evaluate(() => window.scrollBy(0, 100));
  await expect
    .poll(() => target.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(before);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(target).toHaveCSS('transform', 'none');
  await expect.poll(() => target.evaluate((element) => element.style.length)).toBe(0);
  expect(errors).toEqual([]);
});

test('default technical content and its static field are usable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  await page.goto('/es/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-technical-graph]')).toBeVisible();
  await expect(page.locator('#navmenu a[href="#portfolio"]')).toBeVisible();
  await expect(page.locator('.hero-actions [download]')).toHaveAttribute('href', /\.pdf$/);
  await context.close();
});
