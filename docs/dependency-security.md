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

## Header-processing hardening

The cache fork also replaces the upstream Connection and Vary whitespace-splitting
regexps with comma splitting followed by per-field trimming. Processing stays
linear even when a header contains a long whitespace run without commas.
Connection field names are normalized before removing nominated headers.
This resolves the expression flagged by CodeQL's `js/polynomial-redos` rule
without suppressing the alert or changing the stale-cache confidentiality patch.

Regressions cover normal header semantics, a 250,000-character adversarial input
in an isolated process with a timeout, and all recorded source/license hashes.
The installed fork is version 4.2.2; its upstream base remains 4.2.0. The original
upstream hashes and licenses remain intact; only the patched source hash changes.
