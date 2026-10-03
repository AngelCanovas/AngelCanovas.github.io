import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
interface BraceProcessor {
  (input: string): string[];
  parse(input: string): unknown;
  compile(input: unknown): string;
  expand(input: unknown): string[];
  stringify(input: unknown): string;
}
// Resolve through the real consumers: overrides may be nested rather than hoisted.
const braces = createRequire(require.resolve('micromatch'))('braces') as BraceProcessor;

interface CacheRequest {
  url: string;
  headers: Record<string, string>;
}
interface CacheInstance {
  satisfiesWithoutRevalidation(request: CacheRequest): boolean;
  evaluateRequest(request: CacheRequest): { response?: unknown; revalidation?: unknown };
  useStaleWhileRevalidate(): boolean;
  revalidatedPolicy(
    request: CacheRequest,
    response: { status: number; headers: Record<string, string> },
  ): { modified: boolean };
  toObject(): unknown;
  responseHeaders(): Record<string, string>;
}
interface CacheConstructor {
  new (
    request: CacheRequest,
    response: { status: number; headers: Record<string, string> },
    options?: { shared: boolean },
  ): CacheInstance;
  fromObject(value: unknown): CacheInstance;
}
const CachePolicy = createRequire(require.resolve('astro/config'))(
  'http-cache-semantics',
) as CacheConstructor;
const request = { url: 'https://example.test/avatar.webp', headers: { host: 'example.test' } };

describe('dependency security: brace traversal limits', () => {
  it.each(['{', '('])('rejects deeply nested %s before exhausting the stack', (open) => {
    const close = open === '{' ? '}' : ')';
    const pattern = open.repeat(4000) + 'a,b' + close.repeat(4000);
    for (const operation of ['parse', 'compile', 'expand', 'stringify'] as const) {
      expect(() => braces[operation](pattern)).toThrow(SyntaxError);
    }
  });

  it('also rejects caller-supplied deep ASTs in every recursive walker', () => {
    type AstNode = { type: string; value?: string; invalid?: boolean; nodes?: AstNode[] };
    const ast: AstNode = { type: 'root', nodes: [] };
    let node = ast;
    for (let depth = 0; depth < 4000; depth++) {
      const child: AstNode = { type: 'brace', invalid: true, nodes: [] };
      node.nodes!.push(child);
      node = child;
    }
    node.nodes!.push({ type: 'text', value: 'x' });
    for (const operation of ['compile', 'expand', 'stringify'] as const) {
      expect(() => braces[operation](ast)).toThrow(SyntaxError);
    }
  });

  it('preserves nested glob compilation, ranges, escaping and AST round trips', () => {
    expect(braces.compile('src/{components,{lib,scripts}}/*.{astro,ts}')).toBe(
      'src/(components|(lib|scripts))/*.(astro|ts)',
    );
    expect(braces.expand('file-{01..03}.css')).toEqual([
      'file-01.css',
      'file-02.css',
      'file-03.css',
    ]);
    expect(braces.stringify(braces.parse('a/{b,c}/d'))).toBe('a/{b,c}/d');
    expect(braces.compile(String.raw`a/\{b,c\}/d`)).toBe('a/{b,c}/d');
    expect(braces.compile('{'.repeat(32) + 'a,b' + '}'.repeat(32))).toContain('a|b');
  });
});

