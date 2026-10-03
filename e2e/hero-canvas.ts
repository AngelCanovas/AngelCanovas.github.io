import type { Page } from '@playwright/test';

export const HERO_CANVAS = '#hero-canvas';

/**
 * Fingerprint of the hero backdrop bitmap: sums the red channel of every pixel
 * (transparent areas included) so even a small lit trail changes the value.
 * Returns -1 when there is no canvas or nothing has been painted at all.
 */
export async function canvasChecksum(page: Page): Promise<number> {
  return page.evaluate((selector) => {
    const canvas = document.querySelector(selector);
    if (!(canvas instanceof HTMLCanvasElement)) return -1;
    const context = canvas.getContext('2d');
    if (!context || canvas.width === 0 || canvas.height === 0) return -1;
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let checksum = 0;
    let painted = 0;
    for (let index = 0; index < data.length; index += 4) {
      if (data[index + 3] > 0) painted += 1;
      checksum = (checksum + data[index] * ((index % 31) + 1)) % 1_000_000_007;
    }
    return painted > 0 ? checksum : -1;
  }, HERO_CANVAS);
}

/** Drags the pointer across the hero so the trail has glyphs to light up. */
export async function sweepHero(page: Page, steps = 24): Promise<void> {
  const box = await page.locator('#hero').boundingBox();
  if (!box) throw new Error('the hero section has no box to sweep');
  const startX = box.x + box.width * 0.25;
  const endX = box.x + box.width * 0.85;
  const y = box.y + box.height * 0.35;
  for (let step = 0; step <= steps; step += 1) {
    await page.mouse.move(startX + ((endX - startX) * step) / steps, y);
    await page.waitForTimeout(16);
  }
}
