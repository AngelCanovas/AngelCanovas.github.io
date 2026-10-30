import type { APIRoute } from 'astro';

import { buildAtsText } from '../../lib/ats-text';

/** Static build artifact: dist/cv/angel-canovas-cv-es.txt (ATS-friendly plain text). */
export const GET: APIRoute = () =>
  new Response(buildAtsText('es'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
