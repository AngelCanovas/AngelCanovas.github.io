# Angel Cánovas Mula — CV

Bilingual CV and portfolio of a Full-Stack Java Engineer based in Murcia, Spain.

- [English portfolio](https://angelcanovas.github.io/CV/)
- [Portfolio en español](https://angelcanovas.github.io/CV/es/)
- [Online CV](https://angelcanovas.github.io/CV/cv/) · [CV online](https://angelcanovas.github.io/CV/cv/es/)
- [English PDF](https://angelcanovas.github.io/CV/cv/angel-canovas-cv-en.pdf) · [PDF español](https://angelcanovas.github.io/CV/cv/angel-canovas-cv-es.pdf)

The static Astro site includes accessible navigation, light/dark themes, local
fonts, an interactive hero, print styles and machine-readable CV feeds.

## Development

Use the Node version in `.nvmrc`, then `npm ci` and `npm run dev`.
The development URL is `http://localhost:4321/CV/`.
Content lives in `src/data/site.ts`; maintain both locales together.
The committed PDF files are canonical: do not regenerate them without the owner's
explicit request. Hidden technical notes contain no unpublished articles.

Before committing, run `npm run check`, `npm run lint`, `npm run format:check`,
`npm test`, `npm run build`, `npm run test:e2e`, `npm run lighthouse`,
`npm run lighthouse:mobile` and `npm audit --audit-level=high`.
The test server mounts `dist/` at `/CV/`. Linux visual references use the lockfile
Chromium and zero pixel tolerance; Windows captures supplement geometry checks.

## Deployment and security

See [deployment](docs/deployment.md), [security policy](SECURITY.md),
[dependency patches](docs/dependency-security.md) and [UI contracts](docs/ui-provenance.md).
Pushes to `main` validate and publish the same tested build through GitHub Actions.
QA reports and traces are kept out of public workflow artifacts.

## Rights

Original code and content are reserved; public visibility grants no open-source
license. See [LICENSE](LICENSE) and [third-party notices](public/third-party-notices.txt).
The owner supplies the CV and profile assets. Documentary confirmation of the
photograph's authorship remains outstanding; migration alone does not establish it.
