# AGENTS.md — AngelCanovas.github.io

Static bilingual Astro CV hosted at https://angelcanovas.github.io/.
Use `main`, independent Git history and a publication identity. Inspect `git status`,
`git log --oneline -10` and `git diff` before each change. Commit logical changes
with Conventional Commits after running check, lint, format:check, test, build,
test:e2e, both Lighthouse budgets and npm audit. Do not publish without authorization.

Source content is `src/data/site.ts`; preserve visible EN/ES content, DOM contracts,
design, CSP and accessibility. Canonical PDFs in `public/cv/` must never be edited
or regenerated without the owner's explicit request. Do not add omitted personal
data or unpublished articles. Keep disabled notes empty with matching locale types.

Use `withBase()` for internal paths and `absoluteUrl()` for canonical URLs. Keep
the `/` root mount consistent in tools, browser tests, feeds, downloads, sprite
and language routing. Preserve bot/history redirect guards and query/hash.

Never weaken CSP or inline-code build guards. Use classes/data attributes and the
CSSOM; keep same-origin fonts/icons, semantic headings, contrast tokens and focus.
Retain `vendor/` forks, licenses, hashes, root file dependencies and install-links.
See docs/dependency-security.md before changing them; npm audit does not scan forks.

Build before browser tests. Linux snapshots use zero pixel tolerance and lockfile
Chromium; review deliberate changes only. Disable Playwright Git metadata capture.
Never commit or upload QA reports/traces, caches, secrets or build output as source.
Pages publishes only the tested dist from this repository, with minimal token/OIDC
permissions and no cross-repository checkout. See docs/deployment.md.
