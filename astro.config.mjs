// @ts-check
import { defineConfig } from 'astro/config';
import purgecss from 'astro-purgecss';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

/**
 * @param {string} dir
 * @returns {string[]}
 */
function walkHtml(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/**
 * Fail closed on inline code the policy does not cover. A `<style>` block that
 * Astro did not hash, a `style="..."` attribute or an `on*="..."` handler is
 * silently blocked by `style-src 'self'` / `script-src` without
 * `'unsafe-inline'`, so the build stops instead of shipping a broken page.
 *
 * @param {string} html
 * @param {string} meta
 * @param {string} file
 */
function assertInlineCoverage(html, meta, file) {
  const policy = meta.match(/content="([^"]*)"/i)?.[1] ?? '';
  const styleDirective = policy.match(/(?:^|;)\s*style-src([^;]*)/i)?.[1] ?? '';
  const styleHashes = new Set(
    [...styleDirective.matchAll(/'sha256-([^']+)'/g)].map((match) => match[1]),
  );

  for (const block of html.matchAll(/<style\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/style>/gi)) {
    if (!block[1].trim()) continue;
    const digest = createHash('sha256').update(block[1], 'utf8').digest('base64');
    if (!styleHashes.has(digest)) {
      throw new Error(
        `inline-script-csp-hashes: ${file} ships an inline <style> block that the CSP does not ` +
          'cover, so the browser would drop it. Let Astro process the styles or hash them here.',
      );
    }
  }

  const inlineAttribute = html.match(/<[a-z][^>]*\s(style|on[a-z]+)="/i)?.[1];
  if (inlineAttribute) {
    throw new Error(
      `inline-script-csp-hashes: ${file} uses an inline "${inlineAttribute}" attribute, which ` +
        'the policy blocks. Use a class or a data attribute and let the client module set it ' +
        'through the CSSOM (see the Open Graph script for the sidebar trick).',
    );
  }
}

/**
 * Astro's CSP hashes processed/bundled scripts, but not `is:inline` ones. The
 * JSON-LD blocks and the tiny theme bootstrap must stay inline, so after the
 * build we compute the hash of every inline script and append it to the page's
 * CSP `script-src` so no violation is raised.
 */
function inlineScriptCspHashes() {
  return {
    name: 'inline-script-csp-hashes',
    hooks: {
      /** @param {{ dir: URL }} args */
      'astro:build:done': (args) => {
        const root = fileURLToPath(args.dir);
        for (const file of walkHtml(root)) {
          let html = readFileSync(file, 'utf8');
          const hashes = new Set();
          const re = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
          let match;
          while ((match = re.exec(html))) {
            if (!match[1].trim()) continue;
            const digest = createHash('sha256').update(match[1], 'utf8').digest('base64');
            hashes.add(`'sha256-${digest}'`);
          }
          if (hashes.size === 0) continue;

          const metaPattern = /<meta[^>]*http-equiv="content-security-policy"[^>]*>/i;
          const meta = html.match(metaPattern)?.[0];
          if (!meta) {
            throw new Error(
              `inline-script-csp-hashes: no CSP meta found in ${file} to append the inline hashes. ` +
                'Astro may have changed its CSP format; fix the integration instead of shipping a blocked script.',
            );
          }
          const hashedMeta = meta.replace(
            /(content="[^"]*?script-src )/i,
            `$1${[...hashes].join(' ')} `,
          );
          if (hashedMeta === meta) {
            throw new Error(
              `inline-script-csp-hashes: no CSP script-src found in ${file} to append the inline hashes. ` +
                'Astro may have changed its CSP format; fix the integration instead of shipping a blocked script.',
            );
          }
          assertInlineCoverage(html, hashedMeta, file);
          html = html.replace(metaPattern, '');
          const withMeta = html.replace(/(<meta[^>]*charset[^>]*>)/i, `$1${hashedMeta}`);
          if (withMeta === html) {
            throw new Error(
              `inline-script-csp-hashes: no <meta charset> in ${file} to reinsert the CSP into. ` +
                'Reinserting it there is what keeps the policy ahead of every script; fix the ' +
                'integration rather than shipping a page without CSP.',
            );
          }
          html = withMeta;
          writeFileSync(file, html);
        }
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://angelcanovas.github.io',
  base: '/',
  trailingSlash: 'always',
  // There are no Markdown code blocks; avoid Shiki's default inline styles under CSP.
  markdown: { syntaxHighlight: false },
  // Opt-in on the language links only: the other locale is fetched when the
  // visitor hovers/taps the switch, so first paint stays untouched.
  prefetch: {
    defaultStrategy: 'hover',
  },
  integrations: [
    // `:focus-visible`, `[data-aos]`, `[data-theme]` and `[data-ready]` are
    // pseudo-class/attribute selectors with no class token for the extractor, so
    // PurgeCSS would drop them. Keep them: they carry the focus ring, the
    // scroll-reveal, the theme and the hero backdrop fade-in.
    purgecss({ safelist: { standard: [/focus-visible/, /aos/, /data-theme/, /data-ready/] } }),
    inlineScriptCspHashes(),
  ],
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "form-action 'none'",
        "manifest-src 'self'",
        "worker-src 'none'",
        'upgrade-insecure-requests',
      ],
      styleDirective: {
        resources: ["'self'"],
      },
    },
  },
});
