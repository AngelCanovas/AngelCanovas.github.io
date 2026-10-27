import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './serve-dist.mjs';
import {
  assertionExitCode,
  evaluateBudgets,
  representativeIndex,
  validateAssertions,
} from './lighthouse-budgets.mjs';

function onlyKeys(object, keys) {
  if (!object || typeof object !== 'object' || Array.isArray(object)) {
    throw new Error('Invalid Lighthouse configuration');
  }
  for (const key of Object.keys(object)) {
    if (!keys.includes(key)) throw new Error(`Unsupported Lighthouse setting: ${key}`);
  }
}

export function validateConfig(config) {
  onlyKeys(config, ['ci']);
  const ci = config.ci;
  onlyKeys(ci, ['collect', 'assert', 'upload']);
  onlyKeys(ci.collect, [
    'url',
    'numberOfRuns',
    'settings',
    'startServerCommand',
    'startServerReadyPattern',
  ]);
  const { url: urls, numberOfRuns, settings } = ci.collect;
  if (!Array.isArray(urls) || !urls.length || new Set(urls).size !== urls.length) {
    throw new Error('Unique Lighthouse URLs are required');
  }
  const parsed = urls.map((url) => new URL(url));
  const { origin, port } = parsed[0];
  if (
    parsed.some(
      (url) =>
        url.origin !== origin ||
        url.protocol !== 'http:' ||
        url.hostname !== '127.0.0.1' ||
        !url.port ||
        url.username ||
        url.password ||
        url.search ||
        url.hash,
    )
  ) {
    throw new Error('Lighthouse URLs must share a loopback HTTP origin');
  }
  if (!Number.isSafeInteger(numberOfRuns) || numberOfRuns < 1) {
    throw new Error('Invalid Lighthouse run count');
  }
  if (
    ci.collect.startServerCommand !== `node scripts/serve-dist.mjs --port ${port}` ||
    ci.collect.startServerReadyPattern !== 'serving'
  ) {
    throw new Error('Unsupported Lighthouse server configuration');
  }
  onlyKeys(settings, ['preset', 'formFactor', 'emulatedUserAgent']);
  if (
    !(
      (settings.preset === 'desktop' && settings.formFactor === undefined) ||
      (settings.formFactor === 'mobile' && settings.preset === undefined)
    ) ||
    typeof settings.emulatedUserAgent !== 'string' ||
    !settings.emulatedUserAgent
  ) {
    throw new Error('Unsupported Lighthouse device settings');
  }
  validateAssertions(ci.assert);
  onlyKeys(ci.upload, ['target', 'outputDir']);
  if (ci.upload.target !== 'filesystem' || ci.upload.outputDir !== '.lighthouseci') {
    throw new Error('Lighthouse reports must remain local in .lighthouseci');
  }
  return { ci, port: Number(port), profile: settings.preset === 'desktop' ? 'desktop' : 'mobile' };
}

export function validateReport(report, url) {
  if (!report || report.runtimeError)
    throw new Error(`Lighthouse runtime error: ${report?.runtimeError?.code ?? 'missing result'}`);
  if (
    report.requestedUrl !== url ||
    report.finalUrl !== url ||
    !report.audits ||
    !report.categories
  ) {
    throw new Error(`Incomplete Lighthouse result or unexpected URL: ${url}`);
  }
}

async function bounded(operation, timeoutMs, signal) {
  let timer;
  let abort;
  return new Promise((resolveOperation, reject) => {
    Promise.resolve(operation).then(resolveOperation, reject);
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    timer = setTimeout(() => reject(new Error('Lighthouse operation timed out')), timeoutMs);
    abort = () => reject(signal.reason);
    signal?.addEventListener('abort', abort, { once: true });
  }).finally(() => {
    clearTimeout(timer);
    if (abort) signal?.removeEventListener('abort', abort);
  });
}

async function closeChrome(chrome, timeoutMs) {
  const child = chrome.chromeProcess;
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    chrome.kill();
    return;
  }
  let timer;
  try {
    await new Promise((resolveClose, reject) => {
      const closed = () => {
        clearTimeout(timer);
        resolveClose();
      };
      child.once('close', closed);
      timer = setTimeout(() => {
        child.removeListener('close', closed);
        reject(new Error('Chrome cleanup timed out'));
      }, timeoutMs);
      chrome.kill();
    });
  } catch (cause) {
    throw new Error('Chrome cleanup failed', { cause });
  } finally {
    clearTimeout(timer);
  }
}

