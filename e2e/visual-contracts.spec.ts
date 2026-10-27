import { expect, test, type Page } from '@playwright/test';
import { quotes } from '../src/data/site';
import { getContent, type Lang } from '../src/lib/i18n';

async function quoteContent(page: Page, lang: Lang) {
  const text = (await page.locator('[data-quote-text]').innerText()).trim();
  const quote = quotes.find((quote) => quote.text[lang] === text);
  expect(quote, 'Rendered quote must belong to the published locale').toBeDefined();
  await expect(page.locator('[data-quote-author]')).toHaveText(`— ${quote!.author}`);
  return text;
}

async function quoteGeometry(page: Page) {
  const card = await page.locator('[data-quote]').boundingBox();
  const text = await page.locator('[data-quote-text]').boundingBox();
  const author = await page.locator('[data-quote-author]').boundingBox();
  expect(card).not.toBeNull();
  for (const box of [text, author]) {
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
    expect(box!.x).toBeGreaterThanOrEqual(card!.x);
    expect(box!.x + box!.width).toBeLessThanOrEqual(card!.x + card!.width);
    expect(box!.y).toBeGreaterThanOrEqual(card!.y);
    expect(box!.y + box!.height).toBeLessThanOrEqual(card!.y + card!.height);
  }
  expect(author!.y).toBeGreaterThanOrEqual(text!.y + text!.height);
}

for (const lang of ['en', 'es'] as const) {
  const route = lang === 'en' ? '/' : '/es/';

  test(`unmodified reduced-motion quote and accessible roles match published content ${lang}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install();
    await page.goto(route);
    const content = getContent(lang);
    const typed = page.locator('[data-typed-items]');
    await expect(typed).toHaveText(content.hero.roles[0]);
    expect(JSON.parse((await typed.getAttribute('data-typed-items'))!)).toEqual(content.hero.roles);
    await expect(page.locator('.hero-role-stack')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.hero-role > .visually-hidden')).toHaveText(
      content.hero.roles.join(' · '),
    );
    const quote = await quoteContent(page, lang);
    await expect(page.locator('[data-quote-pause]')).toBeHidden();
    const interval = Number(await page.locator('[data-quote]').getAttribute('data-interval'));
    expect(interval).toBeGreaterThan(0);
    await page.clock.fastForward(interval * 2);
    await expect(typed).toHaveText(content.hero.roles[0]);
    await expect(page.locator('[data-quote-text]')).toHaveText(quote);
    await quoteContent(page, lang);
  });

  test(`real quote rotation preserves text, attribution, geometry and keyboard pause ${lang}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T00:01:00Z'));
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const card = page.locator('[data-quote]');
    const button = page.locator('[data-quote-pause]');
    const interval = Number(await card.getAttribute('data-interval'));
    expect(interval).toBeGreaterThan(0);
    const fade = await page
      .locator('[data-quote-text]')
      .evaluate(
        (element) =>
          Math.max(...getComputedStyle(element).transitionDuration.split(',').map(parseFloat)) *
          1000,
      );
    const advance = async () => {
      await page.clock.fastForward(interval);
      await page.clock.runFor(fade);
      await expect(card).not.toHaveClass(/is-changing/);
    };
    await quoteContent(page, lang);
    await advance();
    const first = await quoteContent(page, lang);
    await advance();
    const second = await quoteContent(page, lang);
    expect(second).not.toBe(first);
    await button.scrollIntoViewIfNeeded();
    await quoteGeometry(page);
    await button.focus();
    await expect(button).toBeFocused();
    await advance();
    await expect(page.locator('[data-quote-text]')).toHaveText(second);
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toHaveAccessibleName(getContent(lang).quote.resume);
    await page.locator('#quote').evaluate((element) => {
      element.setAttribute('tabindex', '-1');
      element.focus();
    });
    await advance();
    await expect(page.locator('[data-quote-text]')).toHaveText(second);
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(button).toHaveAccessibleName(getContent(lang).quote.pause);
    await page.locator('#quote').focus();
    await advance();
    expect(await quoteContent(page, lang)).not.toBe(second);
    await quoteGeometry(page);
  });
}
