import { easeOutCubic, formatNumber } from '../lib/format';
import { prefersReducedMotion } from './scroll-utils';

export interface CounterOptions {
  duration?: number;
  threshold?: number;
  locale?: string;
  reducedMotion?: boolean;
}

/**
 * Animate elements marked with `data-count-to` / `data-count-decimals` from 0 to
 * their target value when they scroll into view. Uses the document language for
 * locale-aware formatting (`4.23` in EN vs `4,23` in ES).
 *
 * Returns a cleanup function that disconnects the observer.
 */
export function initCounters(options: CounterOptions = {}): () => void {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-count-to]'));
  if (nodes.length === 0) return () => {};

  const locale = options.locale ?? (document.documentElement.lang === 'es' ? 'es-ES' : 'en-US');
  const duration = options.duration ?? 1600;
  const threshold = options.threshold ?? 0.4;
  const reducedMotion = options.reducedMotion ?? prefersReducedMotion();

  const frames = new Set<number>();
  const scheduleFrame = (callback: FrameRequestCallback) => {
    const id = requestAnimationFrame((now) => {
      frames.delete(id);
      callback(now);
    });
    frames.add(id);
  };

  function animate(element: HTMLElement) {
    const target = Number.parseFloat(element.dataset.countTo ?? '0');
    const decimals = Number.parseInt(element.dataset.countDecimals ?? '0', 10);
    if (!Number.isFinite(target) || reducedMotion) {
      element.textContent = formatNumber(target || 0, decimals, locale);
      return;
    }
    const started = performance.now();
    const frame = (now: number) => {
      const progress = Math.min((now - started) / duration, 1);
      element.textContent = formatNumber(target * easeOutCubic(progress), decimals, locale);
      if (progress < 1) {
        scheduleFrame(frame);
      } else {
        element.textContent = formatNumber(target, decimals, locale);
      }
    };
    scheduleFrame(frame);
  }

  const cancelPendingFrames = () => {
    if (typeof cancelAnimationFrame === 'function') {
      for (const id of frames) cancelAnimationFrame(id);
    }
    frames.clear();
  };

  if (typeof IntersectionObserver === 'undefined') {
    nodes.forEach(animate);
    return cancelPendingFrames;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        animate(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      }
    },
    { threshold },
  );
  nodes.forEach((node) => observer.observe(node));
  return () => {
    observer.disconnect();
    cancelPendingFrames();
  };
}
