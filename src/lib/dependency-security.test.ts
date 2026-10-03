import { createRequire } from 'node:module';
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
