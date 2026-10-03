export interface EmailCopyFeedbackOptions {
  duration?: number;
  message: (email: string) => string;
}

/**
 * On click of an `[data-email-link]` or `[data-email-copy]` element, copy the
 * address to the clipboard and show a transient toast. Copy-only elements
 * (`data-email-copy`) do not open a mail client; links keep their `mailto:`.
 *
 * Returns a cleanup function that removes the listeners.
 */
export function initEmailCopyFeedback(
  root: ParentNode,
  toast: HTMLElement,
  options: EmailCopyFeedbackOptions,
): () => void {
  const links = Array.from(
    root.querySelectorAll<HTMLElement>('[data-email-link], [data-email-copy]'),
  );
  if (links.length === 0) return () => {};

  const duration = options.duration ?? 2800;
  let timer = 0;

  function setVisible(visible: boolean) {
    toast.classList.toggle('is-visible', visible);
  }

  function showToast(message: string) {
    // Mutate the live region even when the text repeats, so copying twice is
    // announced twice. The empty frame also guarantees a fresh mutation.
    toast.textContent = '';
    window.requestAnimationFrame(() => {
      toast.textContent = message;
    });
    setVisible(true);
    window.clearTimeout(timer);
    timer = window.setTimeout(() => setVisible(false), duration);
  }

  const listeners = links.map((link) => {
    const listener = (event: MouseEvent) => {
      const user = link.dataset.emailUser;
      const domain = link.dataset.emailDomain;
      if (!user || !domain) return;
      if (link.hasAttribute('data-email-copy')) event.preventDefault();
      const email = `${user}@${domain}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(
          () => showToast(options.message(email)),
          () => showToast(email),
        );
      } else {
        showToast(email);
      }
    };
    link.addEventListener('click', listener);
    return [link, listener] as const;
  });

  return () => {
    window.clearTimeout(timer);
    for (const [link, listener] of listeners) link.removeEventListener('click', listener);
  };
}
