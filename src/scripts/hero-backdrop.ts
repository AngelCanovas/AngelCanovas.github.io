import {
  HERO_BACKDROP_LABELS,
  clampRect,
  heatInfluence,
  inflateRect,
  labelOpacity,
  layoutLabels,
  rectsIntersect,
  ringInfluence,
  unionRect,
  type BackdropRect,
  type LabelPlacement,
} from '../lib/hero-backdrop';
import { KONAMI_EVENT } from '../lib/konami';
import { prefersReducedMotion } from './scroll-utils';

export interface HeroBackdropOptions {
  reducedMotion?: boolean;
  maxDevicePixelRatio?: number;
  labels?: readonly string[];
}

interface Glyph {
  value: string;
  x: number;
  width: number;
}

interface BackdropLabel extends LabelPlacement {
  glyphs: Glyph[];
  /** Per-glyph heat, 0–1: one value per character so a wave crosses the text. */
  levels: Float32Array;
  peak: number;
  opacity: number;
}

interface TrailSample {
  x: number;
  y: number;
  birth: number;
}

interface Ping {
  x: number;
  y: number;
  birth: number;
}

interface CanvasStyle {
  font: string;
  /** Resting label ink, read from `color`. */
  ink: string;
  /** Lit label colour, read from `outline-color`. */
  heat: string;
  lineHeight: number;
  letterSpacing: number;
  columnGap: number;
  rowGap: number;
}

/** Spatial-hash cell and heat radius, in CSS px (same scale as the reference). */
const CELL_SIZE = 110;
const HEAT_RADIUS = 110;
/** Peak alpha of a lit glyph; the resting grid stays between 0.1 and 0.2. */
const MAX_HEAT_ALPHA = 0.9;
const MIN_HEAT_ALPHA = 0.002;
/** Pointer trail: one sample per 12 px walked, each one living ~1.3 s. */
const TRAIL_LIFE = 1330;
const TRAIL_MAX_SAMPLES = 60;
const TRAIL_STEP = 12;
const TRAIL_MAX_GAP = 50;
/** Heat eases in ~50 ms and out ~90 ms. */
const HEAT_IN_TAU = 50;
const HEAT_OUT_TAU = 90;
/** Clicks and the Konami code send a ring travelling outwards. */
const PING_SPEED = 0.9;
const PING_BAND = 70;
const PING_LIFE = 1400;
const PING_MAX_RADIUS = 1600;
const PING_MAX_ACTIVE = 3;
const PING_RING_PROBES = 16;
/** Full repaints are throttled; dirty rectangles are padded for antialiasing. */
const REBUILD_MIN_INTERVAL = 100;
const DIRTY_PADDING = 4;
/**
 * The first paint measures ~1.3k labels and fills the offscreen buffer: it is
 * the heaviest main-thread task of the page, so it waits for an idle slot after
 * the first paint (with a hard deadline) instead of competing with it.
 */
const FIRST_PAINT_TIMEOUT = 250;
const FIRST_PAINT_FALLBACK = 80;
/** Hard deadline: the backdrop still appears if `load` takes too long. */
const FIRST_PAINT_DEADLINE = 1200;

/**
 * Interactive hero backdrop: a masked grid of monospaced labels that drifts with
 * the container and lights up along the pointer trail (clicks and the Konami
 * code send a ring through the grid). The resting grid is painted once into an
 * offscreen buffer; every dirty frame only restores and repaints the rectangles
 * that carry heat, so an idle page costs nothing and no rAF loop runs.
 *
 * Returns a cleanup function that stops the loop and detaches every listener.
 */
