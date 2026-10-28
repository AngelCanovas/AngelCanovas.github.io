import { expect, test, type Page } from '@playwright/test';

import { canvasChecksum } from './hero-canvas';

const codeChunk = /\/hero-code-backdrop\.[^/]+\.js$/;

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await page.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.51, configurable: true });
  });
});

async function failStorage(
  page: Page,
  storage: 'localStorage' | 'sessionStorage',
  method: 'getItem' | 'setItem' | 'removeItem',
  key: string,
  seed?: string,
) {
  let faults = 0;
  await page.exposeFunction('recordRuntimeStorageFault', () => {
    faults += 1;
  });
  await page.addInitScript(
    ({ storage, method, key, seed }) => {
      const target = window[storage];
      if (seed !== undefined) target.setItem(key, seed);
      const native = Storage.prototype[method];
      Object.defineProperty(Storage.prototype, method, {
        configurable: true,
        value: function (this: Storage, ...args: string[]) {
          if (this === target && args[0] === key) {
            void (
              window as unknown as { recordRuntimeStorageFault: () => Promise<void> }
            ).recordRuntimeStorageFault();
            throw new DOMException('Storage unavailable', 'SecurityError');
          }
          return Reflect.apply(native, this, args);
        },
      });
    },
    { storage, method, key, seed },
  );
  return () => faults;
}

async function expectSection(page: Page, id: string) {
  await expect
    .poll(() =>
      page.locator(`#${id}`).evaluate((element) => {
        const target = element as HTMLElement;
        const margin = Number.parseInt(getComputedStyle(target).scrollMarginTop, 10) || 0;
        return Math.abs(scrollY - (target.offsetTop - margin));
      }),
    )
    .toBeLessThan(2);
  expect(await page.evaluate(() => history.scrollRestoration)).toBe('auto');
}

test('persisted pageshow event contract realigns preference without navigating or moving the viewport', async ({
  page,
}) => {
  await page.goto('/?runtime=pageshow#resume');
  await expectSection(page, 'resume');
  const before = await page.evaluate(() => ({ url: location.href, top: scrollY }));
  await page.evaluate(() => {
    localStorage.setItem('lang', 'es');
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: false }));
  });
  expect(await page.evaluate(() => localStorage.getItem('lang'))).toBe('es');
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });
  expect(await page.evaluate(() => localStorage.getItem('lang'))).toBe('en');
  expect(await page.evaluate(() => ({ url: location.href, top: scrollY }))).toEqual(before);
  expect(await page.evaluate(() => history.scrollRestoration)).toBe('auto');
});

test('persisted pageshow event contract tolerates a denied preference write', async ({ page }) => {
  const faults = await failStorage(page, 'localStorage', 'setItem', 'lang', 'en');
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.lang = 'es';
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });
  await expect.poll(faults).toBeGreaterThan(0);
  expect(await page.evaluate(() => localStorage.getItem('lang'))).toBe('es');
  await expect(page).toHaveURL('/');
  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test.describe('denied preference read', () => {
  test.use({ locale: 'es-ES' });

  test('falls back to browser language and retains query and fragment', async ({ page }) => {
    const faults = await failStorage(page, 'localStorage', 'getItem', 'lang');
    await page.goto('/?runtime=storage#resume');
    await expect(page).toHaveURL('/es/?runtime=storage#resume');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect.poll(faults).toBeGreaterThan(0);
    await expectSection(page, 'resume');
  });
});

test.describe('crawler guard with unavailable storage', () => {
  test.use({ locale: 'es-ES', userAgent: 'Googlebot/2.1' });

  test('does not redirect a Spanish crawler even when preference reads would throw', async ({
    page,
  }) => {
    const faults = await failStorage(page, 'localStorage', 'getItem', 'lang');
    await page.goto('/?runtime=bot#resume');
    await expect(page.locator('[data-style-toggle]')).toHaveAttribute('data-initialized', 'true');
    await expect(page).toHaveURL('/?runtime=bot#resume');
    expect(faults()).toBe(0);
  });
});

test('denied language writes still navigate with the query and current section', async ({
  page,
}) => {
  const faults = await failStorage(page, 'localStorage', 'setItem', 'lang', 'en');
  await page.goto('/?runtime=write#resume');
  await expectSection(page, 'resume');
  await page.locator('[data-set-lang="es"]').click();
  await expect(page).toHaveURL('/es/?runtime=write#resume');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect.poll(faults).toBeGreaterThan(0);
  expect(await page.evaluate(() => localStorage.getItem('lang'))).toBe('en');
  await expectSection(page, 'resume');
});

for (const [method, seed] of [
  ['getItem', 'resume'],
  ['setItem', undefined],
  ['removeItem', 'resume'],
] as const) {
  test(`denied section ${method} preserves language navigation and hash scrolling`, async ({
    page,
  }) => {
    const faults = await failStorage(
      page,
      'sessionStorage',
      method,
      'portfolio-scroll-section',
      seed,
    );
    await page.goto('/?runtime=session#resume');
    await expectSection(page, 'resume');
    await page.locator('[data-set-lang="es"]').click();
    await expect(page).toHaveURL('/es/?runtime=session#resume');
    await expect.poll(faults).toBeGreaterThan(0);
    await expectSection(page, 'resume');
    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
}

test('Back realigns preference and reload keeps query and hash without a redirect loop', async ({
  page,
}) => {
  await page.goto('/?runtime=history#resume');
  await expectSection(page, 'resume');
  await page.locator('[data-set-lang="es"]').click();
  await expect(page).toHaveURL('/es/?runtime=history#resume');
  await page.goBack();
  await expect(page).toHaveURL('/?runtime=history#resume');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('lang'))).toBe('en');
  await page.reload();
  await expect(page).toHaveURL('/?runtime=history#resume');
  await expectSection(page, 'resume');
});