function combineErrors(original, cleanup) {
  return original && original !== cleanup
    ? new AggregateError([original, cleanup], cleanup.message)
    : cleanup;
}

export async function runWithChrome(url, settings, engine, options = {}) {
  const {
    signal,
    timeoutMs = 180000,
    cleanupTimeoutMs = 30000,
    chromePath = process.env.CHROME_PATH,
  } = options;
  const profile = await mkdtemp(join(tmpdir(), 'cv-lighthouse-'));
  const chromeFlags = ['--headless=new', '--enable-features=DevToolsWebMCPSupport'];
  if (process.platform === 'linux') chromeFlags.push(`--user-data-dir=${profile}`);
  const chrome = new engine.Launcher({
    chromePath,
    userDataDir: profile,
    chromeFlags,
    handleSIGINT: false,
    connectionPollInterval: 500,
    maxConnectionRetries: 50,
  });
  let launching;
  let result;
  let failure;
  try {
    signal?.throwIfAborted();
    launching = chrome.launch();
    chrome.chromeProcess?.on('error', () => {});
    await bounded(launching, timeoutMs, signal);
    if (
      !chrome.chromeProcess ||
      chrome.chromeProcess.exitCode !== null ||
      chrome.chromeProcess.signalCode !== null
    ) {
      throw new Error('Chrome exited before the audit');
    }
    const { preset, ...flags } = settings;
    result = await bounded(
      engine.lighthouse(
        url,
        {
          ...flags,
          port: chrome.port,
          output: ['json', 'html'],
          logLevel: 'error',
          enableErrorReporting: false,
        },
        preset === 'desktop' ? engine.desktopConfig : undefined,
      ),
      timeoutMs,
      signal,
    );
  } catch (error) {
    failure = error;
  }
  try {
    await closeChrome(chrome, cleanupTimeoutMs);
    if (launching) {
      try {
        await bounded(
          launching.catch(() => {}),
          cleanupTimeoutMs,
        );
      } catch (cause) {
        throw new Error('Chrome startup cleanup failed', { cause });
      }
    }
    await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 });
    signal?.throwIfAborted();
  } catch (error) {
    failure = combineErrors(failure, error);
  }
  if (failure) throw failure;
  return result;
}

const writeJson = (file, data) => writeFile(file, JSON.stringify(data, null, 2) + '\n');

