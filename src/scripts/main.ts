import { initEasterEggs } from './easter-eggs';
import { upgradeEmailLinks } from './email-links';
import { initHashScroll } from './hash-scroll';
import { initMobileNav } from './mobile-nav';
import { safeInit } from './safe-init';
import { initScrollReveal } from './scroll-reveal';
import { initScrollTop } from './scroll-top';
import { initScrollspy } from './scrollspy';
import { initThemeToggle } from './theme';
import { initEditorialMotion } from './editorial-motion';

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
  safeInit(initThemeToggle);
  safeInit(upgradeEmailLinks);
  safeInit(initMobileNav);
  safeInit(initScrollTop);
  safeInit(initScrollReveal);
  safeInit(initHashScroll);
  safeInit(initScrollspy);
  safeInit(initEditorialMotion);
  safeInit(() => initEasterEggs({ consoleMessage: document.body.dataset.consoleMessage }));
}

bootstrap();
