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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Paints the automatic-style progress as a quiet ASCII field on the viewport
 * edges. The controller in style.ts supplies the progress ratio and pause state
 * through CSS variables, data attributes and a custom event.
 */
export function initStyleProgressBackdrop(): () => void {
  const root = document.querySelector<HTMLElement>('[data-style-progress]');
  const canvas = root?.querySelector<HTMLCanvasElement>('[data-style-progress-canvas]');
  if (!root || !canvas) return () => {};
  const progressRoot = root;
  const progressCanvas = canvas;

  const context = progressCanvas.getContext('2d');
  if (!context) return () => {};
  const drawingContext = context;

  let width = 1;
  let height = 1;
  let dpr = 1;
  let tokens: AsciiToken[] = [];
  let animationFrame = 0;
  let stopped = false;
  let visible = true;
  let reducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // A private deterministic generator keeps visual references stable even when
  // tests or other page effects replace Math.random.
  let seed = 0x6d2b79f5;
  const random = () => {
    seed = Math.imul(seed ^ (seed >>> 15), seed | 1);
    seed ^= seed + Math.imul(seed ^ (seed >>> 7), seed | 61);
    return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
  };

  function progressRatio(): number {
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
    const rect = progressCanvas.getBoundingClientRect();
    width = Math.max(1, rect.width || window.innerWidth);
    height = Math.max(1, rect.height || window.innerHeight);
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    progressCanvas.width = Math.round(width * dpr);
    progressCanvas.height = Math.round(height * dpr);
    drawingContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildTokens();
    draw(performance.now());
  }

  function draw(now: number): void {
    if (stopped || !visible) return;
    const ratio = progressRatio();
    const paused = progressRoot.dataset.styleProgressState === 'paused';
    const computed = getComputedStyle(progressRoot);
    drawingContext.clearRect(0, 0, width, height);
    drawingContext.font = `${computed.fontSize || '12px'} ${computed.fontFamily || 'monospace'}`;
    drawingContext.textBaseline = 'middle';
    drawingContext.fillStyle = computed.color || 'currentColor';

    for (const token of tokens) {
      const reveal = clamp((ratio - token.threshold) * 8, 0, 1);
      if (reveal <= 0) continue;
      const shimmer =
        reducedMotion || paused ? 1 : 0.78 + Math.sin(now / 1300 + token.phase) * 0.22;
      drawingContext.globalAlpha = token.opacity * reveal * shimmer;
      drawingContext.font = `${token.size}px ${computed.fontFamily || 'monospace'}`;
      drawingContext.fillText(token.symbol, token.x, token.y);
    }
    drawingContext.globalAlpha = 1;

    if (!reducedMotion && !paused && ratio < 1) animationFrame = requestAnimationFrame(draw);
    else animationFrame = 0;
  }

  function scheduleDraw(): void {
    if (animationFrame || stopped || !visible) return;
    animationFrame = requestAnimationFrame(draw);
  }

  function onProgressChange(): void {
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
  resizeObserver?.observe(progressCanvas);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-style', 'data-theme'],
  });
  resize();
  onProgressChange();

  return () => {
    stopped = true;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    progressRoot.removeEventListener('styleprogresschange', onProgressChange);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('resize', resize);
    resizeObserver?.disconnect();
    themeObserver.disconnect();
  };
}
