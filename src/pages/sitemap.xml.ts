import template from '../data/sitemap.xml?raw';
import { siteUrl } from '../lib/site-url';

export function GET() {
  return new Response(template.replaceAll('{{SITE_URL}}', siteUrl), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
