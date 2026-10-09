import { withBase } from '../src/lib/base-path';
import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';

// Linux is the CI reference. Windows captures are review artifacts only.
const viewports = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

async function ready(page: Page) {
  // The canvas is painted in an idle callback. Its ready signal, rather than
  // machine speed, determines when the visual reference is meaningful.
  const canvas = page.locator('#hero-canvas');
  if (await canvas.count()) await expect(canvas).toHaveAttribute('data-ready', 'true');
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images, (image) => image.decode().catch(() => undefined)),
    );
    // Reduced motion stops typing, counters, drift and quote rotation. The
    // server chooses a random initial quote, so select a real, fixed item.
    const card = document.querySelector<HTMLElement>('[data-quote]');
    if (card) {
      const first = JSON.parse(card.dataset.quotes || '[]')[0];
      const text = card.querySelector('[data-quote-text]');
      const author = card.querySelector('[data-quote-author]');
      if (first && text && author) {
        text.textContent = first.text;
        author.textContent = `— ${first.author}`;
      }
    }
  });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(page.viewportSize()!.width);
}

async function capture(target: Page | Locator, name: string, info: TestInfo) {
  if ('scrollIntoViewIfNeeded' in target) await target.scrollIntoViewIfNeeded();
  const page = 'scrollIntoViewIfNeeded' in target ? target.page() : target;
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  const options = { animations: 'disabled' as const, caret: 'hide' as const };
  if (process.platform === 'linux') {
    await expect(target).toHaveScreenshot(`${name}.png`, {
      timeout: 30000,
      ...options,
      maxDiffPixels: 0,
      threshold: 0,
    });
  } else {
    const path = info.outputPath(`${name}-windows-review.png`);
    await target.screenshot({ ...options, path });
    await info.attach(name, { path, contentType: 'image/png' });
  }
}

test.use({ reducedMotion: 'reduce', locale: 'en-US', colorScheme: 'light' });
test.beforeEach(async ({ page }) => {
  // Visual references use the technical style baseline; product loads remain random.
  await page.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.8, configurable: true });
  });
});

for (const viewport of viewports) {
  for (const path of ['/', '/es/', '/cv/', '/cv/es/', '/404.html']) {
    const portfolio = path === '/' || path === '/es/';
    for (const theme of portfolio ? ['light', 'dark'] : ['light']) {
      const key = `${path.replaceAll('/', '-').replace('.html', '')}-${viewport.width}-${theme}`;
      test(`visual reference ${key}`, async ({ page }, info) => {
        await page.setViewportSize(viewport);
        await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
        await page.goto(withBase(path, '/'));
        await ready(page);
        await capture(page, `${key}-viewport`, info);
        const regions = portfolio
          ? [
              'about',
              'skills',
              'resume',
              'portfolio',
              'services',
              'contact',
              'quote',
              'footer',
              'stats',
            ]
          : ['main-content'];
        for (const id of regions) {
          await capture(page.locator(`#${id}`), `${key}-${id}`, info);
        }
        const measurements = await page.evaluate(() =>
          Array.from(document.querySelectorAll('main, section[id], #header, #footer'), (el) => {
            const box = el.getBoundingClientRect();
            const css = getComputedStyle(el);
            return {
              id: el.id,
              x: box.x,
              y: box.y + scrollY,
              width: box.width,
              height: box.height,
              padding: css.padding,
              color: css.color,
              background: css.backgroundColor,
              font: css.font,
            };
          }),
        );
        await info.attach('geometry', {
          body: JSON.stringify(measurements, null, 2),
          contentType: 'application/json',
        });
      });
    }
  }
}

for (const width of [375, 1440]) {
  test(`reading navigation and return to start at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    for (const id of ['about', 'portfolio', 'contact']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect(page.locator(`#navmenu a[href="#${id}"]`)).toHaveAttribute(
        'aria-current',
        'true',
      );
      await expect(page.locator('#scroll-top')).toBeVisible();
    }
    await page.locator('#scroll-top').click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator('#navmenu a[href="#hero"]')).toHaveAttribute('aria-current', 'true');
    await expect(page.locator('#scroll-top')).toBeHidden();
  });
}

for (const path of ['/', '/es/']) {
  for (const theme of ['light', 'dark']) {
    test(`visual interaction ${path} ${theme}`, async ({ page }, info) => {
      await page.setViewportSize(viewports[0]);
      await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
      await page.goto(withBase(path, '/'));
      await ready(page);
      const prefix = `${path === '/' ? 'en' : 'es'}-${theme}`;
      await page.locator('.header-toggle').click();
      await expect(page.locator('#navmenu a').first()).toBeFocused();
      await capture(page, `${prefix}-menu-focus`, info);
      await page.locator('#navmenu a[href="#about"]').hover();
      await capture(page, `${prefix}-menu-hover`, info);
      await page.keyboard.press('Escape');
      await expect(page.locator('.header-toggle')).toBeFocused();
      await page.locator('.filter-btn').nth(1).click();
      await expect(page.locator('.filter-btn').nth(1)).toHaveAttribute('aria-pressed', 'true');
      await page.mouse.move(0, 0);
      await capture(page.locator('#portfolio'), `${prefix}-filtered`, info);
      const detail = page.locator('.portfolio-item:not(.is-hidden) details').first();
      await detail.locator('summary').click();
      await expect(detail).toHaveAttribute('open', '');
      await capture(page.locator('#portfolio'), `${prefix}-details`, info);
    });
  }
}

for (const width of [320, 1199, 1200, 1201]) {
  for (const path of ['/', '/es/']) {
    test(`navigation geometry ${path} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(withBase(path, '/'));
      await ready(page);
      const main = await page.locator('#main-content').boundingBox();
      expect(main!.x).toBe(width >= 1200 ? 300 : 0);
      if (width < 1200) {
        await page.locator('.header-toggle').click();
        await page.locator('#mobile-nav-overlay').click({ position: { x: width - 5, y: 100 } });
        await expect(page.locator('.header-toggle')).toBeFocused();
        await page.locator('.header-toggle').click();
        await page.setViewportSize({ width: 1200, height: 900 });
        await expect(page.locator('#header')).not.toHaveClass(/header-show/);
        await expect(page.locator('#main-content')).not.toHaveAttribute('inert', '');
        await expect(page.locator('body')).toHaveCSS('overflow', 'visible');
      }
    });
  }
}

for (const path of ['/', '/es/', '/cv/', '/cv/es/']) {
  test(`print reference ${path}`, async ({ page }, info) => {
    await page.setViewportSize(viewports[2]);
    await page.goto(withBase(path, '/'));
    await ready(page);
    await page.emulateMedia({ media: 'print' });
    await capture(page.locator('#main-content'), `${path.replaceAll('/', '-')}-print`, info);
    await expect(page.locator('h1')).toBeVisible();
  });
}
