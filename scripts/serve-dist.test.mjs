import assert from 'node:assert/strict';
import { request } from 'node:http';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { startStaticServer } from './serve-dist.mjs';

test('project mount serves dist once and rejects aliases, malformed URIs and traversal', async () => {
  const root = mkdtempSync(join(tmpdir(), 'cv-server-'));
  writeFileSync(join(root, 'index.html'), 'home');
  mkdirSync(join(root, 'cv'));
  writeFileSync(join(root, 'cv/index.html'), 'cv');
  const { server, origin } = await startStaticServer({ root });
  const get = (path, headers = {}) =>
    new Promise((resolve, reject) => {
      request(origin, { path, headers }, (response) => {
        let body = '';
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () =>
          resolve({ status: response.statusCode, body, headers: response.headers }),
        );
      })
        .on('error', reject)
        .end();
    });
  try {
    assert.equal((await get('/CV/')).body, 'home');
    assert.equal((await get('/CV/cv/')).body, 'cv');
    for (const path of [
      '/',
      '/cv/',
      '/cv/CV/',
      '/CV/CV/',
      '/CV/%ZZ',
      '/CV/%2e%2e/package.json',
      '/CV/%2e%2e%2fpackage.json',
      '/CV/..%5cpackage.json',
      '/CV/%00',
    ]) {
      assert.equal((await get(path)).status, 404, path);
    }
    const response = await get('/CV/');
    assert.equal((await get('/CV/', { 'If-None-Match': response.headers.etag })).status, 304);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    rmSync(root, { recursive: true });
  }
});
