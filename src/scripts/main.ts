import { initEasterEggs } from './easter-eggs';
import { upgradeEmailLinks } from './email-links';
import { initHashScroll, scrollToSection } from './hash-scroll';
import { safeInit } from './safe-init';

/** The build bakes a year into the static HTML; keep it current on long-lived visits. */
function syncFooterYear(): void {
  const year = String(new Date().getFullYear());
  document.querySelectorAll<HTMLElement>('[data-current-year]').forEach((element) => {
    if (element.textContent !== year) element.textContent = year;
  });
}

let easterEggsInitialized = false;
let routerHookInstalled = false;

/**
 * ClientRouter keeps the document alive across navigations, so the initial
 * `load` event never fires again. Re-apply the enhancements that depend on the
 * new DOM and honour any hash the router carried over.
 */
function installRouterHook(): void {
  if (routerHookInstalled) return;
  routerHookInstalled = true;
  document.addEventListener('astro:after-swap', () => {
    safeInit(syncFooterYear);
    safeInit(upgradeEmailLinks);
    const hash = window.location.hash.slice(1);
    if (hash) window.requestAnimationFrame(() => scrollToSection(hash));
  });
  // ClientRouter keeps `scrollRestoration` on `manual` for its own scroll
  // handling. Once the page is settled, give the browser its normal behaviour
  // back so Back/Forward and reloads keep working.
  document.addEventListener('astro:page-load', () => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
  });
  window.addEventListener(
    'load',
    () => {
      if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
    },
    { once: true },
  );
}

/**
 * Client composition root: wires each independent behaviour to the page.
 * Everything here is progressive enhancement — the site works without JS.
 */
function bootstrap(): void {
  safeInit(syncFooterYear);
  safeInit(upgradeEmailLinks);
  safeInit(initHashScroll);
  safeInit(installRouterHook);
  if (!easterEggsInitialized) {
    easterEggsInitialized = true;
    safeInit(() => initEasterEggs({ consoleMessage: document.body.dataset.consoleMessage }));
  }
}

bootstrap();
