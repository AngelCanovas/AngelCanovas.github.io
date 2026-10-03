/**
 * Pure logic behind the Hero backdrop: the decorative label catalogue, the row
 * layout that tiles it, the heat curves of the pointer trail and the rectangle
 * algebra the canvas renderer needs to repaint only what changed.
 *
 * The interaction model follows Cloudflare's Registrar landing page: a masked
 * grid of monospaced labels that drifts slowly and lights up around the
 * pointer. Keeping the maths out of the canvas module makes it testable.
 */

export interface BackdropRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface LabelPlacement {
  /** Index in the catalogue, already wrapped. */
  index: number;
  /** Left edge, CSS px from the canvas left. */
  x: number;
  /** Top edge, CSS px from the canvas top. */
  y: number;
  width: number;
  height: number;
}

interface LayoutOptions {
  areaWidth: number;
  areaHeight: number;
  /** Baseline-to-baseline distance between rows. */
  rowHeight: number;
  columnGap: number;
  rowGap: number;
  /** Number of labels in the catalogue; rows wrap around it. */
  catalogueSize: number;
  /** Catalogue position the first row starts at, so rows stay staggered. */
  startIndex: number;
  /** Measured width of a catalogue entry, in CSS px. */
  widthOf: (catalogueIndex: number) => number;
}

/**
 * Decorative "file extensions" of the stack in the CV, written as the domain
 * labels of the reference design. They are texture, not content: the readable
 * copy lives in `site.ts`, so they need no translation.
 */
export const HERO_BACKDROP_LABELS: readonly string[] = [
  'java',
  'spring',
  'spring-boot',
  'spring-security',
  'jpa',
  'hibernate',
  'rest',
  'api',
  'angular',
  'typescript',
  'ts',
  'javascript',
  'js',
  'html',
  'css',
  'sql',
  'db2',
  'mysql',
  'postgresql',
  'mariadb',
  'git',
  'gitlab',
  'maven',
  'docker',
  'linux',
  'scrum',
  'safe',
  'saml',
  'access-control',
  'csrf',
  'cookies',
  'sessions',
  'hardening',
  'owasp',
  'tls',
  'csp',
  'audit',
  'remediation',
  'junit',
  'spock',
  'postman',
  'api-testing',
  'testing',
  'monitoring',
  'incidents',
  'jira',
  'confluence',
  'logs',
  'debugging',
  'copilot',
  'opencode',
  'prompts',
  'code-review',
  'docs',
  'refactor',
  'thymeleaf',
  'jsp',
  'jboss',
  'tomcat',
  'elasticsearch',
  'node',
  'php',
  'laravel',
  'python',
  'vue',
  'liquibase',
  'microservices',
  'hexagonal',
  'uml',
  'powershell',
  'bash',
  'jenkins',
  'dotnet',
  'astro',
  'vite',
  'npm',
  'lighthouse',
  'web-vitals',
  'a11y',
  'perf',
  'cache',
  'deploy',
  'nginx',
  'vps',
  'ssh',
  'http',
  'https',
  'dns',
  'cors',
  'json',
  'yaml',
  'markdown',
  'xml',
  'websocket',
  'ci',
  'cd',
  'pipeline',
  'cron',
  'regex',
  'i18n',
  'seo',
  'types',
];

const BASE_OPACITY_MIN = 0.1;
const BASE_OPACITY_RANGE = 0.1;
/** FNV-ish mixing step, so every catalogue entry gets a stable opacity. */
const OPACITY_STEP = 1103515245;
const OPACITY_SALT = 12345;
const OPACITY_BUCKETS = 1000;
/** Guard against a catalogue entry wider than the whole canvas. */
const MAX_LABELS_PER_ROW = 64;

/**
 * Resting opacity of a catalogue entry, 0.1–0.2. Deterministic on purpose: the
 * grid must look identical after a resize or a theme change, so no `Math.random`
 * may leak into the layout.
 */
export function labelOpacity(index: number): number {
  const hash = ((index * OPACITY_STEP + OPACITY_SALT) >>> 0) % OPACITY_BUCKETS;
  return BASE_OPACITY_MIN + (hash / OPACITY_BUCKETS) * BASE_OPACITY_RANGE;
}

/**
 * Heat a glyph receives from a pointer-trail sample, 0–1: full at the sample,
 * zero at the radius edge, and cooling down as the sample ages.
 */
export function heatInfluence(distance: number, ageFraction: number, radius: number): number {
  if (radius <= 0 || distance >= radius) return 0;
  const age = Math.min(1, Math.max(0, ageFraction));
  const falloff = 1 - distance / radius;
  return Math.pow(falloff, 1 + age * 5) * (1 - age * age);
}

/** Heat a glyph receives from an expanding ping: a band travelling outwards. */
export function ringInfluence(
  distance: number,
  radius: number,
  band: number,
  ageFraction: number,
): number {
  if (band <= 0) return 0;
  const offset = Math.abs(distance - radius);
  if (offset >= band) return 0;
  const age = Math.min(1, Math.max(0, ageFraction));
  return (1 - offset / band) * (1 - age * age);
}

/**
 * Tiles the catalogue over the canvas: every row is centred on the canvas, rows
 * follow the catalogue sequence (so columns stay staggered) and rows stop as
 * soon as the next baseline would leave the area.
 */
export function layoutLabels(options: LayoutOptions): LabelPlacement[] {
  const {
    areaWidth,
    areaHeight,
    rowHeight,
    columnGap,
    rowGap,
    catalogueSize,
    startIndex,
    widthOf,
  } = options;
  const placements: LabelPlacement[] = [];
  if (areaWidth <= 0 || areaHeight <= 0 || rowHeight <= 0 || catalogueSize <= 0) return placements;

  const rowPitch = rowHeight + rowGap;
  let cursor = startIndex;

  for (let top = 0; top + rowHeight <= areaHeight; top += rowPitch) {
    const row: { index: number; width: number }[] = [];
    let rowWidth = 0;

    while (row.length < MAX_LABELS_PER_ROW) {
      const index = ((cursor % catalogueSize) + catalogueSize) % catalogueSize;
      const width = widthOf(index);
      const nextWidth = row.length === 0 ? width : rowWidth + columnGap + width;
      if (row.length > 0 && nextWidth > areaWidth) break;
      row.push({ index, width });
      rowWidth = nextWidth;
      cursor += 1;
      if (rowWidth >= areaWidth) break;
    }

    let left = (areaWidth - rowWidth) / 2;
    for (const entry of row) {
      placements.push({
        index: entry.index,
        x: left,
        y: top,
        width: entry.width,
        height: rowHeight,
      });
      left += entry.width + columnGap;
    }
  }

  return placements;
}

export function inflateRect(rect: BackdropRect, amount: number): BackdropRect {
  return {
    left: rect.left - amount,
    top: rect.top - amount,
    right: rect.right + amount,
    bottom: rect.bottom + amount,
  };
}

export function unionRect(a: BackdropRect | null, b: BackdropRect): BackdropRect {
  if (!a) return { ...b };
  return {
    left: Math.min(a.left, b.left),
    top: Math.min(a.top, b.top),
    right: Math.max(a.right, b.right),
    bottom: Math.max(a.bottom, b.bottom),
  };
}

export function rectsIntersect(a: BackdropRect, b: BackdropRect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export function clampRect(rect: BackdropRect, width: number, height: number): BackdropRect {
  return {
    left: Math.max(0, rect.left),
    top: Math.max(0, rect.top),
    right: Math.min(width, rect.right),
    bottom: Math.min(height, rect.bottom),
  };
}
