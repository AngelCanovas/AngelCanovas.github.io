import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    Object.defineProperty(Math, 'random', { value: () => 0.51, configurable: true });
  });
});

for (const route of ['/cv/', '/cv/es/', '/404.html']) {
  test(`auxiliary runtime excludes portfolio composition and preserves shared controls ${route}`, async ({
    page,
  }) => {
    const scripts: Promise<{ path: string; source: string }>[] = [];
    const messages: string[] = [];
    const errors: string[] = [];
    page.on('response', (response) => {
      const path = new URL(response.url()).pathname;
      if (path.endsWith('.js')) {
        scripts.push(response.text().then((source) => ({ path, source })));
      }
    });
    page.on('console', (message) => {
      messages.push(message.text());
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      window.addEventListener('portfolio:konami', () => {
        document.body.dataset.runtimeKonami = 'true';
      });
    });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const loaded = await Promise.all(scripts);
    expect(loaded.length).toBeGreaterThan(0);
    const portfolioScripts = loaded
      .filter((script) => /data-style-(?:toggle|progress-backdrop)/.test(script.source))
      .map((script) => script.path);
    expect(portfolioScripts).toEqual([]);
    expect(
      loaded.some((script) =>
        /\/(?:hero-code-backdrop|hero-backdrop)\.[^/]+\.js$/.test(script.path),
      ),
    ).toBe(false);
    await expect(page.locator('html')).toHaveAttribute('data-style', 'technical');
    const greeting = await page.locator('body').getAttribute('data-console-message');
    expect(greeting).toBeTruthy();
    expect(messages.some((message) => message.includes(greeting ?? ''))).toBe(true);
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
    for (const key of [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ]) {
      await page.keyboard.press(key);
    }
    await expect(page.locator('body')).toHaveAttribute('data-runtime-konami', 'true');
    expect(errors).toEqual([]);
  });
}

for (const [route, lang] of [
  ['/', 'en'],
  ['/es/', 'es'],
]) {
  test(`shared runtime updates every footer year beyond the static build ${route}`, async ({
    page,
    request,
  }) => {
    const response = await request.get(route);
    expect(response.ok()).toBe(true);
    const serverYears = await page.evaluate(
      (html) => {
        const document = new DOMParser().parseFromString(html, 'text/html');
        return Array.from(
          document.querySelectorAll('[data-current-year]'),
          (element) => element.textContent?.trim() ?? '',
        );
      },
      await response.text(),
    );
    expect(serverYears.length).toBeGreaterThan(0);
    expect(serverYears.every((year) => /^\d{4}$/.test(year))).toBe(true);
    const year = Math.max(...serverYears.map(Number)) + 1;
    expect(serverYears).not.toContain(String(year));
    await page.clock.setFixedTime(new Date(Date.UTC(year, 5, 15, 12)));
    await page.addInitScript((lang) => localStorage.setItem('lang', lang), lang);
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    const years = page.locator('[data-current-year]');
    await expect(years).toHaveCount(serverYears.length);
    await expect(years).toHaveText(serverYears.map(() => String(year)));
  });
}

for (const [route, lang, otherRoute, otherLang] of [
  ['/cv/', 'en', '/cv/es/', 'es'],
  ['/cv/es/', 'es', '/cv/', 'en'],
]) {
  test(`CV keeps email, print and standalone language preference ${route}`, async ({ page }) => {
    await page.goto(route);
    const email = page.locator('[data-email-link]');
    const user = await email.getAttribute('data-email-user');
    const domain = await email.getAttribute('data-email-domain');
    expect(user && domain).toBeTruthy();
    await expect(email).toHaveAttribute('href', `mailto:${user}@${domain}`);
    await page.evaluate((lang) => {
      localStorage.setItem('lang', lang);
      sessionStorage.setItem('portfolio-scroll-section', 'preserve-standalone-state');
      window.print = () => {
        document.body.dataset.runtimePrinted = 'true';
      };
    }, lang);
    await page.locator('[data-print-cv]').click();
    await expect(page.locator('body')).toHaveAttribute('data-runtime-printed', 'true');
    await page.locator(`[data-set-standalone-lang="${otherLang}"]`).click();
    await expect(page).toHaveURL(otherRoute);
    await expect(page.locator('html')).toHaveAttribute('lang', otherLang);
    expect(await page.evaluate(() => localStorage.getItem('lang'))).toBe(otherLang);
    expect(await page.evaluate(() => sessionStorage.getItem('portfolio-scroll-section'))).toBe(
      'preserve-standalone-state',
    );
    await expect(page.locator('[data-email-link]')).toHaveAttribute(
      'href',
      `mailto:${user}@${domain}`,
    );
  });

  test(`CV retains shared fragment initialization ${route}`, async ({ page }) => {
    await page.addInitScript(() => {
      const nativeScroll = window.scrollTo;
      window.scrollTo = ((...args: [ScrollToOptions] | [number, number]) => {
        if (typeof args[0] === 'object') {
          document.documentElement.dataset.runtimeHashTop = String(args[0].top);
        }
        Reflect.apply(nativeScroll, window, args);
      }) as typeof window.scrollTo;
    });
    await page.goto(`${route}#main-content`);
    const top = await page.locator('#main-content').evaluate((element) => {
      const target = element as HTMLElement;
      return (
        target.offsetTop - (Number.parseInt(getComputedStyle(target).scrollMarginTop, 10) || 0)
      );
    });
    await expect(page.locator('html')).toHaveAttribute('data-runtime-hash-top', String(top));
    expect(new URL(page.url()).hash).toBe('#main-content');
  });
}
