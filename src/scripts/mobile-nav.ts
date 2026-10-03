/**
 * Off-canvas navigation for small screens: toggle button, overlay, Escape key
 * and click-outside-to-close, with the matching ARIA state. While the panel is
 * open the rest of the page is inert, and closing returns focus to the toggle.
 */
export function initMobileNav(): void {
  const header = document.querySelector<HTMLElement>('#header');
  const toggle = document.querySelector<HTMLElement>('.header-toggle');
  const overlay = document.querySelector<HTMLElement>('#mobile-nav-overlay');
  const background = ['#main-content', '#footer', '#scroll-top', '.skip-link']
    .map((selector) => document.querySelector<HTMLElement>(selector))
    .filter((element): element is HTMLElement => element !== null);
  const desktop =
    typeof window.matchMedia === 'function' ? window.matchMedia('(min-width: 1200px)') : null;

  function setBackgroundInert(inert: boolean) {
    for (const element of background) {
      if (inert) element.setAttribute('inert', '');
      else element.removeAttribute('inert');
    }
  }

  function setOpen(open: boolean, restoreFocus = true) {
    const wasOpen = header?.classList.contains('header-show') ?? false;
    header?.classList.toggle('header-show', open);
    toggle?.setAttribute('aria-expanded', String(open));
    overlay?.setAttribute('aria-hidden', String(!open));
    setBackgroundInert(open);
    if (open && !wasOpen) {
      header?.querySelector<HTMLElement>('#navmenu a')?.focus();
    }
    if (!open && wasOpen && restoreFocus && toggle && !(desktop?.matches ?? false)) toggle.focus();
  }

  function close(restoreFocus = true) {
    setOpen(false, restoreFocus);
  }

  toggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    setOpen(!header?.classList.contains('header-show'));
  });

  /**
   * The browser processes the fragment navigation after the click handler, and
   * hiding the panel would drop the focus to `<body>`. Moving it to the section
   * ourselves (with `preventScroll`, so the anchor scroll keeps running) leaves
   * the keyboard where the navigation landed; a link without a target is not a
   * navigation, so the toggle keeps the focus instead.
   */
  function focusNavTarget(link: HTMLAnchorElement): void {
    const href = link.getAttribute('href') ?? '';
    const target = href.startsWith('#') ? document.getElementById(href.slice(1)) : null;
    if (!target) {
      if (toggle && !(desktop?.matches ?? false)) toggle.focus();
      return;
    }
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }

  document.querySelectorAll<HTMLAnchorElement>('#navmenu a').forEach((link) => {
    link.addEventListener('click', () => {
      close(false);
      window.requestAnimationFrame(() => focusNavTarget(link));
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  document.addEventListener('click', (event) => {
    if (!header?.classList.contains('header-show')) return;
    const target = event.target as Node;
    if (!header.contains(target) && !toggle?.contains(target)) close();
  });

  if (desktop) {
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) close();
    };
    if (typeof desktop.addEventListener === 'function') {
      desktop.addEventListener('change', onChange);
    } else {
      // Safari <= 13 still uses the deprecated callback API.
      (desktop as unknown as { addListener: (listener: typeof onChange) => void }).addListener(
        onChange,
      );
    }
  }
}