function initLabelBackdrop(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  options: HeroBackdropOptions = {},
): () => void {
  const context = canvas.getContext('2d', { alpha: true });
  const base = document.createElement('canvas');
  const baseContext = base.getContext('2d', { alpha: true });
  if (!context || !baseContext) return () => {};

  const labels = options.labels ?? HERO_BACKDROP_LABELS;
  // Two full-size buffers: capping the ratio keeps them around ~15 MB each on a
  // desktop hero instead of doubling that on retina screens.
  const maxDevicePixelRatio = options.maxDevicePixelRatio ?? 1.5;
  const canvasContext: CanvasRenderingContext2D = context;
  const bufferContext: CanvasRenderingContext2D = baseContext;
  const drift = root.querySelector<HTMLElement>('[data-hero-drift]');

  // The MediaQueryList is kept only to react to a live change of the preference;
  // the boolean itself comes from the shared helper.
  const reducedMotionQuery =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
  const pointerQuery =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(any-hover: hover) and (any-pointer: fine)')
      : null;
  const schemeQuery =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  let reducedMotion = options.reducedMotion ?? prefersReducedMotion();
  let canvasStyle = readStyle();
  let width = 1;
  let height = 1;
  let dpr = 1;
  let placed: BackdropLabel[] = [];
  let cells = new Map<number, Map<number, BackdropLabel[]>>();
  let hot = new Set<BackdropLabel>();
  const samples: TrailSample[] = [];
  const pings: Ping[] = [];
  let trail: TrailSample | null = null;
  let pending: { x: number; y: number } | null = null;
  let rafId = 0;
  let lastFrame = 0;
  let rebuildTimer: ReturnType<typeof setTimeout> | undefined;
  let firstPaintTimer: ReturnType<typeof setTimeout> | undefined;
  let firstPaintIdle: number | undefined;
  let firstPaintPending = true;
  let lastRebuild = 0;
  let stopped = false;
  let visible = true;

  function readStyle(): CanvasStyle {
    const computed = getComputedStyle(canvas);
    const fontSize = Number.parseFloat(computed.fontSize) || 12;
    return {
      font: `${computed.fontStyle} ${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`,
      ink: computed.color,
      heat: computed.outlineColor,
      lineHeight: Number.parseFloat(computed.lineHeight) || fontSize * 1.5,
      letterSpacing: Number.parseFloat(computed.letterSpacing) || 0,
      columnGap: Number.parseFloat(computed.columnGap) || 0,
      rowGap: Number.parseFloat(computed.rowGap) || 0,
    };
  }

  /** Layout size in CSS px; the element may be translated by the drift. */
  function measureCanvas() {
    const computed = getComputedStyle(canvas);
    width = Math.max(1, Number.parseFloat(computed.width) || canvas.clientWidth);
    height = Math.max(1, Number.parseFloat(computed.height) || canvas.clientHeight);
    dpr = Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio);
  }

  function labelRect(label: BackdropLabel): BackdropRect {
    return {
      left: label.x,
      top: label.y,
      right: label.x + label.width,
      bottom: label.y + label.height,
    };
  }

  /** Measures and tiles the catalogue over the canvas, then indexes it. */
  function build() {
    placed = [];
    cells = new Map();
    bufferContext.font = canvasStyle.font;
    const charWidths = new Map<string, number>();

    const charWidth = (value: string) => {
      const cached = charWidths.get(value);
      if (cached !== undefined) return cached;
      const measured = bufferContext.measureText(value).width;
      charWidths.set(value, measured);
      return measured;
    };

    const wordWidth = (catalogueIndex: number) => {
      const text = `.${labels[catalogueIndex]}`;
      let total = 0;
      for (const char of text) total += charWidth(char) + canvasStyle.letterSpacing;
      return Math.max(0, total - canvasStyle.letterSpacing);
    };

    const placements = layoutLabels({
      areaWidth: width,
      areaHeight: height,
      rowHeight: canvasStyle.lineHeight,
      columnGap: canvasStyle.columnGap,
      rowGap: canvasStyle.rowGap,
      catalogueSize: labels.length,
      startIndex: 0,
      widthOf: wordWidth,
    });

    for (const placement of placements) {
      const text = `.${labels[placement.index]}`;
      const glyphs: Glyph[] = [];
      let x = placement.x;
      for (const char of text) {
        const glyphWidth = charWidth(char);
        glyphs.push({ value: char, x, width: glyphWidth });
        x += glyphWidth + canvasStyle.letterSpacing;
      }
      const label: BackdropLabel = {
        ...placement,
        glyphs,
        levels: new Float32Array(glyphs.length),
        peak: 0,
        opacity: labelOpacity(placement.index),
      };
      placed.push(label);

      const firstRow = Math.floor(placement.y / CELL_SIZE);
      const lastRow = Math.floor((placement.y + placement.height) / CELL_SIZE);
      const firstColumn = Math.floor(placement.x / CELL_SIZE);
      const lastColumn = Math.floor((placement.x + placement.width) / CELL_SIZE);
      for (let row = firstRow; row <= lastRow; row += 1) {
        let rowCells = cells.get(row);
        if (!rowCells) {
          rowCells = new Map();
          cells.set(row, rowCells);
        }
        for (let column = firstColumn; column <= lastColumn; column += 1) {
          const cell = rowCells.get(column);
          if (cell) cell.push(label);
          else rowCells.set(column, [label]);
        }
      }
    }
  }

  /** Paints the resting grid into the offscreen buffer and mirrors it. */
  function paintBase() {
    base.width = Math.max(1, Math.round(width * dpr));
    base.height = Math.max(1, Math.round(height * dpr));
    bufferContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    bufferContext.font = canvasStyle.font;
    bufferContext.textBaseline = 'top';
    bufferContext.fillStyle = canvasStyle.ink;
    bufferContext.clearRect(0, 0, width, height);
    for (const label of placed) {
      bufferContext.globalAlpha = label.opacity;
      for (const glyph of label.glyphs) bufferContext.fillText(glyph.value, glyph.x, label.y);
    }
    bufferContext.globalAlpha = 1;

    canvasContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvasContext.clearRect(0, 0, width, height);
    canvasContext.drawImage(base, 0, 0, base.width, base.height, 0, 0, width, height);
  }

  /** Repaints a region with the resting grid, erasing whatever was lit there. */
  function restoreRegion(rect: BackdropRect) {
    const region = clampRect(rect, width, height);
    const regionWidth = region.right - region.left;
    const regionHeight = region.bottom - region.top;
    if (regionWidth <= 0 || regionHeight <= 0) return;
    canvasContext.clearRect(region.left, region.top, regionWidth, regionHeight);
    canvasContext.drawImage(
      base,
      region.left * dpr,
      region.top * dpr,
      regionWidth * dpr,
      regionHeight * dpr,
      region.left,
      region.top,
      regionWidth,
      regionHeight,
    );
  }

  function collectNear(x: number, y: number, radius: number, into: Set<BackdropLabel>) {
    const firstRow = Math.floor((y - radius) / CELL_SIZE);
    const lastRow = Math.floor((y + radius) / CELL_SIZE);
    const firstColumn = Math.floor((x - radius) / CELL_SIZE);
    const lastColumn = Math.floor((x + radius) / CELL_SIZE);
    for (let row = firstRow; row <= lastRow; row += 1) {
      const rowCells = cells.get(row);
      if (!rowCells) continue;
      for (let column = firstColumn; column <= lastColumn; column += 1) {
        const cell = rowCells.get(column);
        if (!cell) continue;
        for (const label of cell) into.add(label);
      }
    }
  }

  /** Labels the ring of a ping could touch right now. */
  function collectPing(ping: Ping, now: number, into: Set<BackdropLabel>) {
    const radius = (now - ping.birth) * PING_SPEED;
    if (radius < 0 || radius > PING_MAX_RADIUS) return;
    for (let index = 0; index < PING_RING_PROBES; index += 1) {
      const angle = (Math.PI * 2 * index) / PING_RING_PROBES;
      collectNear(
        ping.x + Math.cos(angle) * radius,
        ping.y + Math.sin(angle) * radius,
        PING_BAND,
        into,
      );
    }
  }

  /** Heat every glyph of a label should reach this frame. */
  function targetHeat(label: BackdropLabel, now: number): number {
    if (reducedMotion || (!samples.length && !pings.length)) return 0;
    const middleY = label.y + label.height / 2;
    let target = 0;
    for (const glyph of label.glyphs) {
      const middleX = glyph.x + glyph.width / 2;
      for (const sample of samples) {
        const dx = middleX - sample.x;
        const dy = middleY - sample.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance >= HEAT_RADIUS) continue;
        const heat = heatInfluence(distance, (now - sample.birth) / TRAIL_LIFE, HEAT_RADIUS);
        if (heat > target) target = heat;
      }
      for (const ping of pings) {
        const age = now - ping.birth;
        if (age < 0) continue;
        const dx = middleX - ping.x;
        const dy = middleY - ping.y;
        const ring = ringInfluence(
          Math.sqrt(dx * dx + dy * dy),
          age * PING_SPEED,
          PING_BAND,
          age / PING_LIFE,
        );
        if (ring > target) target = ring;
      }
      if (target >= 1) return target;
    }
    return target;
  }

  function updateLevels(label: BackdropLabel, target: number, dt: number) {
    let peak = 0;
    for (let index = 0; index < label.levels.length; index += 1) {
      const current = label.levels[index];
      const tau = target > current ? HEAT_IN_TAU : HEAT_OUT_TAU;
      const next = current + (target - current) * (1 - Math.exp(-dt / tau));
      label.levels[index] = next;
      if (next > peak) peak = next;
    }
    label.peak = peak;
  }

  function drawHot(region: BackdropRect) {
    canvasContext.font = canvasStyle.font;
    canvasContext.textBaseline = 'top';
    canvasContext.fillStyle = canvasStyle.heat;
    for (const label of hot) {
      if (!rectsIntersect(labelRect(label), region)) continue;
      for (let index = 0; index < label.glyphs.length; index += 1) {
        const level = label.levels[index];
        if (level <= MIN_HEAT_ALPHA) continue;
        const glyph = label.glyphs[index];
        canvasContext.globalAlpha = Math.min(1, MAX_HEAT_ALPHA * level);
        canvasContext.fillText(glyph.value, glyph.x, label.y);
      }
    }
    canvasContext.globalAlpha = 1;
  }

  function addPing(x: number, y: number, birth: number) {
    pings.push({ x, y, birth });
    while (pings.length > PING_MAX_ACTIVE) pings.shift();
  }

  /** Fills the trail between the last sample and the pointer's current spot. */
  function pushTrail(now: number) {
    if (!pending || reducedMotion || pointerQuery?.matches === false) return;
    const previous = trail;
    if (!previous) {
      samples.push({ x: pending.x, y: pending.y, birth: now });
      trail = { x: pending.x, y: pending.y, birth: now };
      return;
    }
    const dx = pending.x - previous.x;
    const dy = pending.y - previous.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 1) return;
    const steps = Math.max(1, Math.ceil(distance / TRAIL_STEP));
    const gap = Math.min(Math.max(now - previous.birth, 0), TRAIL_MAX_GAP);
    for (let step = 1; step <= steps; step += 1) {
      const fraction = step / steps;
      samples.push({
        x: previous.x + dx * fraction,
        y: previous.y + dy * fraction,
        birth: now - gap * (1 - fraction),
      });
    }
    trail = { x: pending.x, y: pending.y, birth: now };
    while (samples.length > TRAIL_MAX_SAMPLES) samples.shift();
  }

  function dropExpired(now: number) {
    while (samples.length && now - samples[0].birth >= TRAIL_LIFE) samples.shift();
    for (let index = pings.length - 1; index >= 0; index -= 1) {
      const ping = pings[index];
      if (now - ping.birth >= PING_LIFE || (now - ping.birth) * PING_SPEED > PING_MAX_RADIUS) {
        pings.splice(index, 1);
      }
    }
  }

  function requestFrame() {
    if (rafId || stopped || reducedMotion || !visible || document.hidden) return;
    rafId = requestAnimationFrame(frame);
  }

  function frame(timestamp: number) {
    rafId = 0;
    if (stopped || !visible || document.hidden) return;
    const dt = lastFrame ? Math.min(Math.max(timestamp - lastFrame, 1), 64) : 16;
    lastFrame = timestamp;

    pushTrail(timestamp);
    dropExpired(timestamp);

    const candidates = new Set<BackdropLabel>();
    for (const sample of samples) collectNear(sample.x, sample.y, HEAT_RADIUS, candidates);
    for (const ping of pings) collectPing(ping, timestamp, candidates);

    // Old lit labels join the candidates so their pixels are restored too.
    const touched = new Set<BackdropLabel>(hot);
    for (const label of candidates) touched.add(label);
    let dirty: BackdropRect | null = null;
    for (const label of touched) {
      dirty = unionRect(dirty, inflateRect(labelRect(label), DIRTY_PADDING));
    }
    if (dirty) restoreRegion(dirty);

    hot = new Set();
    for (const label of touched) {
      updateLevels(label, candidates.has(label) ? targetHeat(label, timestamp) : 0, dt);
      if (label.peak > MIN_HEAT_ALPHA) hot.add(label);
    }
    if (dirty) drawHot(dirty);

    if (samples.length || pings.length || hot.size) rafId = requestAnimationFrame(frame);
    else {
      lastFrame = 0;
      trail = null;
    }
  }

  function rebuild() {
    if (stopped) return;
    firstPaintPending = false;
    lastRebuild = performance.now();
    canvasStyle = readStyle();
    measureCanvas();
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvasContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    hot = new Set();
    samples.length = 0;
    pings.length = 0;
    trail = null;
    paintBase();
    canvas.dataset.ready = 'true';
    requestFrame();
  }

  /**
   * Defers the expensive first rebuild: the canvas stays hidden until it has
   * content, and any resize that happens before it runs is picked up by that
   * same measurement (hence the early return below). It waits for `load` so the
   * paint never competes with the LCP text, with a deadline in case `load`
   * never fires (a stalled image, a long-lived connection).
   */
  function scheduleFirstPaint() {
    const paint = () => {
      firstPaintTimer = undefined;
      firstPaintIdle = undefined;
      rebuild();
    };
    const idlePaint = () => {
      if (typeof window.requestIdleCallback === 'function') {
        firstPaintIdle = window.requestIdleCallback(paint, { timeout: FIRST_PAINT_TIMEOUT });
        return;
      }
      firstPaintTimer = setTimeout(paint, FIRST_PAINT_FALLBACK);
    };
    if (document.readyState === 'complete') {
      idlePaint();
      return;
    }
    window.addEventListener('load', idlePaint, { once: true });
    firstPaintTimer = setTimeout(idlePaint, FIRST_PAINT_DEADLINE);
  }

  /** Coalesces resize/theme/font storms into one repaint. */
  function scheduleRebuild() {
    if (stopped || firstPaintPending) return;
    const elapsed = performance.now() - lastRebuild;
    if (elapsed >= REBUILD_MIN_INTERVAL) {
      if (rebuildTimer !== undefined) {
        clearTimeout(rebuildTimer);
        rebuildTimer = undefined;
      }
      rebuild();
      return;
    }
    if (rebuildTimer !== undefined) return;
    rebuildTimer = setTimeout(() => {
      rebuildTimer = undefined;
      rebuild();
    }, REBUILD_MIN_INTERVAL - elapsed);
  }

  /**
   * The page webfonts never feed the canvas (it measures the system mono stack
   * from CSS), so a font event only rebuilds when the metrics it reads really
   * changed; otherwise that would be a second full paint for nothing.
   */
  function rebuildIfMetricsChanged() {
    if (stopped || firstPaintPending) return;
    const next = readStyle();
    const unchanged =
      next.font === canvasStyle.font &&
      next.lineHeight === canvasStyle.lineHeight &&
      next.letterSpacing === canvasStyle.letterSpacing &&
      next.columnGap === canvasStyle.columnGap &&
      next.rowGap === canvasStyle.rowGap;
    if (!unchanged) scheduleRebuild();
  }

  /** CSS px inside the canvas, following the drift transform. */
  function canvasPoint(clientX: number, clientY: number): { x: number; y: number } | null {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * width,
      y: ((clientY - rect.top) / rect.height) * height,
    };
  }

  function onPointerMove(event: PointerEvent) {
    if (stopped || reducedMotion || event.pointerType !== 'mouse') return;
    const point = canvasPoint(event.clientX, event.clientY);
    if (!point) return;
    pending = point;
    requestFrame();
  }

  function onPointerLeave() {
    pending = null;
  }

  function onPointerDown(event: PointerEvent) {
    if (stopped || reducedMotion) return;
    const target = event.target as Element | null;
    if (target?.closest('a, button')) return;
    const point = canvasPoint(event.clientX, event.clientY);
    if (!point) return;
    addPing(point.x, point.y, performance.now());
    requestFrame();
  }

  /** Easter egg: three rings sweep the grid when the Konami code lands. */
  function onKonami() {
    if (stopped || reducedMotion) return;
    const now = performance.now();
    for (let index = 0; index < PING_MAX_ACTIVE; index += 1) {
      addPing(width * (0.5 + (index - 1) * 0.18), height * 0.5, now + index * 110);
    }
    requestFrame();
  }

  function setMotionState() {
    const active = visible && !document.hidden;
    if (drift) drift.style.animationPlayState = active ? 'running' : 'paused';
  }

  function onReducedMotionChange() {
    reducedMotion = prefersReducedMotion();
    samples.length = 0;
    pings.length = 0;
    trail = null;
    hot = new Set();
    if (!reducedMotion) {
      scheduleRebuild();
      return;
    }
    paintBase();
  }

  function onVisibilityChange() {
    setMotionState();
    if (document.hidden || reducedMotion) return;
    hot = new Set();
    samples.length = 0;
    pings.length = 0;
    trail = null;
    paintBase();
    requestFrame();
  }

  const resizeObserver =
    typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleRebuild) : null;
  resizeObserver?.observe(canvas);
  if (!resizeObserver) window.addEventListener('resize', scheduleRebuild);

  const intersectionObserver =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
          (entries) => {
            visible = entries.some((entry) => entry.isIntersecting);
            setMotionState();
            if (visible) requestFrame();
          },
          { threshold: 0 },
        )
      : null;
  intersectionObserver?.observe(root);

  const themeObserver =
    typeof MutationObserver !== 'undefined' ? new MutationObserver(scheduleRebuild) : null;
  themeObserver?.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  reducedMotionQuery?.addEventListener('change', onReducedMotionChange);
  schemeQuery?.addEventListener('change', scheduleRebuild);
  window.addEventListener(KONAMI_EVENT, onKonami);
  document.addEventListener('visibilitychange', onVisibilityChange);
  document.fonts?.addEventListener('loadingdone', rebuildIfMetricsChanged);
  root.addEventListener('pointermove', onPointerMove, { passive: true });
  root.addEventListener('pointerdown', onPointerDown, { passive: true });
  root.addEventListener('pointerleave', onPointerLeave, { passive: true });

  scheduleFirstPaint();

  return () => {
    stopped = true;
    cancelAnimationFrame(rafId);
    if (rebuildTimer !== undefined) clearTimeout(rebuildTimer);
    if (firstPaintTimer !== undefined) clearTimeout(firstPaintTimer);
    if (firstPaintIdle !== undefined && typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(firstPaintIdle);
    }
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    themeObserver?.disconnect();
    reducedMotionQuery?.removeEventListener('change', onReducedMotionChange);
    schemeQuery?.removeEventListener('change', scheduleRebuild);
    window.removeEventListener(KONAMI_EVENT, onKonami);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    document.fonts?.removeEventListener('loadingdone', rebuildIfMetricsChanged);
    root.removeEventListener('pointermove', onPointerMove);
    root.removeEventListener('pointerdown', onPointerDown);
    root.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('resize', scheduleRebuild);
    drift?.style.removeProperty('animation-play-state');
  };
}

