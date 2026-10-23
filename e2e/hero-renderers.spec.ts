import { expect, test } from '@playwright/test';

test('loads Hero renderers only when their styles are selected', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.51, configurable: true });
  });
  const scripts: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scripts.push(new URL(request.url()).pathname);
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  const codeLoaded = () => scripts.some((path) => /\/hero-code-backdrop\.[^/]+\.js$/.test(path));
  const wavesLoaded = () => scripts.some((path) => /\/hero-backdrop\.[^/]+\.js$/.test(path));
  expect(codeLoaded()).toBe(false);
  expect(wavesLoaded()).toBe(false);
  const toggle = page.locator('[data-style-toggle]');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-style', 'noir');
  expect(codeLoaded()).toBe(false);
  expect(wavesLoaded()).toBe(false);
  await toggle.click();
  await expect(page.locator('#hero')).toHaveAttribute('data-hero-backdrop-mode', 'code');
  await expect(page.locator('#hero-canvas')).toHaveAttribute('data-ready', 'true');
  expect(codeLoaded()).toBe(true);
  expect(wavesLoaded()).toBe(false);
  await toggle.click();
  await expect(page.locator('#hero')).toHaveAttribute('data-hero-backdrop-mode', 'waves');
  await expect(page.locator('#hero-canvas')).toHaveAttribute('data-ready', 'true');
  expect(wavesLoaded()).toBe(true);
});
