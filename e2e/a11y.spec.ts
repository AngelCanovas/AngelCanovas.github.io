import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = [
  { path: '/CV/', name: 'portfolio EN' },
  { path: '/CV/es/', name: 'portfolio ES' },
  { path: '/CV/cv/', name: 'online CV EN' },
  { path: '/CV/cv/es/', name: 'online CV ES' },
  { path: '/CV/404.html', name: '404 page' },
];

for (const { path, name } of pages) {
  test(`no serious or critical accessibility violations on ${name}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const blocking = results.violations.filter(
      (violation) => violation.impact === 'critical' || violation.impact === 'serious',
    );
    expect(
      blocking.map((violation) => ({ id: violation.id, nodes: violation.nodes.length })),
      JSON.stringify(blocking, null, 2),
    ).toEqual([]);
  });
}

test('the page stays readable when JavaScript is disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/CV/');

  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#skills h2')).toBeVisible();
  await context.close();
});

test('without JavaScript the sidebar stays usable and the hamburger is hidden', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/CV/');

  await expect(page.locator('#header')).toBeVisible();
  await expect(page.locator('#navmenu a[href="#about"]')).toBeVisible();
  await expect(page.locator('.header-toggle')).toBeHidden();

  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(horizontalOverflow).toBeLessThanOrEqual(0);

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('#header')).toBeVisible();
  await expect(page.locator('#navmenu a[href="#about"]')).toBeVisible();
  await context.close();
});

test('the skip link is the first stop for keyboard users and is not covered', async ({ page }) => {
  await page.goto('/CV/');

  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toHaveAttribute('href', '#main-content');
  const visibleUnderPointer = await focused.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return top === element || element.contains(top);
  });
  expect(visibleUnderPointer).toBe(true);
});

test('the mobile navigation is keyboard operable and exposes ARIA state', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/CV/');

  const toggle = page.locator('.header-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#header')).toHaveClass(/header-show/);
  await expect(page.locator('#main-content')).toHaveAttribute('inert', '');
  await expect(page.locator('.skip-link')).toHaveAttribute('inert', '');
  await expect(page.locator('#navmenu a').first()).toBeFocused();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#header')).not.toHaveClass(/header-show/);
  await expect(page.locator('#main-content')).not.toHaveAttribute('inert', '');
  await expect(page.locator('body')).toHaveCSS('overflow', 'visible');
  await expect(toggle).toBeFocused();
});

test('the closed mobile navigation is unreachable by keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/CV/');

  for (let index = 0; index < 15; index += 1) {
    await page.keyboard.press('Tab');
    const focusedInsideNav = await page.evaluate(() =>
      Boolean(document.activeElement?.closest('#navmenu, .social-links, .lang-switch')),
    );
    expect(focusedInsideNav).toBe(false);
  }
});

test('choosing a section in the mobile menu moves focus to that section', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/CV/');

  await page.locator('.header-toggle').click();
  await page.locator('#navmenu a[href="#about"]').click();

  await expect(page.locator('#about')).toBeFocused();
  await expect(page.locator('#about')).toHaveAttribute('tabindex', '-1');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test.describe('dark colour scheme', () => {
  test.use({ colorScheme: 'dark' });

  for (const { path, name } of pages) {
    test(`no serious or critical accessibility violations on ${name} in dark mode`, async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      const blocking = results.violations.filter(
        (violation) => violation.impact === 'critical' || violation.impact === 'serious',
      );
      expect(
        blocking.map((violation) => ({ id: violation.id, nodes: violation.nodes.length })),
        JSON.stringify(blocking, null, 2),
      ).toEqual([]);
    });
  }

  test('the online CV keeps its light tokens', async ({ page }) => {
    await page.goto('/CV/cv/');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('body')).toHaveClass(/cv-page/);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('continuous animations are disabled', async ({ page }) => {
    await page.goto('/CV/');

    const animation = await page
      .locator('.hero-availability-dot')
      .evaluate((element) => getComputedStyle(element).animationName);
    expect(animation).toBe('none');
    await expect(page.locator('[data-quote-pause]')).toBeHidden();
  });
});

test.describe('scroll reveal', () => {
  test('a jump to the bottom never leaves content invisible', async ({ page }) => {
    await page.goto('/CV/');
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, document.body.scrollHeight);
    });

    await expect
      .poll(
        () =>
          page
            .locator('[data-aos]')
            .evaluateAll(
              (elements) =>
                elements.filter((element) => getComputedStyle(element).opacity === '0').length,
            ),
        { timeout: 5000 },
      )
      .toBe(0);
  });

  test('a section below the fold still fades in on a normal scroll', async ({ page }) => {
    await page.goto('/CV/');
    const target = page.locator('#resume [data-aos]').first();
    await expect(target).toHaveClass(/aos-ready/);
    await expect(target).not.toHaveClass(/aos-animate/);

    const transition = await target.evaluate(
      (element) => getComputedStyle(element).transitionDuration,
    );
    expect(transition).not.toBe('0s');

    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveClass(/aos-animate/);
    await expect(target).toHaveCSS('opacity', '1');
  });
});
