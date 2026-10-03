/** Run one client module; a failure must never take the rest of the page down. */
export function safeInit(init: () => void): void {
  try {
    init();
  } catch (error) {
    console.error('[init]', error);
  }
}