/** CSS supplies the touch halos even without JS. Allocate the two canvas
 * buffers only when the primary input supports the interactive label field. */
export function initHeroBackdrop(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  options: HeroBackdropOptions = {},
): () => void {
  const touchQuery = window.matchMedia('(hover: none), (pointer: coarse)');
  let cleanupLabels: (() => void) | undefined;
  let visible = true;

  function syncInput() {
    if (touchQuery.matches) {
      cleanupLabels?.();
      cleanupLabels = undefined;
      // Release an existing bitmap when the input changes to touch.
      canvas.width = 300;
      canvas.height = 150;
      delete canvas.dataset.ready;
    } else {
      cleanupLabels ??= initLabelBackdrop(root, canvas, options);
    }
  }

  function syncVisibility() {
    root.toggleAttribute('data-hero-paused', !visible || document.hidden);
  }

  const observer =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver((entries) => {
          visible = entries.some((entry) => entry.isIntersecting);
          syncVisibility();
        })
      : null;
  observer?.observe(root);
  touchQuery.addEventListener('change', syncInput);
  document.addEventListener('visibilitychange', syncVisibility);
  syncVisibility();
  syncInput();

  return () => {
    cleanupLabels?.();
    observer?.disconnect();
    touchQuery.removeEventListener('change', syncInput);
    document.removeEventListener('visibilitychange', syncVisibility);
    root.removeAttribute('data-hero-paused');
  };
}
