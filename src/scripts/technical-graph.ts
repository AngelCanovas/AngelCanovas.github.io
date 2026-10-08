export function initTechnicalGraph(): void {
  const hero = document.getElementById('hero');
  const graph = document.querySelector<SVGElement>('[data-technical-graph]');
  if (!hero || !graph) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0;
  let x = 0;
  let y = 0;
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    graph.style.removeProperty('--graph-x');
    graph.style.removeProperty('--graph-y');
    delete graph.dataset.pointer;
  };
  hero.addEventListener(
    'pointermove',
    (event) => {
      if (
        event.pointerType === 'touch' ||
        motion.matches ||
        !pointer.matches ||
        document.documentElement.dataset.style !== 'technical'
      )
        return;
      const bounds = hero.getBoundingClientRect();
      x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 24;
      y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 24;
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          graph.style.setProperty('--graph-x', `${x.toFixed(2)}px`);
          graph.style.setProperty('--graph-y', `${y.toFixed(2)}px`);
          graph.dataset.pointer = 'active';
        });
    },
    { passive: true },
  );
  hero.addEventListener('pointerleave', reset);
  motion.addEventListener('change', reset);
  pointer.addEventListener('change', reset);
  const observer = new IntersectionObserver(([entry]) => {
    graph.classList.toggle('graph-paused', !entry.isIntersecting);
    if (!entry.isIntersecting) reset();
  });
  observer.observe(hero);
  document.addEventListener('visibilitychange', () => {
    graph.classList.toggle('graph-paused', document.hidden);
    if (document.hidden) reset();
  });
  window.addEventListener(
    'pagehide',
    () => {
      reset();
      observer.disconnect();
    },
    { once: true },
  );
}
