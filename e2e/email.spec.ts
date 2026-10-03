import { expect, test } from '@playwright/test';

const EMAIL = 'aca_dev@hotmail.com';

test('the address never appears in the static HTML', async ({ request }) => {
  for (const path of ['/CV/', '/CV/es/', '/CV/cv/', '/CV/cv/es/']) {
    const html = await (await request.get(path)).text();
    expect(html, path).not.toContain(EMAIL);
    expect(html, path).not.toContain('mailto:');
    expect(html, path).toContain('data-email-link');
  }
});

test('the mailto: link is assembled at runtime and readable', async ({ page }) => {
  await page.goto('/CV/');
  const link = page.locator('a[data-email-link]').first();
  await expect(link).toHaveAttribute('href', `mailto:${EMAIL}`);
  await expect(link).toHaveText(EMAIL);
});

test.describe('copy feedback', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('the copy button copies the address and shows the toast', async ({ page }) => {
    await page.goto('/CV/');
    const button = page.locator('.contact-copy[data-email-copy]');
    await expect(button).toHaveAttribute('aria-label', /copy|email/i);
    await button.click();
    const toast = page.locator('[data-contact-toast]');
    await expect(toast).toHaveCSS('visibility', 'visible');
    await expect(toast).toHaveText(/copied|aca_dev/i);
    expect(new URL(page.url()).hash).toBe('');
  });

  test('the email card and the CTA open the mail client', async ({ page }) => {
    await page.goto('/CV/');
    await expect(page.locator('.contact-card a[data-email-link]')).toHaveAttribute(
      'href',
      `mailto:${EMAIL}`,
    );
    await expect(page.locator('.contact-btn[data-email-link]')).toHaveAttribute(
      'href',
      `mailto:${EMAIL}`,
    );
  });
});
