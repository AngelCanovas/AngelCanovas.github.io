import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const route of ['/', '/es/']) {
  test(`style cycle and technical graph ${route}`, async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Math, 'random', { value: () => 0.51, configurable: true });
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route);
    const root = page.locator('html');
    const button = page.locator('[data-style-toggle]');
    const graph = page.locator('[data-technical-graph]');
    const bonfire = page.locator('[data-noir-bonfire]');
    await expect(button).toHaveAttribute(
      'aria-label',
      route === '/' ? /Monochrome ink style/ : /Estilo tinta monocroma/,
    );
    await expect(root).toHaveAttribute('data-style', 'technical');
    await expect(graph).toBeVisible();
    await page.mouse.move(1200, 400);
    await expect(graph).toHaveAttribute('data-pointer', 'active');
    await expect(graph).not.toHaveCSS('transform', 'none');
    await expect(graph.locator('[data-signal]').first()).toHaveCSS(
      'animation-name',
      'signal-travel',
    );
    const theme = await root.getAttribute('data-theme');
    for (const mode of ['noir', 'original', 'editorial', 'technical']) {
      await button.focus();
      await page.keyboard.press('Enter');
      await expect(root).toHaveAttribute('data-style', mode);
      expect(await root.getAttribute('data-theme')).toBe(theme);
      await expect(page.locator('.hero-name')).toBeVisible();
      await expect(button).toHaveAttribute('data-style', mode);
      if (mode === 'noir') {
        await expect(bonfire).toBeVisible();
        await expect(bonfire).toHaveAttribute('aria-hidden', 'true');
        await expect(bonfire.locator('.flame--outer')).toHaveCSS(
          'animation-name',
          'noir-flame-sway',
        );
        await expect(bonfire.locator('.sword-glint')).toHaveCSS(
          'animation-name',
          'noir-sword-glint',
        );
      } else {
        await expect(bonfire).toBeHidden();
      }
    }
    await page.locator('[data-theme-toggle]').click();
    await expect(root).toHaveAttribute('data-theme', /light|dark/);
    await expect(root).toHaveAttribute('data-style', 'technical');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(graph).toHaveCSS('transform', 'none');
    await expect(graph.locator('[data-signal]').first()).toHaveCSS('animation-name', 'none');
  });
}

test('chooses a fresh random style on every load instead of restoring storage', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const load = Number(sessionStorage.getItem('style-test-load') ?? '0');
    sessionStorage.setItem('style-test-load', String(load + 1));
    localStorage.setItem('page-style', 'editorial');
    Object.defineProperty(Math, 'random', {
      value: () => (load === 0 ? 0.01 : 0.51),
      configurable: true,
    });
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-style', 'original');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-style', 'technical');
});

test('invalid storage, reduced motion and no-JS graph fallback', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    localStorage.setItem('page-style', 'invalid');
    Object.defineProperty(Math, 'random', { value: () => 0.51, configurable: true });
  });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-style', 'technical');
  await expect(page.locator('[data-signal]').first()).toHaveCSS('animation-name', 'none');
  await page.mouse.move(900, 300);
  await expect(page.locator('[data-technical-graph]')).not.toHaveAttribute(
    'data-pointer',
    'active',
  );
  await context.close();
  const noJs = await browser.newContext({
    javaScriptEnabled: false,
    isMobile: true,
    hasTouch: true,
  });
  const fallback = await noJs.newPage();
  await fallback.goto('/es/');
  await expect(fallback.locator('[data-technical-graph]')).toBeVisible();
  await expect(fallback.locator('.hero-name')).toBeVisible();
  await noJs.close();
});

for (const mode of ['original', 'editorial', 'technical', 'noir']) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`style rendering ${mode} ${colorScheme}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      await page.addInitScript((style) => {
        const values = { original: 0.01, editorial: 0.26, technical: 0.51, noir: 0.76 } as const;
        Object.defineProperty(Math, 'random', {
          value: () => values[style as keyof typeof values],
          configurable: true,
        });
      }, mode);
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('html')).toHaveAttribute('data-style', mode);
      await expect(page).toHaveScreenshot(`${mode}-${colorScheme}.png`, {
        timeout: 30000,
        animations: 'disabled',
        maxDiffPixels: 0,
        threshold: 0,
      });
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        result.violations.filter((item) => item.impact === 'critical' || item.impact === 'serious'),
      ).toEqual([]);
    });
  }
}

test('technical touch input and live reduced-motion preference remain static', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 375, height: 812 },
  });
  await context.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.51, configurable: true });
  });
  const page = await context.newPage();
  await page.goto('/');
  const graph = page.locator('[data-technical-graph]');
  await expect(graph).toBeVisible();
  await page.locator('#hero').tap({ position: { x: 300, y: 700 } });
  await expect(graph).not.toHaveAttribute('data-pointer', 'active');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(graph.locator('[data-signal]').first()).toHaveCSS('animation-name', 'none');
  await expect(graph).toHaveCSS('transform', 'none');
  await context.close();
});
