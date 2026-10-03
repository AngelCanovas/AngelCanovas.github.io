import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    __konami?: number;
  }
}

test('the HTML comment easter egg is present in the page source', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('Konami code');
});

test('the developer console greets curious visitors', async ({ page }) => {
  const messages: string[] = [];
  page.on('console', (message) => messages.push(message.text()));
  await page.goto('/');
  await expect.poll(() => messages.some((message) => message.includes('██'))).toBe(true);
  expect(messages.some((message) => message.includes('curious developer'))).toBe(true);
});

test('the Konami code fires the hero backdrop easter egg', async ({ page }) => {
  await page.addInitScript(() => {
    window.__konami = 0;
    window.addEventListener('portfolio:konami', () => {
      window.__konami = (window.__konami ?? 0) + 1;
    });
  });
  await page.goto('/');

  const sequence = [
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
  ];
  for (const key of sequence) await page.keyboard.press(key);

  await expect.poll(() => page.evaluate(() => window.__konami)).toBe(1);
});
