import type { APIRoute } from 'astro';

import { buildSprite } from '../lib/sprite';

/** Cacheable SVG sprite with every icon, generated from `src/lib/icons.ts`. */
export const GET: APIRoute = () =>
  new Response(buildSprite(), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
