import template from '../../data/security.txt?raw';
import { siteUrl } from '../../lib/site-url';

export function GET() {
  return new Response(template.replaceAll('{{SITE_URL}}', siteUrl), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
