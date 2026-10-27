import { initEasterEggs } from './easter-eggs';
import { upgradeEmailLinks } from './email-links';
import { initHashScroll } from './hash-scroll';
import { safeInit } from './safe-init';

/** The build bakes a year into the static HTML; keep it current on long-lived visits. */
function syncFooterYear(): void {
  const year = String(new Date().getFullYear());
  document.querySelectorAll<HTMLElement>('[data-current-year]').forEach((element) => {
    if (element.textContent !== year) element.textContent = year;
  });
}

/**
 * Client composition root: wires each independent behaviour to the page.
 * Everything here is progressive enhancement — the site works without JS.
 */
function bootstrap(): void {
  safeInit(syncFooterYear);
  safeInit(upgradeEmailLinks);
  safeInit(initHashScroll);
  safeInit(() => initEasterEggs({ consoleMessage: document.body.dataset.consoleMessage }));
}

bootstrap();
