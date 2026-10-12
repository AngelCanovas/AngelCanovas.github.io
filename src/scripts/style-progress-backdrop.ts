interface AsciiToken {
  x: number;
  y: number;
  threshold: number;
  size: number;
  opacity: number;
  symbol: string;
  phase: number;
}

const ASCII = '{}[]<>/\\|:;.+*01~_';
const TOKEN_COUNT = 180;
const MAX_DPR = 1.5;
const PIPE_ROWS = 10;
const PIPE_WIDTH = 48;
const PIPE_HEIGHT = 150;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Paints the automatic-style progress as a quiet ASCII field on the viewport
 * edges plus a visible vertical character pipe above the scroll control.
 */
export function initStyleProgressBackdrop(): () => void {
  const root = document.querySelector<HTMLElement>('[data-style-progress]');
  const backgroundCanvas = root?.querySelector<HTMLCanvasElement>('[data-style-progress-canvas]');
  const tubeCanvas = root?.querySelector<HTMLCanvasElement>('[data-style-progress-tube-canvas]');
  if (!root || !backgroundCanvas || !tubeCanvas) return () => {};
  const progressRoot = root;
  const progressBackgroundCanvas = backgroundCanvas;
  const progressTubeCanvas = tubeCanvas;
  const backgroundContext = progressBackgroundCanvas.getContext('2d');
  const tubeContext = progressTubeCanvas.getContext('2d');
  if (!backgroundContext || !tubeContext) return () => {};
  const drawingBackgroundContext = backgroundContext;
  const drawingTubeContext = tubeContext;

  let width = 1;
  let height = 1;
  let dpr = 1;
  let tubeWidth = PIPE_WIDTH;
  let tubeHeight = PIPE_HEIGHT;
  let tokens: AsciiToken[] = [];
  let animationFrame = 0;
  let completionTimer: number | undefined;
  let completionUntil = 0;
  let stopped = false;
  let visible = true;
  let reducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Deterministic by design: visual references must not depend on Math.random.
  let seed = 0x6d2b79f5;
  const random = () => {
    seed = Math.imul(seed ^ (seed >>> 15), seed | 1);
    seed ^= seed + Math.imul(seed ^ (seed >>> 7), seed | 61);
    return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
  };

  function progressRatio(): number {
    if (performance.now() < completionUntil) return 1;
    const value = Number.parseFloat(progressRoot.style.getPropertyValue('--style-progress-ratio'));
    return Number.isFinite(value) ? clamp(value, 0, 1) : 0;
  }

  function buildTokens(): void {
    seed = 0x6d2b79f5;
    const edge = Math.min(280, width * 0.2);
    tokens = Array.from({ length: TOKEN_COUNT }, (_, index) => {
      const left = index % 2 === 0;
      return {
        x: left ? random() * edge : width - edge + random() * edge,
        y: random() * height,
        threshold: random(),
        size: 9 + random() * 5,
        opacity: 0.045 + random() * 0.08,
        symbol: ASCII[Math.floor(random() * ASCII.length)] ?? '.',
        phase: random() * Math.PI * 2,
      };
    });
  }

  function resize(): void {
    const backgroundRect = progressBackgroundCanvas.getBoundingClientRect();
    width = Math.max(1, backgroundRect.width || window.innerWidth);
    height = Math.max(1, backgroundRect.height || window.innerHeight);
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    progressBackgroundCanvas.width = Math.round(width * dpr);
    progressBackgroundCanvas.height = Math.round(height * dpr);
    drawingBackgroundContext.setTransform(dpr, 0, 0, dpr, 0, 0);

    const tubeRect = progressTubeCanvas.getBoundingClientRect();
    tubeWidth = Math.max(1, tubeRect.width || PIPE_WIDTH);
    tubeHeight = Math.max(1, tubeRect.height || PIPE_HEIGHT);
    progressTubeCanvas.width = Math.round(tubeWidth * dpr);
    progressTubeCanvas.height = Math.round(tubeHeight * dpr);
    drawingTubeContext.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildTokens();
    draw(performance.now());
  }

  function drawTube(): void {
    const ratio = progressRatio();
    const paused = progressRoot.dataset.styleProgressState === 'paused';
    const computed = getComputedStyle(progressRoot);
    const tubeComputed = getComputedStyle(progressTubeCanvas);
    const fontFamily = tubeComputed.fontFamily || 'monospace';
    const ink = tubeComputed.color || computed.color || 'currentColor';
    const rowHeight = Math.max(10, Math.floor((tubeHeight - 34) / PIPE_ROWS));
    const filledRows = Math.ceil(ratio * PIPE_ROWS);
    const pipeSymbols = '{}[]<>/\\|:;.+*01~_';

    drawingTubeContext.clearRect(0, 0, tubeWidth, tubeHeight);
    drawingTubeContext.font = `12px ${fontFamily}`;
    drawingTubeContext.textAlign = 'center';
    drawingTubeContext.textBaseline = 'middle';
    drawingTubeContext.fillStyle = ink;
    drawingTubeContext.globalAlpha = 0.92;

    const center = tubeWidth / 2;
    drawingTubeContext.fillText('┌────┐', center, 8);
    for (let row = 0; row < PIPE_ROWS; row += 1) {
      const y = 20 + row * rowHeight;
      const filled = row >= PIPE_ROWS - filledRows;
      const first = pipeSymbols[(row * 3) % pipeSymbols.length] ?? '.';
      const second = pipeSymbols[(row * 3 + 1) % pipeSymbols.length] ?? '.';
      const third = pipeSymbols[(row * 3 + 2) % pipeSymbols.length] ?? '.';
      const payload = filled ? `${first}${second}${third}` : '   ';
      drawingTubeContext.fillText(`│${payload}│`, center, y);
    }
    drawingTubeContext.fillText(
      '└────┘',
      center,
      Math.min(tubeHeight - 7, 20 + PIPE_ROWS * rowHeight),
    );

    if (paused) {
      drawingTubeContext.globalAlpha = 0.95;
      drawingTubeContext.font = `10px ${fontFamily}`;
      drawingTubeContext.fillText('||', center, tubeHeight - 1);
    }
    drawingTubeContext.globalAlpha = 1;
  }

  function draw(now: number): void {
    if (stopped || !visible) return;
    const ratio = progressRatio();
    const paused = progressRoot.dataset.styleProgressState === 'paused';
    const computed = getComputedStyle(progressRoot);
    drawingBackgroundContext.clearRect(0, 0, width, height);
    drawingBackgroundContext.textBaseline = 'middle';
    drawingBackgroundContext.fillStyle = computed.color || 'currentColor';

    for (const token of tokens) {
      const reveal = clamp((ratio - token.threshold) * 8, 0, 1);
      if (reveal <= 0) continue;
      const shimmer =
        reducedMotion || paused ? 1 : 0.78 + Math.sin(now / 1300 + token.phase) * 0.22;
      drawingBackgroundContext.globalAlpha = token.opacity * reveal * shimmer;
      drawingBackgroundContext.font = `${token.size}px ${computed.fontFamily || 'monospace'}`;
      drawingBackgroundContext.fillText(token.symbol, token.x, token.y);
    }
    drawingBackgroundContext.globalAlpha = 1;
    drawTube();

    if (!reducedMotion && !paused && ratio < 1) animationFrame = requestAnimationFrame(draw);
    else animationFrame = 0;
  }

  function scheduleDraw(): void {
    if (animationFrame || stopped || !visible) return;
    animationFrame = requestAnimationFrame(draw);
  }

  function onProgressChange(event?: Event): void {
    const detail = event ? (event as CustomEvent<{ complete?: boolean }>).detail : undefined;
    if (detail?.complete) {
      completionUntil = performance.now() + 720;
      if (completionTimer !== undefined) window.clearTimeout(completionTimer);
      completionTimer = window.setTimeout(() => {
        completionUntil = 0;
        completionTimer = undefined;
        onProgressChange(new Event('styleprogresschange'));
      }, 720);
    }
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    draw(performance.now());
    scheduleDraw();
  }

  function onVisibilityChange(): void {
    visible = !document.hidden;
    if (visible) {
      resize();
      scheduleDraw();
    } else if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  }

  const reducedMotionQuery =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
  const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  const themeObserver = new MutationObserver(() => {
    resize();
    scheduleDraw();
  });

  progressRoot.addEventListener('styleprogresschange', onProgressChange);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('resize', resize);
  reducedMotionQuery?.addEventListener('change', (event) => {
    reducedMotion = event.matches;
    onProgressChange();
  });
  resizeObserver?.observe(progressBackgroundCanvas);
  resizeObserver?.observe(progressTubeCanvas);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-style', 'data-theme'],
  });
  resize();
  onProgressChange();

  return () => {
    stopped = true;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (completionTimer !== undefined) window.clearTimeout(completionTimer);
    progressRoot.removeEventListener('styleprogresschange', onProgressChange);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('resize', resize);
    resizeObserver?.disconnect();
    themeObserver.disconnect();
  };
}
