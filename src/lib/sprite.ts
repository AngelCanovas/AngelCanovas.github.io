import { icons } from './icons';

/**
 * Build one SVG sprite from the inline icon set. Pages then render
 * `<use href="/sprite.svg#name">` instead of repeating the path markup on every
 * icon, and the browser can cache the sprite across pages.
 */
export function buildSprite(source: Record<string, string> = icons): string {
  const symbols = Object.entries(source)
    .map(([name, markup]) => `<symbol id="${name}" viewBox="0 0 16 16">${markup}</symbol>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>`;
}
