# Angel Cánovas Mula — CV

Bilingual CV and portfolio of a Full-Stack Java Engineer based in Murcia, Spain.

[![CI](https://github.com/AngelCanovas/AngelCanovas.github.io/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/AngelCanovas/AngelCanovas.github.io/actions/workflows/ci.yml)

- [English portfolio](https://angelcanovas.github.io/)
- [Portfolio en español](https://angelcanovas.github.io/es/)
- [Online CV](https://angelcanovas.github.io/cv/) · [CV online](https://angelcanovas.github.io/cv/es/)
- [English PDF](https://angelcanovas.github.io/cv/angel-canovas-cv-en.pdf) · [PDF español](https://angelcanovas.github.io/cv/angel-canovas-cv-es.pdf)

The static Astro site includes accessible navigation, light/dark themes, local
fonts, an interactive hero, print styles and machine-readable CV feeds.

## Engineering approach

This repository contains the implementation of the website linked above. Client
projects in the CV describe professional contributions; their source code is not
distributed here. The website project card links directly to this repository.

| Area          | Implementation and purpose                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| Content       | `src/data/site.ts` holds both locales; type and parity checks keep their structure aligned.                       |
| Rendering     | Astro emits static HTML. Shared layouts and components keep the portfolio and printable CV consistent.            |
| Behavior      | Typed client modules handle navigation, theme and interactions. Pure logic lives in `src/lib` with focused tests. |
| Accessibility | Semantic headings, keyboard focus, no-JavaScript content and reduced motion are checked against the built site.   |
| Security      | Same-origin fonts/icons and per-page CSP hashes avoid third-party runtime requests and unrestricted inline code.  |
| Delivery      | Protected PRs run the quality gates; Pages publishes the tested artifact after a successful `main` push.          |

See [UI contracts](docs/ui-provenance.md), [deployment](docs/deployment.md) and
[toolchain compatibility](docs/toolchain.md) for the constraints behind these choices.

## Development

Clone `https://github.com/AngelCanovas/AngelCanovas.github.io.git` into
`AngelCanovas.github.io` and work from that directory. Use the Node version in
`.nvmrc` (Node 24 LTS), then:

```sh
npm ci
npx playwright install chromium
npm run dev
```

On Linux, `npx playwright install --with-deps chromium` also installs the browser's
system dependencies. See [toolchain](docs/toolchain.md) before upgrading the compiler
or runtime major.
The development URL is `http://localhost:4321/`.
Content lives in `src/data/site.ts`; maintain both locales together.
The committed PDF files are canonical: do not regenerate them without the owner's
explicit request. Hidden technical notes contain no unpublished articles.

Before committing, run `npm run check`, `npm run lint`, `npm run format:check`,
`npm test`, `npm run build`, `npm run test:e2e`, `npm run lighthouse`,
`npm run lighthouse:mobile` and `npm audit --audit-level=high`.
For local browser tests, build first: `npm run build && npm run test:e2e`.
The test server mounts `dist/` at `/`. Linux captures use zero pixel tolerance for stable
surfaces; the noir hero and hosted 768px About crops use the bounded allowances documented
in [verification](docs/verification.md). Windows captures supplement geometry checks.

## Deployment and security

See [deployment](docs/deployment.md), [security policy](SECURITY.md),
[dependency patches](docs/dependency-security.md) and [UI contracts](docs/ui-provenance.md).
Pushes to `main` validate and publish the same tested build through GitHub Actions.
QA reports and traces are kept out of public workflow artifacts.
Use the [published-update checklist](docs/verification.md) to compare the served
revision, routes and canonical PDF hashes with the successful CI run.

## Rights

Original code and content are reserved; public visibility grants no open-source
license. See [LICENSE](LICENSE) and [third-party notices](public/third-party-notices.txt).
The owner supplies the CV and profile assets. Documentary confirmation of the
photograph's authorship remains outstanding; migration alone does not establish it.
