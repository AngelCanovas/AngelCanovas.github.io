# Checking a published update

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
publish Playwright reports/traces; the local report privacy check decodes the ZIP
inside HTML and rejects Git metadata and personal paths. Retain the disabled
Git capture setting even though the public commits use a noreply identity.

Preserve zero-difference Linux visual gates. For an authorized redesign, inspect
representative desktop/mobile light/dark pages before updating intentional changes
with `npm run test:e2e -- e2e/visual.spec.ts --update-snapshots`, then rerun the
complete suite. PDF downloads retain their canonical bytes.

The site publishes robots.txt and .well-known/security.txt at the hosting root.
Treat `/` as the canonical entry point and SECURITY.md as the operational reporting
policy. Verify that generated URLs and local links do not retain the old `/CV/`
mount.