test('pagehide event contract returns scroll restoration to the browser before load', async ({
  page,
}) => {
  const release = Promise.withResolvers<void>();
  await page.route('**/runtime-load-barrier.svg', async (route) => {
    await release.promise;
    await route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
    });
  });
  await page.addInitScript(() => {
    sessionStorage.setItem('portfolio-scroll-section', 'resume');
    window.addEventListener('DOMContentLoaded', () => {
      const barrier = document.createElement('img');
      barrier.hidden = true;
      barrier.src = '/runtime-load-barrier.svg';
      document.body.append(barrier);
    });
  });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe('manual');
    await page.evaluate(() => {
      window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
    });
    expect(await page.evaluate(() => history.scrollRestoration)).toBe('auto');
  } finally {
    release.resolve();
  }
  await page.waitForLoadState('load');
  await expectSection(page, 'resume');
  expect(await page.evaluate(() => sessionStorage.getItem('portfolio-scroll-section'))).toBeNull();
});

test('a late code chunk cannot replace the selected native waves renderer', async ({ page }) => {
  const requested = Promise.withResolvers<string>();
  const release = Promise.withResolvers<void>();
  await page.route(codeChunk, async (route) => {
    requested.resolve(route.request().url());
    await release.promise;
    await route.continue();
  });
  try {
    await page.goto('/');
    const toggle = page.locator('[data-style-toggle]');
    await toggle.click();
    await toggle.click();
    const chunk = await requested.promise;
    await expect(page.locator('#hero')).toHaveAttribute('data-hero-backdrop-mode', 'code');
    await toggle.click();
    await expect(page.locator('#hero')).toHaveAttribute('data-hero-backdrop-mode', 'waves');
    await expect.poll(() => canvasChecksum(page)).toBeGreaterThan(0);
    const waves = await canvasChecksum(page);
    release.resolve();
    await page.evaluate(async (url) => {
      await import(url);
      await new Promise<void>((resolve) => requestIdleCallback(() => resolve()));
    }, chunk);
    await expect(page.locator('#hero')).toHaveAttribute('data-hero-backdrop-mode', 'waves');
    expect(await canvasChecksum(page)).toBe(waves);
    await expect(page.locator('[data-style-progress-control]').first()).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  } finally {
    release.resolve();
  }
});

test('reselecting a cached code module paints again without fetching another chunk or resuming autoplay', async ({
  page,
}) => {
  let requests = 0;
  page.on('request', (request) => {
    if (codeChunk.test(new URL(request.url()).pathname)) requests += 1;
  });
  await page.goto('/');
  const toggle = page.locator('[data-style-toggle]');
  await toggle.click();
  await toggle.click();
  await expect.poll(() => canvasChecksum(page)).toBeGreaterThan(0);
  expect(requests).toBe(1);
  await toggle.click();
  await expect(page.locator('#hero')).toHaveAttribute('data-hero-backdrop-mode', 'waves');
  await expect(page.locator('#hero-canvas')).toHaveAttribute('data-ready', 'true');
  await toggle.click();
  await expect(page.locator('#hero')).toHaveAttribute('data-hero-backdrop-mode', 'none');
  expect(await canvasChecksum(page)).toBe(-1);
  await toggle.click();
  await toggle.click();
  await expect(page.locator('#hero')).toHaveAttribute('data-hero-backdrop-mode', 'code');
  await expect.poll(() => canvasChecksum(page)).toBeGreaterThan(0);
  expect(requests).toBe(1);
  await expect(page.locator('[data-style-progress-control]').first()).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('an aborted renderer chunk leaves complete content and shared controls usable', async ({
  page,
}) => {
  let initializationErrors = 0;
  let uncaughtErrors = 0;
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().startsWith('[init]'))
      initializationErrors += 1;
  });
  page.on('pageerror', () => {
    uncaughtErrors += 1;
  });
  await page.route(codeChunk, (route) => route.abort('failed'));
  await page.goto('/?runtime=abort');
  const content = await page.locator('main').textContent();
  const toggle = page.locator('[data-style-toggle]');
  await toggle.click();
  await toggle.click();
  await expect.poll(() => initializationErrors).toBe(1);
  expect((await page.locator('main').textContent()) === content).toBe(true);
  await expect(page.locator('footer')).toBeAttached();
  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await toggle.click();
  await expect(page.locator('#hero')).toHaveAttribute('data-hero-backdrop-mode', 'waves');
  await expect.poll(() => canvasChecksum(page)).toBeGreaterThan(0);
  await page.locator('[data-set-lang="es"]').click();
  await expect(page).toHaveURL('/es/?runtime=abort');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  expect(uncaughtErrors).toBe(0);
});
