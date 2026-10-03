import { withBase } from './base-path';

/** The hosting origin and the full project URL have distinct responsibilities. */
export const siteOrigin = 'https://angelcanovas.github.io';
export function absoluteUrl(path: string): string {
  return new URL(withBase(path), siteOrigin).href;
}
export const siteUrl = absoluteUrl('/').replace(/\/$/, '');
export const siteHost = `${new URL(siteOrigin).hostname}${withBase('/')}`;
