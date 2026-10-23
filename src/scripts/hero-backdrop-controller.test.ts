// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

let cleanup: (() => void) | undefined;

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  document.body.innerHTML = '<section id="hero"><canvas id="hero-canvas"></canvas></section>';
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.doUnmock('./hero-code-backdrop');
  vi.doUnmock('./hero-backdrop');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function mount(style: string) {
  const { initHeroBackdropController } = await import('./hero-backdrop-controller');
  document.documentElement.dataset.style = style;
  const root = document.getElementById('hero')!;
  const canvas = document.querySelector<HTMLCanvasElement>('canvas')!;
  canvas.dataset.ready = 'true';
  cleanup = initHeroBackdropController(root, canvas);
  return { root, canvas };
}

it('does not load either renderer for technical or noir styles', async () => {
  const code = vi.fn(() => ({}));
  const waves = vi.fn(() => ({}));
  vi.doMock('./hero-code-backdrop', code);
  vi.doMock('./hero-backdrop', waves);
  const { root, canvas } = await mount('technical');
  await vi.dynamicImportSettled();
  expect(root.dataset.heroBackdropMode).toBe('none');
  expect(canvas.dataset.ready).toBe('true');
  expect([canvas.width, canvas.height]).toEqual([300, 150]);
  document.documentElement.dataset.style = 'noir';
  await Promise.resolve();
  await vi.dynamicImportSettled();
  expect(code).not.toHaveBeenCalled();
  expect(waves).not.toHaveBeenCalled();
});

it('only loads the requested renderer and waits for it to paint readiness', async () => {
  const dispose = vi.fn();
  const code = vi.fn(() => dispose);
  const waves = vi.fn(() => ({}));
  vi.doMock('./hero-code-backdrop', () => ({ initHeroCodeBackdrop: code }));
  vi.doMock('./hero-backdrop', waves);
  const { root, canvas } = await mount('original');
  expect(root.dataset.heroBackdropMode).toBe('code');
  expect(canvas.dataset.ready).toBeUndefined();
  await vi.dynamicImportSettled();
  expect(code).toHaveBeenCalledExactlyOnceWith(root, canvas);
  expect(waves).not.toHaveBeenCalled();
  expect(canvas.dataset.ready).toBeUndefined();
  cleanup?.();
  cleanup = undefined;
  expect(dispose).toHaveBeenCalledOnce();
});

it('ignores an old pending import and cleans the current renderer only once', async () => {
  const pending = Promise.withResolvers<{ initHeroCodeBackdrop: () => () => void }>();
  const code = vi.fn(() => vi.fn());
  const disposeWaves = vi.fn();
  const waves = vi.fn(() => disposeWaves);
  vi.doMock('./hero-code-backdrop', () => pending.promise);
  vi.doMock('./hero-backdrop', () => ({ initHeroBackdrop: waves }));
  const { root, canvas } = await mount('original');
  document.documentElement.dataset.style = 'editorial';
  await vi.waitFor(() => expect(waves).toHaveBeenCalledExactlyOnceWith(root, canvas));
  pending.resolve({ initHeroCodeBackdrop: code });
  await vi.dynamicImportSettled();
  expect(code).not.toHaveBeenCalled();
  expect(root.dataset.heroBackdropMode).toBe('waves');
  document.documentElement.dataset.style = 'technical';
  await Promise.resolve();
  expect(disposeWaves).toHaveBeenCalledOnce();
  cleanup?.();
  cleanup = undefined;
  expect(disposeWaves).toHaveBeenCalledOnce();
});

it('invalidates pending imports and observations on cleanup', async () => {
  const pending = Promise.withResolvers<{ initHeroCodeBackdrop: () => () => void }>();
  const code = vi.fn(() => vi.fn());
  const waves = vi.fn(() => ({}));
  vi.doMock('./hero-code-backdrop', () => pending.promise);
  vi.doMock('./hero-backdrop', waves);
  await mount('original');
  cleanup?.();
  cleanup = undefined;
  document.documentElement.dataset.style = 'editorial';
  pending.resolve({ initHeroCodeBackdrop: code });
  await vi.dynamicImportSettled();
  expect(code).not.toHaveBeenCalled();
  expect(waves).not.toHaveBeenCalled();
});

it.each(['import', 'initialize'])(
  'handles %s failures without blocking later styles',
  async (step) => {
    const error = new Error('renderer unavailable');
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const waves = vi.fn(() => vi.fn());
    vi.doMock('./hero-code-backdrop', () => {
      if (step === 'import') throw error;
      return {
        initHeroCodeBackdrop: () => {
          throw error;
        },
      };
    });
    vi.doMock('./hero-backdrop', () => ({ initHeroBackdrop: waves }));
    const { root, canvas } = await mount('original');
    await vi.waitFor(() => expect(logged).toHaveBeenCalledWith('[init]', expect.any(Error)));
    document.documentElement.dataset.style = 'editorial';
    await vi.waitFor(() => expect(waves).toHaveBeenCalledExactlyOnceWith(root, canvas));
  },
);
