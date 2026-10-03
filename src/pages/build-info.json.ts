import { siteUrl } from '../lib/site-url';
import packageInfo from '../../package.json' with { type: 'json' };

/** Lets deployment smoke tests distinguish this release from a cached older site. */
export function GET() {
  return Response.json({
    version: packageInfo.version,
    revision: import.meta.env.PUBLIC_SITE_REVISION || 'local',
    site: siteUrl,
  });
}
