import type { APIRoute } from 'astro';

import { buildAtsText } from '../../lib/ats-text';

/** Static build artifact: dist/cv/angel-canovas-cv-en.txt (ATS-friendly plain text). */
export const GET: APIRoute = () =>
  new Response(buildAtsText('en'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
