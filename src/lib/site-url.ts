import { withBase } from './base-path';

/** The hosting origin and canonical site URL are explicit, even at the root mount. */
export const siteOrigin = 'https://angelcanovas.github.io';
export function absoluteUrl(path: string): string {
  return new URL(withBase(path), siteOrigin).href;
}
export const siteUrl = absoluteUrl('/').replace(/\/$/, '');
export const siteHost = `${new URL(siteOrigin).hostname}${withBase('/')}`;
