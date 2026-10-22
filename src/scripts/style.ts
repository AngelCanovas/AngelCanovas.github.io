export const STYLES = ['original', 'editorial', 'technical', 'noir'] as const;
export const STYLE_KEY = 'page-style';
/** Wait between automatic style changes. */
export const STYLE_AUTO_INTERVAL_MS = 30_000;
/** The progress indicator warns this long before the automatic change. */
export const STYLE_PROGRESS_WARNING_MS = 5_000;
export type PageStyle = (typeof STYLES)[number];

/** Length of the colour wash; the scroll guard stays alive a little longer. */
const STYLE_TRANSITION_MS = 700;
/** Gestures that mean the visitor has taken the scroll back while a change settles. */
const SCROLL_GESTURES: ReadonlyArray<[keyof WindowEventMap, AddEventListenerOptions]> = [
  ['wheel', { passive: true, capture: true }],
  ['touchmove', { passive: true, capture: true }],
  ['pointerdown', { capture: true }],
  ['keydown', {}],
];

export function resolveStyle(value: string | null | undefined): PageStyle {
  return STYLES.find((style) => style === value) ?? 'technical';
}

export function randomStyle(random: () => number = Math.random): PageStyle {
  const index = Math.min(STYLES.length - 1, Math.floor(random() * STYLES.length));
  return STYLES[index] ?? STYLES[0];
}

