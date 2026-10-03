# Presentation and UI contracts

The current interface uses project-owned tokens, base/chrome styles, shared section
headings and timeline entries. Third-party CSS is Bootstrap; SVG paths derive from
Bootstrap Icons 1.11.3 with MIT notices. Fonts are self-hosted Roboto and Raleway.
Keep third-party license notices intact. The owner-provided profile and derived
icons retain the authorship limitation documented in LICENSE.

Preserve DOM contracts: `#header`, `.header-toggle`, `#navmenu`,
`#mobile-nav-overlay`, `#main-content`, `#footer`, `#scroll-top`, section IDs,
language links, theme attributes and hero canvas design tokens. Client modules
depend on these for focus, navigation, scroll, theme and animation behavior.

Linux visual references compare with zero differing pixels. Preserve the 158
reference images; review only deliberate URL changes in the online CV footer.
Windows browser tests capture review images and validate geometry and behavior.
Neither visual agreement nor a new Git history establishes resource ownership.
