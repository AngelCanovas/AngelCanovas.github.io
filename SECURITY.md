# Security policy

The current 1.0 release is supported. Please report vulnerabilities through
[GitHub private vulnerability reporting](https://github.com/AngelCanovas/CV/security/advisories/new).
Avoid placing sensitive reports in public issues.

The site ships a hashed per-page CSP, same-origin fonts and icons, no inline event
handlers, and a build guard for uncovered inline scripts/styles. GitHub Pages
controls HTTP headers; no custom nginx headers are claimed for this deployment.

`/CV/robots.txt` is a project reference and does not control host crawling.
`/CV/.well-known/security.txt` is a project-level contact copy; it does not satisfy
RFC 9116's origin-level location. Use the private GitHub channel above.

Dependency alerts, source scanning and regression tests complement manual review.
`npm audit` does not inspect the local patched packages; see
[dependency security](docs/dependency-security.md).
