import { describe, expect, it } from 'vitest';

import { icons } from './icons';
import { buildSprite } from './sprite';

const sprite = buildSprite();

describe('buildSprite', () => {
  it('wraps every icon in a symbol with the shared 16x16 viewBox', () => {
    const names = Object.keys(icons);
    expect(sprite).toContain('<svg xmlns="http://www.w3.org/2000/svg">');
    expect(sprite.match(/<symbol /g)).toHaveLength(names.length);
    for (const name of names) {
      expect(sprite).toContain(`<symbol id="${name}" viewBox="0 0 16 16">`);
    }
  });

  it('keeps the icon paths and does not hardcode a fill', () => {
    expect(sprite).toContain(icons.download);
    expect(sprite).not.toContain('fill="#');
  });

  it('builds from an injected icon map', () => {
    const custom = buildSprite({ dot: '<path d="M0 0h1v1z"/>' });
    expect(custom).toContain('id="dot"');
    expect(custom).not.toContain('id="download"');
  });
});
