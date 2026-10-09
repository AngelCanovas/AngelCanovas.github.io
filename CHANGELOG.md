# Changelog

## 1.2.0 — 2026-10-09

Add the fourth `noir` visual style: a grayscale ink/comic presentation with an original
inline SVG bonfire and coiled sword hero illustration. The fire, embers, blade glint and
reflection respond to a fine pointer while reduced-motion, print and touch fallbacks stay
static and accessible.

Correct the sword orientation to match the intended hilt-up, tip-down bonfire silhouette.
Pause decorative motion when the hero leaves the viewport, make technical graph lifecycle
handling safe across visibility and back-forward-cache transitions, normalize print headings
across styles, and serialize browser visual checks for stable zero-diff references.

## 1.1.0 — 2026-10-03

Add automatic atmospheric Hero halos for touch devices, with light and dark theme
palettes, a brief entrance animation and a static reduced-motion fallback. Preserve
the desktop canvas interaction and avoid allocating its buffers on touch devices.

Simplify client animation and filter configuration, remove 18 unused settings and
three options interfaces, and fix first-paint scheduling, reveal cleanup and quote
pause lifecycles. Add 22 regression cases; see `docs/code-cleanup.md` for scope,
measurements and validation limits.

Refresh compatible npm dependencies and SHA-pinned GitHub Actions, move CI to
Node 24 LTS with matching runtime types, and document the compiler compatibility
boundary. Harden the cache fork's Connection/Vary parsing against pathological
whitespace while retaining stale-cache and brace-depth security patches and licenses.
Add adversarial-input and provenance regressions, clarify the repository's
architecture, and link the website case study to its published implementation.

Rename the public repository and development directory to `AngelCanovas.github.io`
and serve the bilingual site directly at the hosting root. Update routes, metadata,
feeds, QA and security contact URLs while preserving canonical PDFs and behavior.

## 1.0.0 — 2026-10-03

Initial public CV with independent history, bilingual portfolio and printable
online CV, canonical PDF downloads, accessible navigation and themes, hashed CSP,
local fonts and icons, security dependency patches and tested GitHub Pages
deployment under `/CV/`.