describe('dependency security: shared-cache confidentiality', () => {
  const cases: [string, Record<string, string>][] = [
    ['private', { 'cache-control': 'private, max-age=600' }],
    ['response no-store', { 'cache-control': 'no-store, max-age=600' }],
    ['response no-cache', { 'cache-control': 'no-cache, max-age=600' }],
    ['cookie without shared-cache opt-in', { 'set-cookie': 'session=example' }],
    ['wildcard Vary', { vary: '*' }],
    ['shared proxy-revalidate', { 'cache-control': 'public, proxy-revalidate, max-age=0' }],
    ['shared s-maxage', { 'cache-control': 'public, s-maxage=0' }],
  ];

  it.each(cases)(
    '%s cannot be reused through max-stale or stale-while-revalidate',
    (_, headers) => {
      const policy = new CachePolicy(request, {
        status: 200,
        headers: {
          ...headers,
          'cache-control': `${headers['cache-control'] || ''}, stale-while-revalidate=999999, stale-if-error=999999`,
        },
      });
      for (const directive of ['max-stale', 'max-stale=999999']) {
        const incoming = {
          ...request,
          headers: { ...request.headers, 'cache-control': directive },
        };
        for (const instance of [policy, CachePolicy.fromObject(policy.toObject())]) {
          expect(instance.satisfiesWithoutRevalidation(incoming)).toBe(false);
          expect(instance.evaluateRequest(incoming).response).toBeUndefined();
          expect(instance.useStaleWhileRevalidate()).toBe(false);
          expect(instance.revalidatedPolicy(incoming, { status: 503, headers: {} }).modified).toBe(
            true,
          );
        }
      }
    },
  );

  it('request no-store cannot be overridden by a later max-stale request', () => {
    const policy = new CachePolicy(
      { ...request, headers: { ...request.headers, 'cache-control': 'no-store' } },
      { status: 200, headers: { 'cache-control': 'public, max-age=600' } },
    );
    expect(
      policy.satisfiesWithoutRevalidation({
        ...request,
        headers: { ...request.headers, 'cache-control': 'max-stale=999999' },
      }),
    ).toBe(false);
  });

  it('preserves fresh public entries and explicit public stale reuse', () => {
    const fresh = new CachePolicy(request, {
      status: 200,
      headers: { 'cache-control': 'public, max-age=600' },
    });
    expect(fresh.satisfiesWithoutRevalidation(request)).toBe(true);
    const stale = new CachePolicy(request, {
      status: 200,
      headers: { 'cache-control': 'public, max-age=0' },
    });
    expect(
      stale.satisfiesWithoutRevalidation({
        ...request,
        headers: { ...request.headers, 'cache-control': 'max-stale=600' },
      }),
    ).toBe(true);
    const publicErrorFallback = new CachePolicy(request, {
      status: 200,
      headers: {
        'cache-control': 'public, max-age=0, stale-if-error=600, stale-while-revalidate=600',
      },
    });
    expect(publicErrorFallback.useStaleWhileRevalidate()).toBe(true);
    expect(
      publicErrorFallback.revalidatedPolicy(request, { status: 503, headers: {} }).modified,
    ).toBe(false);
    const privateCache = new CachePolicy(
      request,
      {
        status: 200,
        headers: { 'cache-control': 'private, max-age=600' },
      },
      { shared: false },
    );
    expect(privateCache.satisfiesWithoutRevalidation(request)).toBe(true);
  });
});

describe('dependency security: header tokenization', () => {
  it('strips Connection-nominated headers regardless of case or whitespace', () => {
    const policy = new CachePolicy(request, {
      status: 200,
      headers: {
        'cache-control': 'public, max-age=600',
        connection: ' X-Internal ,\tX-Trace  ',
        'x-internal': 'private',
        'x-trace': 'private',
        'content-type': 'image/webp',
      },
    });
    const headers = policy.responseHeaders();
    expect(headers).not.toHaveProperty('connection');
    expect(headers).not.toHaveProperty('x-internal');
    expect(headers).not.toHaveProperty('x-trace');
    expect(headers['content-type']).toBe('image/webp');
  });

  it('matches each trimmed, case-insensitive Vary field', () => {
    const original = {
      ...request,
      headers: { ...request.headers, accept: 'image/webp', 'accept-language': 'en' },
    };
    const policy = new CachePolicy(original, {
      status: 200,
      headers: { 'cache-control': 'public, max-age=600', vary: ' Accept ,\tAccept-Language ' },
    });
    expect(policy.satisfiesWithoutRevalidation(original)).toBe(true);
    expect(
      policy.satisfiesWithoutRevalidation({
        ...original,
        headers: { ...original.headers, 'accept-language': 'es' },
      }),
    ).toBe(false);
  });

  it('bounds adversarial whitespace processing in both header paths', () => {
    // Isolate the call: a reintroduced quadratic regexp must time out safely,
    // rather than block the test runner. Startup margin is deliberately generous.
    const module = createRequire(require.resolve('astro/config')).resolve('http-cache-semantics');
    const script = `
      const CachePolicy = require(${JSON.stringify(module)});
      const value = 'x-start' + ' '.repeat(250000) + 'x-end';
      const request = { url: 'https://example.test/image', headers: { host: 'example.test' } };
      const policy = new CachePolicy(request, { status: 200, headers: {
        'cache-control': 'public, max-age=600', connection: value, vary: value,
      }});
      policy.responseHeaders();
      if (!policy.satisfiesWithoutRevalidation(request)) process.exit(1);
    `;
    const result = spawnSync(process.execPath, ['-e', script], { timeout: 5000, encoding: 'utf8' });
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
  });
});

describe('dependency security: patch provenance', () => {
  it('verifies every recorded source and license hash', () => {
    const provenance = JSON.parse(
      readFileSync(new URL('../../vendor/provenance.json', import.meta.url), 'utf8'),
    ) as {
      files: { dependency: string; file: string; patchedSha256: string }[];
    };
    for (const entry of provenance.files) {
      const path = entry.file.replaceAll('\\', '/');
      const bytes = readFileSync(
        new URL(`../../vendor/${entry.dependency}/${path}`, import.meta.url),
      );
      expect(createHash('sha256').update(bytes).digest('hex'), `${entry.dependency}/${path}`).toBe(
        entry.patchedSha256,
      );
    }
  });
});
