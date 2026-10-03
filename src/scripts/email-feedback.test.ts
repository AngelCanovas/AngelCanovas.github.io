// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

import { initEmailCopyFeedback } from './email-feedback';

function setup() {
  document.body.innerHTML = `
    <section id="contact">
      <a data-email-link data-email-user="aca_dev" data-email-domain="hotmail.com">aca_dev&#64;hotmail&#46;com</a>
    </section>
    <div data-toast role="status"></div>`;
  const root = document.querySelector<HTMLElement>('#contact');
  const link = document.querySelector<HTMLAnchorElement>('[data-email-link]');
  const toast = document.querySelector<HTMLElement>('[data-toast]');
  if (!root || !link || !toast) throw new Error('fixture not mounted');
  return { root, link, toast };
}

function stubClipboard(implementation: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn(implementation) },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('initEmailCopyFeedback', () => {
  it('copies the assembled address and shows the localized message', async () => {
    const { root, link, toast } = setup();
    stubClipboard(() => Promise.resolve());
    initEmailCopyFeedback(root, toast, { message: (email) => `Email copied: ${email}` });

    link.click();
    await vi.waitFor(() => expect(toast.textContent).toBe('Email copied: aca_dev@hotmail.com'));
    expect(toast.classList.contains('is-visible')).toBe(true);
  });

  it('re-announces the same message on a second copy', async () => {
    const { root, link, toast } = setup();
    stubClipboard(() => Promise.resolve());
    initEmailCopyFeedback(root, toast, { message: (email) => `Email copied: ${email}` });

    const mutations: string[] = [];
    new MutationObserver(() => mutations.push(toast.textContent ?? '')).observe(toast, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    link.click();
    await vi.waitFor(() => expect(toast.textContent).toBe('Email copied: aca_dev@hotmail.com'));
    link.click();
    await vi.waitFor(() => expect(mutations.length).toBeGreaterThanOrEqual(3));
  });

  it('falls back to the plain address when the clipboard rejects', async () => {
    const { root, link, toast } = setup();
    stubClipboard(() => Promise.reject(new Error('denied')));
    initEmailCopyFeedback(root, toast, { message: (email) => `Email copied: ${email}` });

    link.click();
    await vi.waitFor(() => expect(toast.textContent).toBe('aca_dev@hotmail.com'));
  });

  it('prevents navigation for copy-only anchors', () => {
    const { root, link, toast } = setup();
    link.removeAttribute('data-email-link');
    link.setAttribute('data-email-copy', '');
    stubClipboard(() => Promise.resolve());
    initEmailCopyFeedback(root, toast, { message: (email) => email });

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores links without the data attributes and removes listeners on cleanup', async () => {
    const { root, link, toast } = setup();
    stubClipboard(() => Promise.resolve());
    link.removeAttribute('data-email-domain');
    const cleanup = initEmailCopyFeedback(root, toast, { message: (email) => email });

    link.click();
    await Promise.resolve();
    expect(toast.textContent).toBe('');

    link.setAttribute('data-email-domain', 'hotmail.com');
    cleanup();
    link.click();
    await Promise.resolve();
    expect(toast.textContent).toBe('');
  });
});
