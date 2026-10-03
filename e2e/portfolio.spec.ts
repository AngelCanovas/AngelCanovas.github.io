import { expect, test } from '@playwright/test';

test('portfolio filter shows only the selected category and updates ARIA state', async ({
  page,
}) => {
  await page.goto('/CV/');
  const items = page.locator('.portfolio-item');
  const securityItems = page.locator('.portfolio-item[data-category~="security"]');
  const total = await items.count();
  const security = await securityItems.count();
  expect(security).toBeGreaterThan(0);
  expect(security).toBeLessThan(total);

  await page.locator('.filter-btn[data-filter="security"]').click();
  await expect(page.locator('.filter-btn[data-filter="security"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('.filter-btn[data-filter="*"]')).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(page.locator('.portfolio-item:not(.is-hidden)')).toHaveCount(security);
  await expect(page.locator('.portfolio-item.is-hidden').first()).toBeHidden();

  await page.locator('.filter-btn[data-filter="*"]').click();
  await expect(page.locator('.portfolio-item:not(.is-hidden)')).toHaveCount(total);
  await expect(page.locator('.portfolio-item.is-hidden')).toHaveCount(0);
});

test('impact counters render locale-aware final values', async ({ page }) => {
  await page.goto('/CV/');
  await page.locator('#stats').scrollIntoViewIfNeeded();
  await expect(page.locator('.stat-number').nth(2)).toHaveText('4.23', { timeout: 5000 });
});

test('impact counters use Spanish decimal formatting on the Spanish page', async ({ page }) => {
  await page.goto('/CV/es/');
  await page.locator('#stats').scrollIntoViewIfNeeded();
  await expect(page.locator('.stat-number').nth(2)).toHaveText('4,23', { timeout: 5000 });
});

test('the quote rotation can be paused with the keyboard', async ({ page }) => {
  await page.goto('/CV/');
  const button = page.locator('[data-quote-pause]');
  await button.scrollIntoViewIfNeeded();
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(button).toHaveAttribute('aria-label', 'Pause quote rotation');

  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(button).toHaveAttribute('aria-label', 'Resume quote rotation');

  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-pressed', 'false');
});

test('section anchors leave room for the fixed mobile header', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/CV/');
  const margin = await page
    .locator('#about')
    .evaluate((element) => getComputedStyle(element).scrollMarginTop);
  expect(margin).toBe('72px');
});

test('a malformed hash does not break the page', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/CV/#123');
  await page.goto('/CV/#%');

  expect(errors).toEqual([]);
  await expect(page.locator('h1')).toBeVisible();
});
