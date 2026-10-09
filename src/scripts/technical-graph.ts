export function initTechnicalGraph(): void {
  const hero = document.getElementById('hero');
  const graph = document.querySelector<SVGElement>('[data-technical-graph]');
  if (!hero || !graph) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0;
  let x = 0;
  let y = 0;
  let intersecting = true;
  let hidden = document.hidden;
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
  const syncPaused = () => {
    const paused = hidden || !intersecting;
    graph.classList.toggle('graph-paused', paused);
    if (paused) reset();
  };
  const observer = new IntersectionObserver(([entry]) => {
    intersecting = entry?.isIntersecting ?? false;
    syncPaused();
  });
  observer.observe(hero);
  const onVisibilityChange = () => {
    hidden = document.hidden;
    syncPaused();
  };
  const onPageShow = () => {
    hidden = document.hidden;
    observer.observe(hero);
    syncPaused();
  };
  const onPageHide = (event: PageTransitionEvent) => {
    reset();
    observer.disconnect();
    if (!event.persisted) {
      hero.removeEventListener('pointerleave', reset);
      motion.removeEventListener('change', reset);
      pointer.removeEventListener('change', reset);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pageshow', onPageShow);
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pageshow', onPageShow);
  window.addEventListener('pagehide', onPageHide);
}
