/**
 * "Generate PDF from this page": opens the browser print dialog, which can save
 * the online CV as a PDF using the existing print styles. The ready-made PDFs
 * stay the default download.
 */
export function initCvPrint(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-print-cv]');
  if (!button) return;
  button.addEventListener('click', () => window.print());
}
