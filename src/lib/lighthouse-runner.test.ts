import { EventEmitter } from 'node:events';
import { access, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  runLighthouse,
  runWithChrome,
  validateConfig,
  validateReport,
} from '../../scripts/lighthouse.mjs';

const hooks = vi.hoisted(() => ({
  onWrite: undefined as undefined | ((file: unknown, data: unknown) => void),
}));

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>();
  return {
    ...fs,
    writeFile: async (...args: Parameters<typeof fs.writeFile>) => {
      await fs.writeFile(...args);
      hooks.onWrite?.(args[0], args[1]);
    },
  };
});

class FakeLauncher {
  static instances: FakeLauncher[] = [];
  static failLaunch = false;
  static leaveOpen = false;
  static startup: undefined | (() => Promise<void>);
  static onKill: undefined | (() => void);
  port = 9000;
  chromeProcess = Object.assign(new EventEmitter(), {
    exitCode: null,
    signalCode: null as string | null,
  });
  options: { userDataDir: string; chromeFlags: string[]; handleSIGINT: boolean };
  kill = vi.fn(() => {
    if (!FakeLauncher.leaveOpen) {
      queueMicrotask(() => {
        FakeLauncher.onKill?.();
        this.chromeProcess.signalCode = 'SIGKILL';
        this.chromeProcess.emit('close');
      });
    }
  });

  constructor(options: FakeLauncher['options']) {
    this.options = options;
    FakeLauncher.instances.push(this);
  }

  async launch() {
    if (FakeLauncher.failLaunch) throw new Error('Launch failed');
    await FakeLauncher.startup?.();
  }
}

function report(url: string) {
  return {
    requestedUrl: url,
    finalUrl: url,
    categories: Object.fromEntries(
      ['performance', 'accessibility', 'best-practices', 'seo'].map((key) => [key, { score: 1 }]),
    ),
    audits: {
      ...Object.fromEntries(
        [
          'largest-contentful-paint',
          'cumulative-layout-shift',
          'total-blocking-time',
          'speed-index',
          'first-contentful-paint',
        ].map((key) => [key, { score: 1, numericValue: 0 }]),
      ),
      'resource-summary': {
        score: null,
        details: {
          items: ['document', 'stylesheet', 'script', 'font', 'total'].map((resourceType) => ({
            resourceType,
            requestCount: 0,
            transferSize: 0,
          })),
        },
      },
    },
  };
}

function engine() {
  return {
    Launcher: FakeLauncher,
    desktopConfig: { settings: { formFactor: 'desktop' } },
    lighthouse: vi.fn(async (url: string) => ({ lhr: report(url) })),
    generateReport: vi.fn(() => '<!doctype html><title>Lighthouse</title>'),
  };
}

const desktop = JSON.parse(
  await readFile(new URL('../../lighthouserc.json', import.meta.url), 'utf8'),
);
const mobile = JSON.parse(
  await readFile(new URL('../../lighthouserc.mobile.json', import.meta.url), 'utf8'),
);
let directory: string;

async function freePort() {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing TCP address');
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return address.port;
}

function configAt(port: number) {
  const config = structuredClone(desktop);
  config.ci.collect.url = ['/', '/es/', '/cv/', '/cv/es/'].map(
    (route) => `http://127.0.0.1:${port}${route}`,
  );
  config.ci.collect.startServerCommand = `node scripts/serve-dist.mjs --port ${port}`;
  return config;
}

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'cv-lighthouse-test-'));
  await writeFile(join(directory, 'index.html'), '<!doctype html><title>Fixture</title>');
  FakeLauncher.instances = [];
  FakeLauncher.failLaunch = false;
  FakeLauncher.leaveOpen = false;
  FakeLauncher.startup = undefined;
  FakeLauncher.onKill = undefined;
  hooks.onWrite = undefined;
});

