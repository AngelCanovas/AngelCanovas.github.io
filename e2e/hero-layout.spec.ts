import { expect, test } from '@playwright/test';

for (const path of ['/CV/', '/CV/es/']) {
  test(`keeps the mobile hero still while its role is typed and erased on ${path}`, async ({
    page,
  }) => {
    for (const width of [320, 412]) {
      await page.setViewportSize({ width, height: 823 });
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);

      const positions = await page.evaluate(() => {
        const typed = document.querySelector<HTMLElement>('.typed');
        const subtitle = document.querySelector('.hero-subtitle');
        const actions = document.querySelector('.hero-actions');
        if (!typed || !subtitle || !actions) throw new Error('Hero content is missing');

        const original = typed.textContent;
        const roles = JSON.parse(typed.dataset.typedItems ?? '[]') as string[];
        const frames = ['', ...roles.flatMap((role) => [role.slice(0, 2), role])];
        const result = frames.map((text) => {
          typed.textContent = text;
          return {
            subtitle: subtitle.getBoundingClientRect().top,
            actions: actions.getBoundingClientRect().top,
          };
        });
        typed.textContent = original;
        return result;
      });

      for (const position of positions) {
        expect(Math.abs(position.subtitle - positions[0].subtitle)).toBeLessThan(0.5);
        expect(Math.abs(position.actions - positions[0].actions)).toBeLessThan(0.5);
      }
    }
  });
}
