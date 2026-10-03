import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type PackageMetadata = {
  version: string;
  engines: { node: string };
};

type Lockfile = {
  version: string;
  packages: Record<string, PackageMetadata>;
};

function parseVersion(value: string): [number, number, number] {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(value);
  if (!match) throw new Error(`Expected a basic semver version, received: ${value}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareVersions(a: [number, number, number], b: [number, number, number]): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

describe('runtime policy', () => {
  it('keeps the pinned Node version and root package metadata consistent with the lockfile', () => {
    const pinnedNode = readFileSync(new URL('../../.nvmrc', import.meta.url), 'utf8').trim();
    const packageJson = JSON.parse(
      readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
    ) as PackageMetadata;
    const lockfile = JSON.parse(
      readFileSync(new URL('../../package-lock.json', import.meta.url), 'utf8'),
    ) as Lockfile;
    const undiciEngine = lockfile.packages['node_modules/undici'].engines.node;

    expect(undiciEngine, 'undici must declare a basic Node minimum').toMatch(
      /^>=\s*\d+\.\d+\.\d+$/,
    );
    const undiciFloor = undiciEngine.replace(/^>=\s*/, '');

    expect
      .soft(
        compareVersions(parseVersion(pinnedNode), parseVersion(undiciFloor)),
        `.nvmrc (${pinnedNode}) must meet undici's Node floor (${undiciEngine})`,
      )
      .toBeGreaterThanOrEqual(0);
    const packageEngine = packageJson.engines.node;
    expect(packageEngine).toMatch(/^\^\d+\.\d+\.\d+$/);
    const packageFloor = packageEngine.slice(1);
    const runtimeMajor = parseVersion(pinnedNode)[0];
    expect(runtimeMajor, 'Use the tested LTS major').toBe(parseVersion(packageFloor)[0]);
    expect(
      parseVersion(lockfile.packages['node_modules/@types/node'].version)[0],
      'Node types must describe the supported runtime',
    ).toBe(runtimeMajor);
    expect
      .soft(
        compareVersions(parseVersion(pinnedNode), parseVersion(packageFloor)),
        `.nvmrc (${pinnedNode}) must meet package.json (${packageEngine})`,
      )
      .toBeGreaterThanOrEqual(0);
    expect
      .soft(
        compareVersions(parseVersion(packageFloor), parseVersion(undiciFloor)),
        `package.json (${packageEngine}) must meet undici's Node floor (${undiciEngine})`,
      )
      .toBeGreaterThanOrEqual(0);
    expect
      .soft(lockfile.packages[''].engines.node, 'Root Node engines must match package.json')
      .toBe(packageJson.engines.node);
    expect
      .soft(lockfile.packages[''].version, 'Root package version must match package.json')
      .toBe(packageJson.version);
    expect(lockfile.version, 'Top-level lockfile version must match package.json').toBe(
      packageJson.version,
    );
  });
});
