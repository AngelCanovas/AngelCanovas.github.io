# Presentation and UI contracts

The current editorial interface uses project-owned paper/ink tokens, base/chrome
styles, editorial composition rules, shared section headings and timeline entries.
Third-party CSS is Bootstrap; SVG paths derive from
Bootstrap Icons 1.11.3 with MIT notices. Fonts are self-hosted Roboto and Raleway.
Keep third-party license notices intact. The owner-provided profile and derived
icons retain the authorship limitation documented in LICENSE.

Preserve DOM contracts: `#header`, `.header-toggle`, `#navmenu`,
`#mobile-nav-overlay`, `#main-content`, `#footer`, `#scroll-top`, section IDs,
language links, theme attributes and hero canvas colour tokens. Client modules
depend on these for focus, navigation, scroll, theme and animation behavior.

Linux visual references compare with zero differing pixels for stable surfaces. The noir
hero and hosted 768px About crops use the bounded allowances documented in
`docs/verification.md`.
The 158 reference
images cover both languages, themes, navigation states, filters, CV and print.
The editorial redesign intentionally updates the reviewed presentation references;
behaviour assertions remain unchanged and zero-pixel tolerances apply to stable surfaces.
Windows browser tests capture review images and validate geometry and behavior.
Neither visual agreement nor a new Git history establishes resource ownership.

The hero is original contour linework on canvas with CSS halftone printing plates.
It paints once at rest, coalesces pointer input into one frame, and uses no text,
external assets or animation library. Click and Konami input deform the contours.
Primary touch input uses only finite CSS plate registration (no canvas bitmap).
The field pauses offscreen/hidden; reduced motion leaves static artwork. Visual tests
retain the canvas paint signal before capturing. The existing CI fontconfig
remains compatible; the new canvas no longer relies on a monospace fallback.

The `noir` style adds a project-owned inline SVG bonfire/sword drawing to the hero.
It uses grayscale strokes, hatch marks and CSS-only flame, ember and blade-glint
motion; it is hidden from assistive technology, replaced by a static drawing under
reduced motion, hidden in print and does not load third-party art or remote assets.

`editorial-motion.ts` adds bounded scroll depth and fine-pointer proximity to
selected decorative/reading surfaces through the CSSOM. It batches measurements
before writes, schedules at most one frame, ignores touch proximity and resets on
live motion preference changes. No-JS content is visible; print resets transforms
and removes the hero artwork. Roboto Variable and Raleway remain same-origin.
