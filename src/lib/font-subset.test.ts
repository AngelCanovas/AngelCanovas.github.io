import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('keeps the local Roboto Latin face identical to the upstream declaration', () => {
  const upstream = readFileSync('node_modules/@fontsource-variable/roboto/wght.css', 'utf8');
  const face = (upstream.match(/@font-face\s*\{[^}]+\}/g) ?? []).find((value) =>
    value.includes('./files/roboto-latin-wght-normal.woff2'),
  );
  expect(face).toBeDefined();
  const local = readFileSync('src/styles/fonts.css', 'utf8').replaceAll(
    '@fontsource-variable/roboto/',
    './',
  );
  const normalize = (value: string) =>
    value
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}:;,])\s*/g, '$1')
      .replace(/url\((['"])(.*?)\1\)/g, 'url($2)')
      .trim();
  expect(normalize(local)).toBe(normalize(face!));
});
