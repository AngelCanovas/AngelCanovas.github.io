import { KONAMI_EVENT } from '../lib/konami';
import { scheduleHeroFirstPaint } from './hero-first-paint';

export function initHeroBackdrop(root: HTMLElement, canvas: HTMLCanvasElement): () => void {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return () => {};
  const inkContext = context;
  const touch = window.matchMedia('(hover: none), (pointer: coarse)');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scheme = window.matchMedia('(prefers-color-scheme: dark)');
  let width = 1;
  let height = 1;
  let visible = true;
  let frame = 0;
  let stopped = false;
  let pointer: { x: number; y: number } | null = null;
  let pulse = 0;
  let expiry: ReturnType<typeof setTimeout> | undefined;

  function paint() {
    frame = 0;
    if (stopped || touch.matches) return;
    const css = getComputedStyle(canvas);
    inkContext.clearRect(0, 0, width, height);
    inkContext.lineWidth = 1;
    for (let line = 0; line < 38; line += 1) {
      inkContext.beginPath();
      inkContext.strokeStyle = line % 7 === 0 ? css.outlineColor : css.color;
      inkContext.globalAlpha = line % 7 === 0 ? 0.55 : 0.25;
      for (let step = 0; step <= 80; step += 1) {
        const y = (step / 80) * height;
        const wave = Math.sin((y / height) * Math.PI * 1.5 + line * 0.065);
        let x = width * 0.57 + line * width * 0.012 + wave * width * 0.18;
        if (pointer && !motion.matches) {
          const distance = Math.hypot(x - pointer.x, y - pointer.y);
          x += Math.exp((-distance * distance) / 26000) * (pulse ? 32 : 18);
        }
        if (step === 0) inkContext.moveTo(x, y);
        else inkContext.lineTo(x, y);
      }
      inkContext.stroke();
    }
    inkContext.globalAlpha = 1;
    canvas.dataset.ready = 'true';
  }

  function schedule() {
    if (!frame && !stopped && visible && !document.hidden && !touch.matches)
      frame = requestAnimationFrame(paint);
  }

  function rebuild() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (touch.matches) {
      canvas.width = 300;
      canvas.height = 150;
      delete canvas.dataset.ready;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    inkContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    pointer = null;
    pulse = 0;
    paint();
  }

  function reset() {
    clearTimeout(expiry);
    pointer = null;
    pulse = 0;
    schedule();
  }

  function move(event: PointerEvent) {
    if (
      motion.matches ||
      touch.matches ||
      event.pointerType === 'touch' ||
      !visible ||
      document.hidden
    )
      return;
    const rect = canvas.getBoundingClientRect();
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    clearTimeout(expiry);
    expiry = setTimeout(reset, 1000);
    schedule();
  }

  function click(event: PointerEvent) {
    move(event);
    if (pointer) pulse = 1;
  }

  function konami() {
    if (motion.matches || touch.matches || !visible || document.hidden) return;
    pointer = { x: width * 0.75, y: height * 0.5 };
    pulse = 1;
    clearTimeout(expiry);
    expiry = setTimeout(reset, 1000);
    schedule();
  }

  function syncVisibility() {
    root.toggleAttribute('data-hero-paused', !visible || document.hidden);
    if (!visible || document.hidden) {
      clearTimeout(expiry);
      pointer = null;
      pulse = 0;
      cancelAnimationFrame(frame);
      frame = 0;
    } else schedule();
  }

  const intersection = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    syncVisibility();
  });
  intersection.observe(root);
  const resize = new ResizeObserver(rebuild);
  resize.observe(root);
  const theme = new MutationObserver(rebuild);
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  touch.addEventListener('change', rebuild);
  motion.addEventListener('change', rebuild);
  scheme.addEventListener('change', rebuild);
  document.addEventListener('visibilitychange', syncVisibility);
  root.addEventListener('pointermove', move, { passive: true });
  root.addEventListener('pointerdown', click, { passive: true });
  root.addEventListener('pointerleave', reset);
  window.addEventListener(KONAMI_EVENT, konami);
  const cancelFirstPaint = scheduleHeroFirstPaint(rebuild);

  return () => {
    stopped = true;
    cancelFirstPaint();
    cancelAnimationFrame(frame);
    clearTimeout(expiry);
    intersection.disconnect();
    resize.disconnect();
    theme.disconnect();
    touch.removeEventListener('change', rebuild);
    motion.removeEventListener('change', rebuild);
    scheme.removeEventListener('change', rebuild);
    document.removeEventListener('visibilitychange', syncVisibility);
    root.removeEventListener('pointermove', move);
    root.removeEventListener('pointerdown', click);
    root.removeEventListener('pointerleave', reset);
    window.removeEventListener(KONAMI_EVENT, konami);
    root.removeAttribute('data-hero-paused');
  };
}