afterEach(async () => {
  hooks.onWrite = undefined;
  for (const launcher of FakeLauncher.instances) {
    await rm(launcher.options.userDataDir, { recursive: true, force: true });
  }
  await rm(directory, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe('Lighthouse configuration and results', () => {
  it('accepts both unchanged profiles and requires an explicit desktop preset', () => {
    expect(validateConfig(desktop).profile).toBe('desktop');
    expect(validateConfig(mobile).profile).toBe('mobile');
    const config = structuredClone(desktop);
    delete config.ci.collect.settings.preset;
    expect(() => validateConfig(config)).toThrow(/device settings/);
  });

  it.each([
    'unknown',
    'external',
    'duplicate',
    'mixed-origin',
    'count',
    'server',
    'upload',
    'settings',
  ])('rejects unsupported configuration: %s', (kind) => {
    const config = structuredClone(desktop);
    if (kind === 'unknown') config.ci.collect.unknown = true;
    if (kind === 'external') config.ci.collect.url = ['https://example.com/'];
    if (kind === 'duplicate') config.ci.collect.url.push(config.ci.collect.url[0]);
    if (kind === 'mixed-origin') config.ci.collect.url.push('http://127.0.0.1:4323/');
    if (kind === 'count') config.ci.collect.numberOfRuns = 0;
    if (kind === 'server') config.ci.collect.startServerCommand = 'echo serving';
    if (kind === 'upload') config.ci.upload.target = 'temporary-public-storage';
    if (kind === 'settings') config.ci.collect.settings.disableStorageReset = true;
    expect(() => validateConfig(config)).toThrow();
  });

  it('rejects absent, runtime-error, incomplete and redirected reports', () => {
    const url = desktop.ci.collect.url[0];
    expect(() => validateReport(report(url), url)).not.toThrow();
    for (const invalid of [
      undefined,
      { runtimeError: { code: 'NO_FCP' } },
      {},
      { ...report(url), finalUrl: url + 'es/' },
    ]) {
      expect(() => validateReport(invalid, url)).toThrow();
    }
  });
});

describe('owned Chrome lifecycle', () => {
  it.each([desktop, mobile])(
    'uses the public device configuration and closes before returning',
    async (config) => {
      const api = engine();
      const settings = config.ci.collect.settings;
      await runWithChrome('http://127.0.0.1:4322/', settings, api);
      const launcher = FakeLauncher.instances[0];
      expect(api.lighthouse).toHaveBeenCalledWith(
        'http://127.0.0.1:4322/',
        expect.objectContaining({
          port: 9000,
          emulatedUserAgent: settings.emulatedUserAgent,
          enableErrorReporting: false,
        }),
        settings.preset === 'desktop' ? api.desktopConfig : undefined,
      );
      expect(launcher.options.handleSIGINT).toBe(false);
      expect(launcher.options.chromeFlags).toContain('--headless=new');
      if (process.platform === 'linux')
        expect(launcher.options.chromeFlags.at(-1)).toBe(
          `--user-data-dir=${launcher.options.userDataDir}`,
        );
      expect(launcher.kill).toHaveBeenCalledOnce();
      expect(launcher.chromeProcess.signalCode).toBe('SIGKILL');
      await expect(access(launcher.options.userDataDir)).rejects.toThrow();
    },
  );

  it.each(['launch', 'audit', 'timeout', 'abort'])(
    'cleans Chrome and profile after %s failure',
    async (kind) => {
      const api = engine();
      const controller = new AbortController();
      if (kind === 'launch') FakeLauncher.failLaunch = true;
      if (kind === 'audit') api.lighthouse.mockRejectedValue(new Error('Audit failed'));
      if (kind === 'timeout') api.lighthouse.mockImplementation(() => new Promise(() => {}));
      if (kind === 'abort')
        api.lighthouse.mockImplementation(() => {
          controller.abort(new Error('Cancelled'));
          return new Promise(() => {});
        });
      await expect(
        runWithChrome('http://127.0.0.1:4322/', desktop.ci.collect.settings, api, {
          signal: controller.signal,
          timeoutMs: 5,
        }),
      ).rejects.toThrow();
      const launcher = FakeLauncher.instances[0];
      expect(launcher.chromeProcess.signalCode).toBe('SIGKILL');
      await expect(access(launcher.options.userDataDir)).rejects.toThrow();
    },
  );

  it('does not claim success or remove a profile while Chrome refuses to close', async () => {
    FakeLauncher.leaveOpen = true;
    await expect(
      runWithChrome('http://127.0.0.1:4322/', desktop.ci.collect.settings, engine(), {
        cleanupTimeoutMs: 5,
      }),
    ).rejects.toThrow(/cleanup failed/);
    await expect(access(FakeLauncher.instances[0].options.userDataDir)).resolves.toBeUndefined();
  });

  it('retains both the audit failure and a subsequent cleanup failure', async () => {
    const api = engine();
    const original = new Error('Audit failed first');
    api.lighthouse.mockRejectedValue(original);
    FakeLauncher.leaveOpen = true;
    const failure = await runWithChrome(
      'http://127.0.0.1:4322/',
      desktop.ci.collect.settings,
      api,
      { cleanupTimeoutMs: 5 },
    ).catch((error) => error);
    expect(failure).toBeInstanceOf(AggregateError);
    expect(failure.errors[0]).toBe(original);
    expect(failure.errors[1].message).toBe('Chrome cleanup failed');
  });

  it.each(['abort', 'timeout'])('waits for pending startup polling after %s', async (kind) => {
    const controller = new AbortController();
    let settled = false;
    FakeLauncher.startup = () =>
      new Promise((resolve) => {
        FakeLauncher.onKill = () =>
          setTimeout(() => {
            settled = true;
            resolve();
          }, 100);
        if (kind === 'abort') controller.abort(new Error('Startup cancelled'));
      });
    await expect(
      runWithChrome('http://127.0.0.1:4322/', desktop.ci.collect.settings, engine(), {
        signal: controller.signal,
        timeoutMs: 5,
      }),
    ).rejects.toThrow();
    expect(settled).toBe(true);
    await expect(access(FakeLauncher.instances[0].options.userDataDir)).rejects.toThrow();
  });
});

describe('Lighthouse collection and local reports', () => {
  it('collects three fresh runs for each URL and keeps profiles and historical reports separate', async () => {
    const config = configAt(await freePort());
    const api = engine();
    const options = {
      engine: api,
      root: directory,
      outputRoot: directory,
      chromePath: process.execPath,
      log: vi.fn(),
    };
    const first = await runLighthouse(config, options);
    const second = await runLighthouse(config, options);
    expect(first.exitCode).toBe(0);
    expect(second.directory).not.toBe(first.directory);
    expect(api.lighthouse).toHaveBeenCalledTimes(24);
    expect(FakeLauncher.instances).toHaveLength(24);
    expect(
      new Set(FakeLauncher.instances.map((launcher) => launcher.options.userDataDir)).size,
    ).toBe(24);
    expect(first.manifest).toHaveLength(12);
    expect(first.manifest.filter((entry) => entry.isRepresentativeRun)).toHaveLength(4);
    expect(
      (await readdir(first.directory)).filter((name) => /^lhr-\d+\.json$/.test(name)),
    ).toHaveLength(12);
    for (const entry of first.manifest) {
      await expect(access(join(first.directory, entry.htmlPath))).resolves.toBeUndefined();
      const lhr = JSON.parse(await readFile(join(first.directory, entry.jsonPath), 'utf8'));
      expect(lhr.requestedUrl).toBe(entry.url);
    }
    const checkpoint = JSON.parse(
      await readFile(join(directory, '.lighthouseci/last-run.json'), 'utf8'),
    );
    expect(checkpoint.status).toBe('passed');
    expect(checkpoint.runs).toHaveLength(12);
    await expect(fetch(config.ci.collect.url[0])).rejects.toThrow();
  });

  it('fails on an occupied port without touching the other server or launching Chrome', async () => {
    const occupied = createServer();
    await new Promise<void>((resolve) => occupied.listen(0, '127.0.0.1', resolve));
    const address = occupied.address();
    if (!address || typeof address === 'string') throw new Error('Missing TCP address');
    try {
      await expect(
        runLighthouse(configAt(address.port), {
          engine: engine(),
          root: directory,
          outputRoot: directory,
          chromePath: process.execPath,
        }),
      ).rejects.toThrow(/EADDRINUSE/);
      expect(occupied.listening).toBe(true);
      expect(FakeLauncher.instances).toHaveLength(0);
    } finally {
      await new Promise<void>((resolve) => occupied.close(() => resolve()));
    }
  });

  it.each(['technical', 'missing', 'runtime', 'html', 'write'])(
    'fails closed and releases its server after %s failure',
    async (kind) => {
      const config = configAt(await freePort());
      const api = engine();
      if (kind === 'technical') api.lighthouse.mockRejectedValue(new Error('Technical failure'));
      if (kind === 'missing') api.lighthouse.mockResolvedValue(undefined as never);
      if (kind === 'runtime')
        api.lighthouse.mockImplementation(async (url) => ({
          lhr: { ...report(url), runtimeError: { code: 'NO_FCP' } },
        }));
      if (kind === 'html')
        api.generateReport.mockImplementation(() => {
          throw new Error('HTML failure');
        });
      const outputRoot = kind === 'write' ? join(directory, 'index.html') : directory;
      await expect(
        runLighthouse(config, {
          engine: api,
          root: directory,
          outputRoot,
          chromePath: process.execPath,
          log: vi.fn(),
        }),
      ).rejects.toThrow();
      await expect(fetch(config.ci.collect.url[0])).rejects.toThrow();
      if (kind !== 'write') {
        const checkpoint = JSON.parse(
          await readFile(join(directory, '.lighthouseci/last-run.json'), 'utf8'),
        );
        expect(checkpoint.status).toBe('failed');
        const names = await readdir(checkpoint.directory);
        expect(names).not.toContain('manifest.json');
        expect(names).not.toContain('assertion-results.json');
        if (['technical', 'missing', 'runtime'].includes(kind))
          expect(FakeLauncher.instances).toHaveLength(3);
      }
    },
  );

  it('never retries a valid report because a budget fails', async () => {
    const config = configAt(await freePort());
    config.ci.assert.assertions = { 'categories:seo': ['error', { minScore: 1 }] };
    const api = engine();
    api.lighthouse.mockImplementation(async (url) => {
      const lhr = report(url);
      lhr.categories.seo.score = 0;
      return { lhr };
    });
    const result = await runLighthouse(config, {
      engine: api,
      root: directory,
      outputRoot: directory,
      chromePath: process.execPath,
      log: vi.fn(),
    });
    expect(result.exitCode).toBe(1);
    expect(api.lighthouse).toHaveBeenCalledTimes(12);
    expect(result.manifest).toHaveLength(12);
    expect(result.assertions.every((assertion) => !assertion.passed)).toBe(true);
  });

  it.each(['last Chrome cleanup', 'last status write'])(
    'does not report success when aborted during %s',
    async (phase) => {
      const config = configAt(await freePort());
      const controller = new AbortController();
      const cancel = () => controller.abort(new Error('Late cancellation'));
      if (phase === 'last Chrome cleanup')
        FakeLauncher.onKill = () => {
          if (FakeLauncher.instances.length === 12) cancel();
        };
      else
        hooks.onWrite = (file, data) => {
          if (String(file).endsWith('last-run.json') && String(data).includes('"status": "passed"'))
            cancel();
        };
      await expect(
        runLighthouse(config, {
          engine: engine(),
          root: directory,
          outputRoot: directory,
          chromePath: process.execPath,
          signal: controller.signal,
          log: vi.fn(),
        }),
      ).rejects.toThrow(/Late cancellation/);
      const checkpoint = JSON.parse(
        await readFile(join(directory, '.lighthouseci/last-run.json'), 'utf8'),
      );
      expect(checkpoint.status).toBe('failed');
      expect(checkpoint.exitCode).not.toBe(0);
      await expect(fetch(config.ci.collect.url[0])).rejects.toThrow();
    },
  );
});
