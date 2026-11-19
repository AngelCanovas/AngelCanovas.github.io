/**
 * Copy the ATS-friendly plain-text CV to the clipboard. The text file is a
 * static build artifact, so the copy always matches the published CV and no
 * long string is duplicated in the HTML.
 */
export function initCvCopy(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-copy-cv]').forEach((button) => {
    const original = button.textContent?.trim() ?? 'Copy CV';
    button.addEventListener('click', async () => {
      const url = button.dataset.cvUrl;
      const status = document.querySelector<HTMLElement>('[data-copy-status]');
      if (!url) return;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        await writeClipboard(text);
        button.textContent = button.dataset.labelCopied ?? original;
        if (status) status.textContent = button.dataset.labelCopied ?? '';
      } catch {
        button.textContent = button.dataset.labelFailed ?? original;
        if (status) status.textContent = button.dataset.labelFailed ?? '';
      }

      window.setTimeout(() => {
        button.textContent = original;
        if (status) status.textContent = '';
      }, 2500);
    });
  });
}

async function writeClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Permission denied or a non-secure context: fall through to execCommand.
    }
  }

  // Fallback for non-secure contexts, permission denials and older engines.
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, text.length);
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('copy command failed');
}
