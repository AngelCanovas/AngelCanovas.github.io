import { describe, expect, it } from 'vitest';

import { content } from '../data/site';

type Node = Record<string, unknown> | unknown[] | string | number | boolean | null;

const OPTIONAL_EMPTY_KEYS = new Set(['link', 'suffix', 'detail']);

function walk(en: Node, es: Node, path: string, issues: string[]) {
  if (Array.isArray(en) || Array.isArray(es)) {
    if (!Array.isArray(en) || !Array.isArray(es)) {
      issues.push(`${path}: array/object mismatch`);
      return;
    }
    if (en.length !== es.length) issues.push(`${path}: length ${en.length} vs ${es.length}`);
    for (let index = 0; index < Math.min(en.length, es.length); index += 1) {
      walk(en[index] as Node, es[index] as Node, `${path}[${index}]`, issues);
    }
    return;
  }

  if (en !== null && es !== null && typeof en === 'object' && typeof es === 'object') {
    const enKeys = Object.keys(en).sort();
    const esKeys = Object.keys(es).sort();
    if (enKeys.join(',') !== esKeys.join(',')) {
      issues.push(`${path}: keys [${enKeys.join(',')}] vs [${esKeys.join(',')}]`);
      return;
    }
    for (const key of enKeys) {
      walk(
        (en as Record<string, Node>)[key],
        (es as Record<string, Node>)[key],
        `${path}.${key}`,
        issues,
      );
    }
    return;
  }

  const key = path.split('.').pop() ?? '';
  if (typeof en !== typeof es) {
    issues.push(`${path}: type ${typeof en} vs ${typeof es}`);
    return;
  }
  if (!OPTIONAL_EMPTY_KEYS.has(key)) {
    if (typeof en === 'string' && en.trim() === '') issues.push(`${path}: empty EN string`);
    if (typeof es === 'string' && es.trim() === '') issues.push(`${path}: empty ES string`);
  }
  if (typeof en === 'number' && typeof es === 'number' && en !== es) {
    issues.push(`${path}: number ${en} vs ${es}`);
  }
  if (typeof en === 'boolean' && typeof es === 'boolean' && en !== es) {
    issues.push(`${path}: boolean ${en} vs ${es}`);
  }
}

describe('content parity between locales', () => {
  it('has identical structure, array lengths and non-empty strings', () => {
    const issues: string[] = [];
    walk(content.en as unknown as Node, content.es as unknown as Node, 'content', issues);
    expect(issues, issues.join('\n')).toEqual([]);
  });
});
