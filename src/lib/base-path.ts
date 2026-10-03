/** Build project paths once, preserving the case-sensitive deployment prefix. */
export function withBase(path: string, base = import.meta.env.BASE_URL): string {
  const prefix = `/${base.replace(/^\/+|\/+$/g, '')}`.replace(/^\/$/, '');
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('Expected a project path');
  if (prefix && (path === prefix || path.startsWith(`${prefix}/`))) return path;
  return `${prefix}${path}`;
}
