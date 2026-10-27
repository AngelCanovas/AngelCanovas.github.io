import { initMobileNav } from './mobile-nav';
import { safeInit } from './safe-init';
import { initScrollReveal } from './scroll-reveal';
import { initScrollTop } from './scroll-top';
import { initScrollspy } from './scrollspy';
import { initThemeToggle } from './theme';
import { initStyleToggle } from './style';
import { initStyleProgressBackdrop } from './style-progress-backdrop';
import { initEditorialMotion } from './editorial-motion';

export function initPortfolio(): void {
  safeInit(initThemeToggle);
  safeInit(initStyleToggle);
  safeInit(initStyleProgressBackdrop);
  safeInit(initMobileNav);
  safeInit(initScrollTop);
  safeInit(initScrollReveal);
  safeInit(initScrollspy);
  safeInit(initEditorialMotion);
}
