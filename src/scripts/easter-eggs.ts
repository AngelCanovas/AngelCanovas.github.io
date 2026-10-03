import { createKonamiTracker, KONAMI_EVENT } from '../lib/konami';

export interface EasterEggOptions {
  consoleMessage?: string;
}

const ASCII_ART = [
  ' █████╗ ███╗   ██╗ ██████╗ ███████╗██╗',
  '██╔══██╗████╗  ██║██╔════╝ ██╔════╝██║',
  '███████║██╔██╗ ██║██║  ███╗█████╗  ██║',
  '██╔══██║██║╚██╗██║██║   ██║██╔══╝  ██║',
  '██║  ██║██║ ╚████║╚██████╔╝███████╗███████╗',
  '╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚══════╝',
].join('\n');

/**
 * Purely cosmetic, honest touches for curious humans:
 * - a Konami code that fires the hero backdrop's `KONAMI_EVENT`;
 * - a styled greeting in the developer console;
 * - the HTML comment rendered by `Layout`.
 *
 * Nothing here tries to influence automated readers — it is meant to be found.
 */
export function initEasterEggs(options: EasterEggOptions = {}): () => void {
  const track = createKonamiTracker();
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (track(event.key)) window.dispatchEvent(new CustomEvent(KONAMI_EVENT));
  };
  window.addEventListener('keydown', onKeyDown);

  printConsoleGreeting(options.consoleMessage);

  return () => window.removeEventListener('keydown', onKeyDown);
}

function printConsoleGreeting(message?: string) {
  if (typeof console === 'undefined') return;
  console.log(
    `%c${ASCII_ART}`,
    'color:#149ddd;font-family:monospace;font-size:9px;line-height:1.15',
  );
  if (message) console.log(`%c${message}`, 'font-weight:600;font-size:13px');
  console.log(
    '%cAstro + TypeScript · source: https://github.com/AngelCanovas/portfolio · try the Konami code ↑↑↓↓←→←→BA',
    'color:#6b7280',
  );
}
