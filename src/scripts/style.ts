export const STYLES = ['original', 'editorial', 'technical', 'noir'] as const;
export const STYLE_KEY = 'page-style';
export const STYLE_AUTO_INTERVAL_MS = 15_000;
export type PageStyle = (typeof STYLES)[number];

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
  const restartProgressRef: { current?: () => void } = {};
  const nextStyle = (): PageStyle => {
    const index = (STYLES.indexOf(style) + 1) % STYLES.length;
    return STYLES[index] ?? STYLES[0];
  };
  const apply = () => {
    document.documentElement.dataset.style = style;
    button.dataset.style = style;
    const next = nextStyle();
    const styleLabel = button.dataset[`label${style[0].toUpperCase()}${style.slice(1)}`] ?? style;
    const nextLabel = button.dataset[`label${next[0].toUpperCase()}${next.slice(1)}`] ?? next;
    const label = `${styleLabel}. ${nextLabel}`;
    button.setAttribute('aria-label', label);
    button.title = label;
  };
  const cycleManually = () => {
    style = nextStyle();
    apply();
    // Manual changes reset an active countdown but never unfreeze a paused one.
    if (!paused) restartProgressRef.current?.();
  };

  apply();
  button.addEventListener('click', cycleManually);

  const progressButton = document.querySelector<HTMLButtonElement>('[data-style-progress]');
  const progressTrack = progressButton?.querySelector<HTMLElement>('[data-style-progress-track]');
  if (!progressButton || !progressTrack) return;

  let timer: number | undefined;
  let progressTicker: number | undefined;
  let remaining = STYLE_AUTO_INTERVAL_MS;
  let startedAt = Date.now();
  const runningLabel = progressButton.dataset.labelRunning ?? 'Pause automatic style changes';
  const pausedLabel = progressButton.dataset.labelPaused ?? 'Resume automatic style changes';
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

  const readRemaining = () =>
    Math.max(0, STYLE_AUTO_INTERVAL_MS - (Date.now() - startedAt));

  const updateProgressA11y = () => {
    if (!paused) remaining = readRemaining();
    const percent = Math.max(
      0,
      Math.min(100, Math.round((1 - remaining / STYLE_AUTO_INTERVAL_MS) * 100)),
    );
    const label = paused
      ? pausedLabel
      : `${runningLabel} (${Math.max(1, Math.ceil(remaining / 1000))} s)`;
    progressButton.setAttribute('aria-label', label);
    progressButton.setAttribute('aria-pressed', String(paused));
    progressTrack.setAttribute('aria-label', label);
    progressTrack.setAttribute('aria-valuenow', String(percent));
  };

  const advanceStyle = () => {
    style = nextStyle();
    apply();
    restartProgressRef.current?.();
  };

  const scheduleProgress = (delay: number) => {
    timer = window.setTimeout(advanceStyle, delay);
    progressTicker = window.setInterval(updateProgressA11y, progressUpdateMs);
  };

  const pauseProgress = () => {
    if (paused) return;
    remaining = readRemaining();
    paused = true;
    clearScheduledWork();
    progressButton.classList.add('style-progress--paused');
    updateProgressA11y();
  };

  const resumeProgress = () => {
    if (!paused) return;
    paused = false;
    startedAt = Date.now() - (STYLE_AUTO_INTERVAL_MS - remaining);
    progressButton.classList.remove('style-progress--paused');
    updateProgressA11y();
    scheduleProgress(remaining);
  };

  progressButton.addEventListener('click', () => {
    if (paused) resumeProgress();
    else pauseProgress();
  });

  restartProgressRef.current = () => {
    clearScheduledWork();
    paused = false;
    remaining = STYLE_AUTO_INTERVAL_MS;
    startedAt = Date.now();
    progressButton.style.setProperty('--style-progress-duration', `${STYLE_AUTO_INTERVAL_MS}ms`);
    progressButton.classList.remove('style-progress--paused', 'style-progress--running');
    void progressButton.offsetWidth;
    progressButton.classList.add('style-progress--running');
    updateProgressA11y();
    scheduleProgress(STYLE_AUTO_INTERVAL_MS);
  };

  restartProgressRef.current();
}
