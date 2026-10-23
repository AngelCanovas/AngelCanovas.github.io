type Renderer = (root: HTMLElement, canvas: HTMLCanvasElement) => () => void;

export function initHeroBackdropController(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
): () => void {
  let cleanup = () => {};
  let activeStyle = '';
  let generation = 0;

  const syncBackdrop = () => {
    const style = document.documentElement.dataset.style ?? 'technical';
    if (style === activeStyle) return;
    const request = ++generation;
    cleanup();
    cleanup = () => {};
    activeStyle = style;
    delete canvas.dataset.ready;
    root.dataset.heroBackdropMode =
      style === 'original' ? 'code' : style === 'editorial' ? 'waves' : 'none';

    const activate = (initialize: Renderer) => {
      if (request === generation) cleanup = initialize(root, canvas);
    };
    if (style === 'original') {
      void import('./hero-code-backdrop')
        .then((module) => activate(module.initHeroCodeBackdrop))
        .catch((error) => console.error('[init]', error));
    } else if (style === 'editorial') {
      void import('./hero-backdrop')
        .then((module) => activate(module.initHeroBackdrop))
        .catch((error) => console.error('[init]', error));
    } else {
      canvas.width = 300;
      canvas.height = 150;
      if (window.matchMedia('(hover: none), (pointer: coarse)').matches)
        delete canvas.dataset.ready;
      else canvas.dataset.ready = 'true';
    }
  };

  const observer = new MutationObserver(syncBackdrop);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-style'],
  });
  syncBackdrop();

  return () => {
    generation += 1;
    observer.disconnect();
    cleanup();
    cleanup = () => {};
  };
}
