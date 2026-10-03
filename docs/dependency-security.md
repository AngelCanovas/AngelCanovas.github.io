# Dependency security patches

Two minimal local third-party forks retain upstream licenses and source hashes in
`vendor/provenance.json`, with root `file:` dependencies and `.npmrc`'s
`install-links=true`. The lockfile deduplicates them for their actual consumers.

- **braces 3.0.3**, MIT: GHSA-vfj7-8cjw-p6xm. The parser and recursive AST walkers
  enforce depth 128, including caller-supplied ASTs and parentheses, before stack
  exhaustion. Normal patterns retain their behavior.
- **http-cache-semantics 4.2.0**, BSD-2-Clause: GHSA-ch52-4w7c-c8xp. Stale reuse
  respects private/shared caching, no-store/no-cache, Vary, cookies and mandatory
  revalidation before accepting max-stale, stale-while-revalidate or stale-if-error.

`src/lib/dependency-security.test.ts` covers deep ASTs/patterns, shared privacy,
cookies, revalidation, ordinary expansion and cache serialization. Upstream files
keep their formatting so local patches can be compared with the recorded hashes.

`npm audit` does not examine local fork code. The patches remain maintained here
until an upstream replacement is verified compatible: update only that dependency,
repeat the security regressions and all quality/visual gates, then remove the fork
and update provenance/notices. An advisory disappearing is insufficient evidence.

## Additional static-analysis finding

CodeQL flags `js/polynomial-redos` in the upstream connection-header splitting
expression in `vendor/http-cache-semantics/index.js`. Crafted long whitespace
input may cause excessive processing. This dependency runs during the build;
the deployed site contains static files and does not run this Node package.
The current site uses local assets and performs no remote image fetches. This
limits the current exposure but does not resolve the upstream expression.
The existing stale-cache patch and recorded source hashes remain unchanged.
Track this separately before reusing the fork in a server or with untrusted
HTTP inputs; no alert suppression or claim of complete CodeQL clearance is made.
