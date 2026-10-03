# Security policy

The current 1.0 release is supported. Please report vulnerabilities through
[GitHub private vulnerability reporting](https://github.com/AngelCanovas/AngelCanovas.github.io/security/advisories/new).
Avoid placing sensitive reports in public issues.

The site ships a hashed per-page CSP, same-origin fonts and icons, no inline event
handlers, and a build guard for uncovered inline scripts/styles. GitHub Pages
controls HTTP headers; no custom nginx headers are claimed for this deployment.

`/robots.txt` publishes the origin's crawling policy. Security contact information
is available at `/.well-known/security.txt`, with an HTTPS canonical URL and expiry.
Use the private GitHub channel above to report sensitive details.

Dependency alerts, source scanning and regression tests complement manual review.
`npm audit` does not inspect the local patched packages; see
[dependency security](docs/dependency-security.md).