export async function runLighthouse(config, options = {}) {
  const {
    engine,
    signal,
    root = 'dist',
    outputRoot = '.',
    log = console.log,
    ...chromeOptions
  } = options;
  const { ci, port, profile } = validateConfig(config);
  signal?.throwIfAborted();
  await access(join(root, 'index.html'));
  const chromePath = chromeOptions.chromePath ?? process.env.CHROME_PATH;
  if (!chromePath) throw new Error('Set CHROME_PATH to the installed Chrome/Chromium executable');
  await access(chromePath, constants.X_OK);
  const { server } = await startStaticServer({ root, port });
  let directory;
  let status;
  let outcome;
  let failure;
  const runs = [];
  const markFailed = (error) => {
    if (status) Object.assign(status, { status: 'failed', exitCode: 1, error: error.message });
  };
  try {
    const output = join(outputRoot, ci.upload.outputDir);
    await mkdir(output, { recursive: true });
    directory = await mkdtemp(join(output, `${profile}-`));
    status = { status: 'running', profile, directory: resolve(directory), runs };
    await writeJson(join(output, 'last-run.json'), status);
    log(`Lighthouse ${profile} reports: ${directory}`);
    for (const url of ci.collect.url) {
      for (let run = 0; run < ci.collect.numberOfRuns; run += 1) {
        for (let attempt = 1; attempt <= 3; attempt += 1) {
          signal?.throwIfAborted();
          let result;
          try {
            result = await runWithChrome(url, ci.collect.settings, engine, {
              ...chromeOptions,
              chromePath,
              signal,
            });
            signal?.throwIfAborted();
          } catch (error) {
            if (signal?.aborted || /cleanup/.test(error.message) || attempt === 3) throw error;
            log(`Technical retry ${attempt}/3: ${url}: ${error.message}`);
            continue;
          }
          const lhr = result?.lhr;
          const basename = `lhr-${runs.length}`;
          try {
            validateReport(lhr, url);
          } catch (error) {
            if (lhr) await writeJson(join(directory, `failed-${runs.length}-${attempt}.json`), lhr);
            if (attempt === 3) throw error;
            log(`Technical retry ${attempt}/3: ${url}: ${error.message}`);
            continue;
          }
          await writeJson(join(directory, `${basename}.json`), lhr);
          const html = engine.generateReport(lhr, 'html');
          await writeFile(join(directory, `${basename}.html`), html);
          runs.push({ url, lhr, jsonPath: `${basename}.json`, htmlPath: `${basename}.html` });
          log(`Run ${run + 1}/${ci.collect.numberOfRuns}: ${url}`);
          break;
        }
      }
    }
    if (runs.length !== ci.collect.url.length * ci.collect.numberOfRuns)
      throw new Error('Incomplete Lighthouse collection');
    signal?.throwIfAborted();
    const assertions = evaluateBudgets(
      { ...ci.assert, includePassedAssertions: true },
      runs.map((run) => run.lhr),
    );
    const manifest = [];
    for (const url of ci.collect.url) {
      const group = runs.filter((run) => run.url === url);
      if (group.length !== ci.collect.numberOfRuns)
        throw new Error(`Incomplete Lighthouse URL: ${url}`);
      const representative = representativeIndex(group.map((run) => run.lhr));
      group.forEach((run, index) =>
        manifest.push({
          url,
          isRepresentativeRun: index === representative,
          summary: Object.fromEntries(
            Object.entries(run.lhr.categories).map(([key, value]) => [key, value.score]),
          ),
          jsonPath: run.jsonPath,
          htmlPath: run.htmlPath,
        }),
      );
    }
    await writeJson(join(directory, 'manifest.json'), manifest);
    await writeJson(join(directory, 'assertion-results.json'), assertions);
    signal?.throwIfAborted();
    for (const result of assertions.filter((result) => !result.passed)) {
      log(
        `${result.level}: ${result.url} ${result.auditId}${result.auditProperty ? ':' + result.auditProperty : ''} ${result.name}: expected ${result.operator} ${result.expected}, found ${result.actual}; values: ${result.values.join(', ')}`,
      );
    }
    signal?.throwIfAborted();
    const exitCode = assertionExitCode(assertions);
    status.status = exitCode ? 'failed' : 'passed';
    status.exitCode = exitCode;
    outcome = { exitCode, directory, assertions, manifest };
  } catch (error) {
    markFailed(error);
    failure = error;
  }
  try {
    server.closeAllConnections();
    await new Promise((resolveClose, reject) =>
      server.close((error) => (error ? reject(error) : resolveClose())),
    );
    signal?.throwIfAborted();
  } catch (error) {
    failure = combineErrors(failure, error);
    markFailed(error);
  }
  if (status) {
    const persist = async () => {
      const checkpoint = { ...status, runs: runs.map(({ lhr: _lhr, ...run }) => run) };
      await writeJson(join(directory, 'run-status.json'), checkpoint);
      await writeJson(join(outputRoot, ci.upload.outputDir, 'last-run.json'), checkpoint);
    };
    try {
      await persist();
      signal?.throwIfAborted();
    } catch (error) {
      failure = combineErrors(failure, error);
      markFailed(error);
      try {
        await persist();
      } catch (writeError) {
        failure = combineErrors(failure, writeError);
      }
    }
  }
  if (failure) throw failure;
  if (!outcome) throw new Error('Lighthouse collection did not complete');
  return outcome;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const controller = new AbortController();
  const interrupt = () => controller.abort(new Error('Lighthouse interrupted'));
  process.once('SIGINT', interrupt);
  process.once('SIGTERM', interrupt);
  try {
    const args = process.argv.slice(2);
    if (args.length > 1 || (args.length && !/^lighthouserc(?:\.mobile)?\.json$/.test(args[0])))
      throw new Error('Usage: node scripts/lighthouse.mjs [lighthouserc.mobile.json]');
    const config = JSON.parse(await readFile(args[0] ?? 'lighthouserc.json', 'utf8'));
    const [lighthouse, { Launcher }] = await Promise.all([
      import('lighthouse'),
      import('chrome-launcher'),
    ]);
    process.exitCode = (
      await runLighthouse(config, {
        engine: { ...lighthouse, lighthouse: lighthouse.default, Launcher },
        signal: controller.signal,
      })
    ).exitCode;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    process.removeListener('SIGINT', interrupt);
    process.removeListener('SIGTERM', interrupt);
  }
}
