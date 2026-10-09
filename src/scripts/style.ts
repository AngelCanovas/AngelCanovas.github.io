export const STYLES = ['original', 'editorial', 'technical', 'noir'] as const;
export const STYLE_KEY = 'page-style';
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
  const apply = () => {
    document.documentElement.dataset.style = style;
    button.dataset.style = style;
    const next = STYLES[(STYLES.indexOf(style) + 1) % STYLES.length];
    const label = `${button.dataset[`label${style[0].toUpperCase()}${style.slice(1)}`]}. ${button.dataset[`label${next[0].toUpperCase()}${next.slice(1)}`]}`;
    button.setAttribute('aria-label', label);
    button.title = label;
  };
  apply();
  button.addEventListener('click', () => {
    style = STYLES[(STYLES.indexOf(style) + 1) % STYLES.length];
    apply();
  });
}