export function initStyleToggle(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-style-toggle]');
  if (!button || button.dataset.initialized) return;
  button.dataset.initialized = 'true';

  let style = resolveStyle(document.documentElement.dataset.style);
  let paused = false;
  let transitionTimer: number | undefined;
  const restartProgressRef: { current?: () => void } = {};
  const nextStyle = (): PageStyle => {
    const index = (STYLES.indexOf(style) + 1) % STYLES.length;
    return STYLES[index] ?? STYLES[0];
  };
  const triggerStyleTransition = () => {
    if (transitionTimer !== undefined) window.clearTimeout(transitionTimer);
    document.documentElement.dataset.styleTransition = 'true';
    document.documentElement.dispatchEvent(new CustomEvent('styletransitionchange'));
    transitionTimer = window.setTimeout(() => {
      delete document.documentElement.dataset.styleTransition;
      transitionTimer = undefined;
    }, STYLE_TRANSITION_MS);
  };
  const apply = (withTransition = false) => {
    document.documentElement.dataset.style = style;
    button.dataset.style = style;
    const next = nextStyle();
    const styleLabel = button.dataset[`label${style[0].toUpperCase()}${style.slice(1)}`] ?? style;
    const nextLabel = button.dataset[`label${next[0].toUpperCase()}${next.slice(1)}`] ?? next;
    const label = `${styleLabel}. ${nextLabel}`;
    button.setAttribute('aria-label', label);
    button.title = label;
    if (withTransition) triggerStyleTransition();
  };
  /**
   * Every style rewrites the page geometry, so a change can leave the document
   * at another offset. The reading position wins: it is captured, the change is
   * applied and the viewport is put back once the layout settled, unless the
   * visitor is scrolling themselves.
   */
  const preserveViewport = (change: () => void) => {
    const left = window.scrollX;
    const top = window.scrollY;
    let visitorDriving = false;
    const markVisitorDriving = () => {
      visitorDriving = true;
    };
    const restore = () => {
      if (!visitorDriving && (window.scrollX !== left || window.scrollY !== top)) {
        window.scrollTo({ left, top, behavior: 'instant' });
      }
    };
    for (const [type, options] of SCROLL_GESTURES) {
      window.addEventListener(type, markVisitorDriving, options);
    }
    change();
    restore();
    requestAnimationFrame(restore);
    window.setTimeout(() => {
      restore();
      for (const [type, options] of SCROLL_GESTURES) {
        window.removeEventListener(type, markVisitorDriving, options);
      }
    }, STYLE_TRANSITION_MS + 250);
  };
  const cycleManually = () => {
    style = nextStyle();
    preserveViewport(() => apply(true));
    // Manual changes reset an active countdown but never unfreeze a paused one.
    if (!paused) restartProgressRef.current?.();
  };

  apply();
  button.addEventListener('click', cycleManually);

  const progressElements = Array.from(
    document.querySelectorAll<HTMLElement>('[data-style-progress]'),
  );
  if (progressElements.length === 0) return;

  const progressControls = progressElements.map((element) =>
    element.querySelector<HTMLElement>('[data-style-progress-control]'),
  );
  const progressTracks = progressElements.map((element) =>
    element.querySelector<HTMLElement>('[data-style-progress-track]'),
  );

  let timer: number | undefined;
  let progressTicker: number | undefined;
  let remaining = STYLE_AUTO_INTERVAL_MS;
  let startedAt = Date.now();
  const runningLabel =
    progressElements.find((element) => element.dataset.labelRunning)?.dataset.labelRunning ??
    'Pause automatic style changes';
  const pausedLabel =
    progressElements.find((element) => element.dataset.labelPaused)?.dataset.labelPaused ??
    'Resume automatic style changes';
  const progressUpdateMs = 250;

  const clearScheduledWork = () => {
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
    if (progressTicker !== undefined) {
      window.clearInterval(progressTicker);
      progressTicker = undefined;
    }
  };

  const readRemaining = () => Math.max(0, STYLE_AUTO_INTERVAL_MS - (Date.now() - startedAt));

  const updateProgressA11y = () => {
    if (!paused) remaining = readRemaining();
    const percent = Math.max(
      0,
      Math.min(100, Math.round((1 - remaining / STYLE_AUTO_INTERVAL_MS) * 100)),
    );
    const warning = !paused && remaining <= STYLE_PROGRESS_WARNING_MS;
    const label = paused
      ? pausedLabel
      : `${runningLabel} (${Math.max(1, Math.ceil(remaining / 1000))} s)`;
    progressElements.forEach((progressElement, index) => {
      const progressControl = progressControls[index];
      const progressTrack = progressTracks[index];
      progressElement.dataset.styleProgressState = paused ? 'paused' : 'running';
      progressElement.style.setProperty('--style-progress-ratio', String(percent / 100));
      progressElement.classList.toggle('style-progress--warning', warning);
      if (progressControl) {
        progressControl.setAttribute('aria-label', label);
        progressControl.setAttribute('aria-pressed', String(paused));
      } else {
        progressElement.setAttribute('aria-label', label);
        progressElement.setAttribute('aria-pressed', String(paused));
      }
      progressTrack?.setAttribute('aria-label', label);
      progressTrack?.setAttribute('aria-valuenow', String(percent));
      progressElement.dispatchEvent(
        new CustomEvent('styleprogresschange', { detail: { percent, paused } }),
      );
    });
  };

  const signalProgressCompletion = () => {
    progressElements.forEach((progressElement) => {
      progressElement.style.setProperty('--style-progress-ratio', '1');
      progressElement.dispatchEvent(
        new CustomEvent('styleprogresschange', {
          detail: { percent: 100, paused: false, complete: true },
        }),
      );
    });
  };

  const advanceStyle = () => {
    signalProgressCompletion();
    style = nextStyle();
    preserveViewport(() => {
      apply(true);
      restartProgressRef.current?.();
    });
  };

  const scheduleProgress = (delay: number) => {
    timer = window.setTimeout(advanceStyle, delay);
    progressTicker = window.setInterval(updateProgressA11y, progressUpdateMs);
  };

  const toggleProgress = () => {
    if (paused) {
      paused = false;
      startedAt = Date.now() - (STYLE_AUTO_INTERVAL_MS - remaining);
      progressElements.forEach((progressElement) => {
        progressElement.classList.remove('style-progress--paused');
      });
      updateProgressA11y();
      scheduleProgress(remaining);
      return;
    }

    remaining = readRemaining();
    paused = true;
    clearScheduledWork();
    progressElements.forEach((progressElement) => {
      progressElement.classList.add('style-progress--paused');
    });
    updateProgressA11y();
  };

  progressElements.forEach((progressElement) => {
    progressElement.addEventListener('click', toggleProgress);
  });

  restartProgressRef.current = () => {
    clearScheduledWork();
    paused = false;
    remaining = STYLE_AUTO_INTERVAL_MS;
    startedAt = Date.now();
    progressElements.forEach((progressElement) => {
      progressElement.style.setProperty('--style-progress-duration', `${STYLE_AUTO_INTERVAL_MS}ms`);
      progressElement.classList.remove('style-progress--paused', 'style-progress--running');
      void progressElement.offsetWidth;
      progressElement.classList.add('style-progress--running');
    });
    updateProgressA11y();
    scheduleProgress(STYLE_AUTO_INTERVAL_MS);
  };

  restartProgressRef.current();

  const motion =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : undefined;
  const pauseForReducedMotion = () => {
    if (motion?.matches && !paused) toggleProgress();
  };
  motion?.addEventListener('change', pauseForReducedMotion);
  pauseForReducedMotion();
}
