import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const route of ['/', '/es/']) {
  test(`preserves Hero name separators in every style ${route}`, async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Math, 'random', { value: () => 0.51, configurable: true });
    });
    await page.goto(route);
    const name = page.locator('.hero-name');
    for (const mode of ['technical', 'noir', 'original', 'editorial']) {
      await expect(page.locator('html')).toHaveAttribute('data-style', mode);
      await expect(name).toHaveAttribute('aria-label', 'Angel Cánovas Mula');
      await expect(name.locator(':scope > span')).toHaveCount(3);
      await expect(name.locator(':scope > span').first()).toHaveCSS(
        'display',
        mode === 'noir' ? 'block' : 'inline',
      );
      if (mode !== 'noir') {
        await expect(name.locator(':scope > span').first()).toHaveCSS('margin-inline-end', /.+/);
      }
      await page.locator('[data-style-toggle]').click();
    }
  });

  test(`style cycle and technical graph ${route}`, async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Math, 'random', { value: () => 0.51, configurable: true });
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route);
    const root = page.locator('html');
    const button = page.locator('[data-style-toggle]');
    const progress = page.locator('[data-style-progress-backdrop]');
    const progressControl = page.locator('[data-style-progress-control]');
    const graph = page.locator('[data-technical-graph]');
    const canvas = page.locator('#hero-canvas');
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
    await expect(progress).toHaveAttribute('aria-hidden', 'true');
    await page.evaluate(() =>
      window.scrollTo(0, document.querySelector('#hero')?.clientHeight ?? 0),
    );
    await expect(progress).toBeVisible();
    await progressControl.evaluate((element) => (element as HTMLButtonElement).click());
    await expect(progressControl).toHaveAttribute('aria-pressed', 'true');
    for (const mode of ['noir', 'original', 'editorial', 'technical']) {
      await button.focus();
      await page.keyboard.press('Enter');
      await expect(root).toHaveAttribute('data-style', mode);
      if (mode === 'original') {
        await expect(canvas).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
      }
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

test('restores the reading position when the viewport moves while a style change settles', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.51, configurable: true });
  });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo({ top: 4_000, behavior: 'instant' }));
  await page.evaluate(() => {
    // Scroll anchoring would itself protect the view, so the check owns the move.
    document.documentElement.style.overflowAnchor = 'none';
    document.querySelector<HTMLButtonElement>('[data-style-toggle]')?.click();
    // A reflow moves the document while the new style settles.
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await expect(page.locator('html')).toHaveAttribute('data-style', 'noir');
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(4_000);
});

test('automatically cycles styles and the progress control pauses and resumes the remaining time', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.51, configurable: true });
  });
  await page.goto('/');
  const root = page.locator('html');
  const progress = page.locator('[data-style-progress-backdrop]');
  const progressControl = page.locator('[data-style-progress-control]');
  const track = page.locator('[data-style-progress-backdrop] [data-style-progress-track]');

  await expect(root).toHaveAttribute('data-style', 'technical');
  await expect(progressControl).toHaveAttribute('aria-pressed', 'false');
  await expect
    .poll(async () => Number(await track.getAttribute('aria-valuenow')), { timeout: 4_000 })
    .toBeGreaterThan(0);

  await progressControl.evaluate((element) => (element as HTMLButtonElement).click());
  await expect(progressControl).toHaveAttribute('aria-pressed', 'true');
  const pausedValue = await track.getAttribute('aria-valuenow');
  await page.waitForTimeout(1_000);
  await expect(track).toHaveAttribute('aria-valuenow', pausedValue ?? '0');
  await expect(root).toHaveAttribute('data-style', 'technical');

  await page.waitForTimeout(1_000);
  await expect(progress).toHaveCount(1);
  await page.evaluate(() => window.scrollTo({ top: 4_000, behavior: 'instant' }));
  await expect(progress).toBeVisible();
  const scrollBeforeChange = await page.evaluate(() => Math.round(window.scrollY));
  await progressControl.evaluate((element) => (element as HTMLButtonElement).click());
  await expect(progressControl).toHaveAttribute('aria-pressed', 'false');

  // The indicator warns during the last five seconds and never steals the scroll.
  await expect
    .poll(async () => Number(await track.getAttribute('aria-valuenow')), { timeout: 32_000 })
    .toBeGreaterThanOrEqual(83);
  await expect(progress).toHaveClass(/style-progress--warning/);
  await expect.poll(() => root.getAttribute('data-style'), { timeout: 10_000 }).toBe('noir');
  await expect(progress).not.toHaveClass(/style-progress--warning/);
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(scrollBeforeChange);
});

