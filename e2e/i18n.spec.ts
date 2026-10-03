import { expect, test } from '@playwright/test';

test.describe('automatic language routing', () => {
  test('a stored preference wins over everything else', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('lang', 'es'));
    await page.goto('/');
    await page.waitForURL('**/es/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test.describe('spanish browser language', () => {
    test.use({ locale: 'es-ES' });

    test('redirects the English entry page keeping query string and hash', async ({ page }) => {
      await page.goto('/?utm_source=qa#contact');
      await page.waitForURL('**/es/?utm_source=qa#contact');
    });
  });

  test('a shared Spanish link is never bounced back to English', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('lang', 'en'));
    await page.goto('/es/');
    await page.waitForTimeout(800);
    expect(new URL(page.url()).pathname).toBe('/es/');
  });

  test('crawlers are never redirected', async ({ browser }) => {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForTimeout(1000);
    expect(new URL(page.url()).pathname).toBe('/');
    await context.close();
  });

  test('the Back button undoes a language change', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-set-lang="es"]').click();
    await page.waitForURL('**/es/');
    await page.goBack();
    await page.waitForURL((url) => new URL(url).pathname === '/');
    await page.waitForTimeout(800);
    expect(new URL(page.url()).pathname).toBe('/');
  });

  test('a history Back realigns the stored preference, so a reload stays put', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-set-lang="es"]').click();
    await page.waitForURL('**/es/');

    await page.goBack();
    await page.waitForURL((url) => new URL(url).pathname === '/');
    await page.reload();

    await page.waitForTimeout(800);
    expect(new URL(page.url()).pathname).toBe('/');
    expect(await page.evaluate(() => localStorage.getItem('lang'))).toBe('en');
  });
});

test.describe('language switch', () => {
  test('persists the choice and the section in view', async ({ page }) => {
    await page.goto('/');
    await page.locator('#resume').evaluate((element) => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, (element as HTMLElement).offsetTop);
    });
    await page.locator('[data-set-lang="es"]').click();
    await page.waitForURL('**/es/**');

    const stored = await page.evaluate(() => localStorage.getItem('lang'));
    expect(stored).toBe('es');

    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const resume = document.getElementById('resume');
          return resume ? Math.abs(window.scrollY - resume.offsetTop) : Number.POSITIVE_INFINITY;
        });
      })
      .toBeLessThan(150);

    await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe('auto');
  });

  test('the section in view wins over a stale hash', async ({ page }) => {
    await page.goto('/#portfolio');
    await page.locator('#resume').evaluate((element) => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, (element as HTMLElement).offsetTop);
    });
    await page.locator('[data-set-lang="es"]').click();
    await page.waitForURL('**/es/*');
    expect(new URL(page.url()).hash).toBe('#resume');

    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const resume = document.getElementById('resume');
          return resume ? Math.abs(window.scrollY - resume.offsetTop) : Number.POSITIVE_INFINITY;
        });
      })
      .toBeLessThan(150);
  });

  test('carries the query string to the other language', async ({ page }) => {
    await page.goto('/?utm_source=qa');
    await page.locator('[data-set-lang="es"]').click();
    await page.waitForURL('**/es/?utm_source=qa');
    expect(new URL(page.url()).searchParams.get('utm_source')).toBe('qa');
  });

  test('clicking the current language stores no scroll section', async ({ page }) => {
    await page.goto('/');
    await page.locator('#resume').evaluate((element) => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, (element as HTMLElement).offsetTop);
    });

    await page.locator('[data-set-lang="en"]').click();
    await page.waitForLoadState('load');

    expect(new URL(page.url()).hash).toBe('');
    expect(
      await page.evaluate(() => sessionStorage.getItem('portfolio-scroll-section')),
    ).toBeNull();
  });
});
