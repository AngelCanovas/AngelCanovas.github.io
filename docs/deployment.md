# GitHub Pages deployment

The hosting origin is `https://angelcanovas.github.io`; the site base is `/`.
Astro `site` and `base`, `src/lib/base-path.ts`, SEO and feeds preserve this distinction.

`.github/workflows/ci.yml` runs on pushes to `main`, pull requests and manual requests.
It installs the pinned Node runtime and lockfile dependencies, validates source,
unit tests, canonical PDFs, browser behavior/accessibility, visual references,
both Lighthouse budgets, report privacy and the production build's root URLs.
The security job scans the snapshot and new Git history with checksum-verified
Gitleaks and ShellCheck; CodeQL checks JavaScript/TypeScript and Actions separately.

Only the validated `dist/` is uploaded as the short-lived Pages artifact, including
the origin `.well-known` endpoint. No QA HTML, traces or workspace caches are uploaded.
Publishing uses the repository's `GITHUB_TOKEN` and Pages OIDC; no personal token,
private-source checkout or cross-repository SSH key is required.
Deployments are serialized without cancellation, depend on all required jobs and
check that the revision is still the current `main` before publishing.
`/build-info.json` identifies the version, new revision and full site URL.

Pages source must be GitHub Actions, HTTPS enabled, and the `github-pages` environment
restricted to `main`. Pull requests get read permissions and cannot deploy.
Branch protections require successful validation and security/CodeQL checks, block
force pushes/deletion and allow the single maintainer to merge without self-review.
Updates use reviewed pull requests once branch protection is active.

Pages controls cache and response headers. The local server's immutable-asset and
ETag policies are QA behavior, not a claim that custom headers run on Pages.
The origin robots.txt and .well-known/security.txt are served from the root.
The repository and local development directory are both `AngelCanovas.github.io`.
