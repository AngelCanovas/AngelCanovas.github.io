# Checking a published update

## Local verification

Use the Node version in `.nvmrc` and the lockfile dependencies. Keep
`PUBLIC_SITE_REVISION` consistent between build and E2E, and set `CHROME_PATH` for
Lighthouse. Linux visual comparisons use `FONTCONFIG_FILE` pointing to
`e2e/fontconfig.conf`, as CI does. Run these gates before an authorized commit:

```sh
npm run check
npm run lint
npm run format:check
npm test
npm run build
npm run test:e2e
node scripts/check-report-privacy.mjs
node --test scripts/serve-dist.test.mjs
npm run lighthouse
npm run lighthouse:mobile
npm audit --audit-level=high
```

Build always precedes E2E; report privacy follows E2E. `npm test` does not include
the static-server tests, which run separately. Passing gates does not authorize
publication. `npm audit` does not examine local fork code or tools outside the
project's dependency tree; see [dependency security](dependency-security.md).

## Lighthouse budgets

Run both commands sequentially after building, with `CHROME_PATH` set. Each reads
its existing `lighthouserc*.json`, starts the static server on port 4322 and collects
three runs for each of the four configured URLs, with a fresh Chrome profile per
run. An occupied port fails instead of reusing or stopping another server.

The adapter preserves LHCI's default **optimistic** aggregation independently for
each assertion: the highest score for `minScore`, the lowest numeric value for
`maxNumericValue`, with inclusive limits. This is not a median or a single best
run. A missing audit, category or resource row in any run fails its assertion
before aggregation. Warnings remain visible but only failed `error` assertions
produce a budget failure. Configuration, collection, reporting and cleanup errors
also fail the command. Technical failures can be retried up to three attempts;
valid results are never retried to improve their scores.

Reports stay local in a fresh `.lighthouseci/<profile>-<id>/` directory: complete
LHR JSON, HTML, `assertion-results.json`, `manifest.json` and `run-status.json`.
`.lighthouseci/last-run.json` identifies the latest run and its completion status;
do not treat an incomplete collection as a pass or mix historical report files.
Each URL's representative report is selected by squared distance to the upper
medians of FCP and interactive, with absent metrics counting as zero, matching
LHCI's representative selection. Budget aggregation does not use that selection.
Unsupported configuration is rejected rather than silently ignored.

## Published update

After a reviewed update reaches `main`, open its CI run and confirm that verify,
security and both CodeQL jobs passed, followed by the Pages deployment. A pull
request validates without publishing; a push to `main` starts publication itself.

Read https://angelcanovas.github.io/build-info.json and compare `revision` with
the immutable `main` commit that passed CI, `version` with package.json and `site`
with `https://angelcanovas.github.io`. Allow for host/CDN propagation before
concluding that an older response indicates a deployment failure.

Verify HTTP responses for the four main routes, sprite, optimized assets, fonts,
Open Graph JPEG, sitemap, text feeds, origin security contact and both PDFs.
Check canonical/hreflang/JSON-LD URLs, local links and unknown routes. Use a browser
to check language switching, query/hash and Back, theme, icons, downloads, focus
and the absence of CSP errors. A successful root request alone is insufficient.

Canonical PDF SHA-256 values:

- English: `01c37925218bc103349690994f7278fb26cbdd10046aad8484780f936674bed1`
- Spanish: `fd692f0f39cd630a19f5dacbd2f78cc701393d7c8cff645959e61178107f2b80`

The Pages artifact contains only the validated static site and expires after one
day. Inspect its file list and metadata when changing artifact policy. Do not
publish Playwright reports/traces. The local report privacy check inspects the
report HTML and the names and decoded contents of embedded ZIP entries against
the explicit patterns in `scripts/check-report-privacy.mjs`. It rejects Git
metadata and selected personal path/contact markers, not every possible personal
datum. It does not sanitize reports or guarantee that traces or binary attachments
contain no personal data. Retain the disabled Git capture setting even though the
public commits use a noreply identity.

## Visual references

The repository contains 166 Linux PNG references: 158 for `e2e/visual.spec.ts` and
8 for `e2e/style.spec.ts`. Both suites compare references on Linux only. On Windows
they capture review attachments instead; other assertions still run.

All Linux screenshot comparisons use `threshold: 0`, which makes any color
difference count as a differing pixel. It does not cancel `maxDiffPixels`:

| Suite            | Capture                                                         | `maxDiffPixels` |
| ---------------- | --------------------------------------------------------------- | --------------: |
| `visual.spec.ts` | Names ending in `-768-light-about` or `-768-dark-about`         |            8000 |
| `visual.spec.ts` | Names ending in `-1440-light-viewport` or `-1440-dark-viewport` |              32 |
| `visual.spec.ts` | All other captures                                              |               0 |
| `style.spec.ts`  | Noir, light and dark, at 1440px                                 |           25000 |
| `style.spec.ts`  | Original, editorial and technical, light and dark, at 1440px    |              32 |

Keep these existing exceptions explicit; do not increase them to accommodate a
failure. Visual agreement is not a complete accessibility check.

Only after an authorized visual change, build first and inspect representative
desktop/mobile light/dark pages. Select the affected tests from either suite and
review each reference diff. For example, replace the pattern before running:

```sh
npm run test:e2e -- e2e/visual.spec.ts e2e/style.spec.ts --grep '<reviewed-test-pattern>' --update-snapshots
```

Do not regenerate unrelated references. Rerun the complete suite after reviewing
the deliberate changes. Reference updates never regenerate the canonical PDFs.

The site publishes robots.txt and .well-known/security.txt at the hosting root.
Treat `/` as the canonical entry point and SECURITY.md as the operational reporting
policy. Verify that generated URLs and local links do not retain the old `/CV/`
mount.
