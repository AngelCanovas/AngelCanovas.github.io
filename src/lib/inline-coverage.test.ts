import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import config from '../../astro.config.mjs';

const integrations = config.integrations as Array<{
  name: string;
  hooks: { 'astro:build:done'?: (args: { dir: URL }) => void };
}>;
const buildDone = integrations.find((entry) => entry.name === 'inline-script-csp-hashes')!.hooks[
  'astro:build:done'
]!;
const hash = (source: string) => createHash('sha256').update(source, 'utf8').digest('base64');
let directory: string;

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'cv-inline-coverage-'));
});

afterEach(() => {
  rmSync(directory, { recursive: true, force: true });
});

function build(markup: string, script = '<script>void 0;</script>', styleHashes = '') {
  writeFileSync(
    join(directory, 'index.html'),
    `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="content-security-policy" content="script-src 'self'; style-src 'self' ${styleHashes}"></head><body>${script}${markup}</body></html>`,
  );
  buildDone({ dir: pathToFileURL(directory + '/') });
  return readFileSync(join(directory, 'index.html'), 'utf8');
}

describe('build-time inline attribute guard', () => {
  it.each([
    '<div style="color:red">x</div>',
    "<div style='color:red'>x</div>",
    '<div style=color:red>x</div>',
    '<div style = "color:red">x</div>',
    "<div STYLE\n=\n'color:red'>x</div>",
    '<button onclick="alert(1)">x</button>',
    "<button onclick='alert(1)'>x</button>",
    '<button onclick=alert(1)>x</button>',
    "<button ONCLICK \t= 'alert(1)'>x</button>",
    '<svg><g style=fill:red></g></svg>',
    "<svg><g onload = 'alert(1)'></g></svg>",
    '<svg><g onLoad="alert(1)"></g></svg>',
    '<button onclick>x</button>',
  ])('rejects a real inline attribute: %s', (markup) => {
    expect(() => build(markup)).toThrow(/uses an inline "/);
  });

  it.each([
    '<div data-style="color:red" data-onclick="example">x</div>',
    '<!-- <div style="color:red" onclick="example"> -->',
    '<p>&lt;div style="color:red" onclick="example"&gt;</p>',
    '<script>const example = \'<div style="color:red" onclick="example">\';</script>',
    '<style>p::after { content: \'<div style="color:red">\'; }</style>',
  ])('accepts inert examples and data attributes: %s', (markup) => {
    const style = markup.match(/^<style>([\s\S]*)<\/style>$/)?.[1];
    expect(() => build(markup, undefined, style ? `'sha256-${hash(style)}'` : '')).not.toThrow();
  });

  it('checks attributes even when there is no inline script to hash', () => {
    expect(() => build("<div style='color:red'>x</div>", '')).toThrow(/uses an inline "style"/);
  });

  it('checks attributes on document elements too', () => {
    build('');
    const file = join(directory, 'index.html');
    writeFileSync(file, readFileSync(file, 'utf8').replace('<body>', '<body style=color:red>'));
    expect(() => buildDone({ dir: pathToFileURL(directory + '/') })).toThrow(
      /uses an inline "style"/,
    );
  });

  it('hashes the original script and style bytes without DOM normalization', () => {
    const script = '\r\nconst example = "<div data-style=example>";\r\n';
    const style = '\r\nbody { color: red; }\r\n';
    const html = build(
      `<style>${style}</style>`,
      `<script>${script}</script>`,
      `'sha256-${hash(style)}'`,
    );
    expect(html).toContain(`<script>${script}</script>`);
    expect(html).toContain(`<style>${style}</style>`);
    expect(html).toContain(`'sha256-${hash(script)}'`);
    expect(html).not.toContain(`'sha256-${hash(script.replaceAll('\r\n', '\n'))}'`);
  });

  it('still rejects an inline style block without its original hash', () => {
    expect(() => build('<style>body { color: red; }</style>')).toThrow(
      /inline <style> block that the CSP does not cover/,
    );
  });
});
