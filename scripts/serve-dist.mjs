/**
 * Minimal static file server for the built site, used by the Playwright
 * `webServer` config and by the CV PDF generator. `astro preview` is not used
 * because it daemonises on Astro 7 and exits the foreground process.
 *
 * Usage: node scripts/serve-dist.mjs [--port 4321] [--host 127.0.0.1]
 */
import { createServer } from 'node:http';
import { lstatSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { extname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

/** Static assets that never change under the same name. */
const LONG_CACHE_EXTENSIONS = new Set(['.woff2', '.png', '.webp', '.jpg', '.jpeg', '.ico', '.pdf']);

/**
 * Mirror what nginx does in production so local previews (and the e2e run)
 * exercise the same caching: hashed `_astro` files are immutable, other static
 * assets are cached for a week and HTML is revalidated with an ETag.
 */
function cacheControlFor(file) {
  if (/[\\/]_astro[\\/]/.test(file)) return 'public, max-age=31536000, immutable';
  if (LONG_CACHE_EXTENSIONS.has(extname(file).toLowerCase())) return 'public, max-age=604800';
  return 'no-cache';
}

function resolveAsset(root, urlPath, basePath) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(urlPath, 'http://localhost').pathname);
  } catch {
    return null;
  }
  if (!pathname.startsWith(basePath) || pathname.includes('\\') || pathname.includes('\0'))
    return null;
  pathname = '/' + pathname.slice(basePath.length);
  if (pathname.startsWith(basePath)) return null;
  if (pathname.endsWith('/')) pathname += 'index.html';
  const rootAbs = resolve(root);
  const file = resolve(rootAbs, `.${pathname}`);
  const pathFromRoot = relative(rootAbs, file);
  if (pathFromRoot.startsWith('..') || isAbsolute(pathFromRoot)) return null;
  let stats;
  try {
    stats = lstatSync(file);
  } catch {
    return null;
  }
  if (!stats.isFile()) return null;
  const actual = relative(realpathSync(rootAbs), realpathSync(file));
  if (actual.startsWith('..') || isAbsolute(actual)) return null;
  return file;
}

/** Start a static server. With `port: 0` an ephemeral port is picked. */
export function startStaticServer({
  root = 'dist',
  host = '127.0.0.1',
  port = 0,
  basePath = '/CV/',
} = {}) {
  if (!/^\/[A-Za-z0-9_-]+\/$/.test(basePath)) throw new Error('Invalid project mount');
  const server = createServer((request, response) => {
    const file = resolveAsset(root, request.url ?? '/', basePath);
    if (!file) {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('Not found');
      return;
    }
    let stats;
    try {
      stats = statSync(file);
    } catch {
      response.writeHead(500, { 'Content-Type': 'text/plain' });
      response.end('Server error');
      return;
    }
    const etag = `"${stats.mtimeMs.toString(16)}-${stats.size.toString(16)}"`;
    const cacheControl = cacheControlFor(file);
    if (request.headers['if-none-match'] === etag) {
      response.writeHead(304, { ETag: etag, 'Cache-Control': cacheControl });
      response.end();
      return;
    }
    let body;
    try {
      body = readFileSync(file);
    } catch {
      response.writeHead(500, { 'Content-Type': 'text/plain' });
      response.end('Server error');
      return;
    }
    response.writeHead(200, {
      'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': cacheControl,
      ETag: etag,
      'Content-Length': body.length,
    });
    response.end(body);
  });

  return new Promise((resolveServer, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      const address = server.address();
      resolveServer({
        server,
        port: address.port,
        origin: `http://${host}:${address.port}`,
      });
    });
  });
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const readFlag = (name, fallback) => {
    const index = process.argv.indexOf(name);
    return index === -1 ? fallback : (process.argv[index + 1] ?? fallback);
  };
  const port = Number.parseInt(readFlag('--port', '4321'), 10);
  const host = readFlag('--host', '127.0.0.1');
  const { origin } = await startStaticServer({ host, port });
  console.log(`[serve-dist] serving ./dist at ${origin}/CV/`);
}
