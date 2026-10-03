# Maintained toolchain

Use Node 24.21.0 (active LTS), recorded in `.nvmrc`, with `npm ci`. CI uses that
exact runtime and bundled npm; `@types/node` stays on its major so type checks do not permit APIs
absent from the supported runtime. No global Node installation is required by
the project.

npm's install-script policy permits only the reviewed, version-pinned esbuild
bootstrap. Revisit that approval when esbuild changes; leave unrelated dependency
hooks blocked.

Direct registry packages and GitHub Actions are reviewed against their current
stable releases. Actions remain pinned to immutable commit SHAs and run with
minimal job permissions. Local security forks keep their `file:` dependencies,
licenses, provenance and behavior tests; registry versions alone cannot replace
those patches.

## Compatibility boundaries

TypeScript 6.0.3 is the newest supported compiler for this toolchain. The current
[`@astrojs/check` manifest](https://github.com/withastro/astro/tree/main/packages/language-tools/astro-check)
accepts TypeScript 5 or 6, and
[typescript-eslint supports versions below 6.1](https://typescript-eslint.io/users/dependency-versions/).
TypeScript 7.0.2 fails clean installation because those peer requirements do not
overlap. Do not use `--force` or `--legacy-peer-deps` to bypass that boundary.
The dependency bot temporarily excludes incompatible TypeScript releases and
Node-type major bumps; review these exclusions when upstream support or the
runtime major changes.

Lighthouse CI remains on its latest stable CLI (0.15.1). Playwright and its browser
version follow the lockfile. Update the browser and review visual changes together;
never relax screenshot thresholds to make a dependency update pass.