test('original keeps shared button and section geometry across visual styles', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.01, configurable: true });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  const captureGeometry = () =>
    page.evaluate(() => {
      const selectors = [
        '.hero-actions',
        '.hero-btn',
        '.section-title',
        '.section-title h2',
        '.sidebar-cv',
        '.sidebar-controls',
      ];
      return Object.fromEntries(
        selectors.map((selector) => {
          const element = document.querySelector<HTMLElement>(selector);
          if (!element) throw new Error(`Missing geometry target: ${selector}`);
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return [
            selector,
            {
              top: Math.round(rect.top * 100) / 100,
              left: Math.round(rect.left * 100) / 100,
              width: Math.round(rect.width * 100) / 100,
              height: Math.round(rect.height * 100) / 100,
              display: style.display,
              padding: style.padding,
              borderRadius: style.borderRadius,
            },
          ];
        }),
      );
    });

  const original = await captureGeometry();
  for (const style of ['editorial', 'technical']) {
    await page.evaluate((nextStyle) => {
      document.documentElement.dataset.style = nextStyle;
    }, style);
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
    );
    expect(await captureGeometry()).toEqual(original);
  }
});

test('hides the custom progress while Hero is visible and restores the mobile sidebar bar', async ({
  browser,
}) => {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.51, configurable: true });
  });
  await desktop.goto('/');
  const backdrop = desktop.locator('[data-style-progress-backdrop]');
  await expect(backdrop).toHaveAttribute('aria-hidden');
  await expect(backdrop).toHaveAttribute('data-hero-visible', 'true');
  await expect(backdrop).toHaveAttribute('inert', '');
  await expect(backdrop).toHaveCSS('visibility', 'hidden');
  await desktop.evaluate(() =>
    window.scrollTo(0, document.querySelector('#hero')?.clientHeight ?? 0),
  );
  await expect(backdrop).toBeVisible();
  await expect(backdrop).not.toHaveAttribute('aria-hidden', 'true');
  await expect(backdrop).toHaveAttribute('data-hero-visible', 'false');
  await expect(backdrop).not.toHaveAttribute('inert');
  await desktop.close();

  const mobile = await browser.newPage({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  await mobile.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.51, configurable: true });
  });
  await mobile.goto('/');
  await expect(mobile.locator('[data-style-progress-backdrop]')).toHaveCSS('display', 'none');
  await mobile.locator('.header-toggle').click();
  await expect(mobile.locator('[data-style-progress-mobile]')).toBeVisible();
  await mobile.locator('[data-style-progress-mobile]').tap();
  await expect(mobile.locator('[data-style-progress-mobile]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(mobile.locator('[data-style-progress-control]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await mobile.locator('[data-style-progress-mobile]').tap();
  await expect(mobile.locator('[data-style-progress-control]')).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await mobile.close();
});

test('keeps hidden backdrop state and restores the pipe across visibility changes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.51, configurable: true });
  });
  await page.goto('/');
  const backdrop = page.locator('[data-style-progress-backdrop]');
  const control = backdrop.locator('[data-style-progress-control]');
  const track = backdrop.locator('[data-style-progress-track]');

  await expect(backdrop).toHaveAttribute('data-hero-visible', 'true');
  await expect(backdrop).toBeHidden();
  await expect(backdrop).toHaveAttribute('aria-hidden');
  await expect(backdrop).toHaveAttribute('inert', '');

  await page.evaluate(() => window.scrollTo(0, document.querySelector('#hero')?.clientHeight ?? 0));
  await expect(backdrop).toBeVisible();
  await expect(backdrop).not.toHaveAttribute('aria-hidden', 'true');
  await expect(backdrop).not.toHaveAttribute('inert');
  await expect
    .poll(async () => Number(await track.getAttribute('aria-valuenow')))
    .toBeGreaterThan(0);

  await control.click();
  await expect(control).toHaveAttribute('aria-pressed', 'true');
  await page.setViewportSize({ width: 1199, height: 900 });
  await expect(backdrop).toHaveCSS('display', 'none');
  await expect(backdrop).toHaveAttribute('inert', '');
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect(backdrop).toBeVisible();
  await expect(backdrop).not.toHaveAttribute('inert');

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(backdrop).toHaveAttribute('data-hero-visible', 'true');
  await expect(backdrop).toHaveAttribute('aria-hidden');
  await expect(backdrop).toHaveAttribute('inert', '');
});

