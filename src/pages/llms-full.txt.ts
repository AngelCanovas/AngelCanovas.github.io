import type { APIRoute } from 'astro';

import { buildLlmsFullText } from '../lib/llms';

/** Static build artifact: dist/llms-full.txt, generated from `site.ts`. */
export const GET: APIRoute = () =>
  new Response(buildLlmsFullText('en'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