test('keeps the noir name in three independent Hero rows', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.76, configurable: true });
  });
  await page.goto('/');
  const name = page.locator('.hero-name');
  const rows = name.locator(':scope > span');
  await expect(page.locator('html')).toHaveAttribute('data-style', 'noir');
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toHaveText('Angel');
  await expect(rows.nth(1)).toHaveText('Cánovas');
  await expect(rows.nth(2)).toHaveText('Mula');
  for (let index = 0; index < 3; index += 1)
    await expect(rows.nth(index)).toHaveCSS('display', 'block');
});

test('theme changes show a visual transition and the progress pipe stays visible', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.51, configurable: true });
  });
  await page.goto('/');
  const root = page.locator('html');
  const button = page.locator('[data-style-toggle]');
  const tube = page.locator('[data-style-progress-tube]');
  const tubeCanvas = page.locator('[data-style-progress-tube-canvas]');

  await page.evaluate(() => window.scrollTo(0, document.querySelector('#hero')?.clientHeight ?? 0));
  await expect(tube).toBeVisible();
  if (pageErrors.length) throw new Error(pageErrors.join('\n'));
  await expect(tubeCanvas).toHaveJSProperty('width', 48);
  const transitionStarted = page.evaluate(
    () =>
      new Promise<boolean>((resolve) => {
        const element = document.documentElement;
        if (element.hasAttribute('data-style-transition')) {
          resolve(true);
          return;
        }
        const observer = new MutationObserver(() => {
          if (element.hasAttribute('data-style-transition')) {
            observer.disconnect();
            resolve(true);
          }
        });
        observer.observe(element, { attributes: true, attributeFilter: ['data-style-transition'] });
      }),
  );
  await button.click();
  await expect(root).toHaveAttribute('data-style', 'noir');
  expect(await transitionStarted).toBe(true);
  await expect
    .poll(() => root.getAttribute('data-style-transition'), { timeout: 2_000 })
    .toBeNull();
});

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

test('noir bonfire keeps its hilt above the flame and responds to a fine pointer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.76, configurable: true });
  });
  await page.goto('/');
  const artwork = page.locator('[data-noir-bonfire]');
  await expect(page.locator('html')).toHaveAttribute('data-style', 'noir');
  await expect(artwork.locator('[data-sword-orientation]')).toHaveAttribute(
    'data-sword-orientation',
    'hilt-up-tip-down',
  );
  const box = await artwork.boundingBox();
  if (!box) throw new Error('the noir bonfire has no box to interact with');
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.56);
  await expect(artwork).toHaveAttribute('data-noir-hover', 'true');
  await expect
    .poll(() => artwork.evaluate((element) => element.style.getPropertyValue('--noir-hover')))
    .not.toBe('');
  await page.evaluate(() => {
    document.getElementById('hero')?.dispatchEvent(new PointerEvent('pointerleave'));
  });
  await expect(artwork).not.toHaveAttribute('data-noir-hover', 'true');
});

test('original style keeps section headings compact and stacked for print', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.01, configurable: true });
  });
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('html')).toHaveAttribute('data-style', 'original');
  const heading = page.locator('.section-title').first();
  await expect(heading).toHaveCSS('display', 'block');
  await expect(heading.locator('h2')).toHaveCSS('font-size', '24px');
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
      const progress = page.locator('[data-style-progress-backdrop]');
      const progressControl = page.locator('[data-style-progress-control]');
      await expect(progress).toHaveAttribute('aria-hidden', 'true');
      await progressControl.evaluate((element) => (element as HTMLButtonElement).click());
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('html')).toHaveAttribute('data-style', mode);
      if (mode === 'original') {
        await expect(page.locator('#hero-canvas')).toHaveAttribute('data-ready', 'true', {
          timeout: 10000,
        });
        await page.waitForTimeout(500);
      }
      await expect(page).toHaveScreenshot(`${mode}-${colorScheme}.png`, {
        timeout: 30000,
        animations: 'disabled',
        maxDiffPixels: mode === 'noir' ? 25000 : 32,
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
