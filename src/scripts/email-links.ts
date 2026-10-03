/**
 * Replace the placeholder `href` of every `[data-email-link]` element with a
 * real `mailto:` built from `data-email-user` + `data-email-domain`, so the
 * address never appears as a scrapeable link in the static HTML. Elements
 * marked `data-email-copy` are copy-only and keep their source href.
 */
export function upgradeEmailLinks(root: ParentNode = document): void {
  root.querySelectorAll<HTMLAnchorElement>('a[data-email-link]').forEach((link) => {
    const user = link.dataset.emailUser;
    const domain = link.dataset.emailDomain;
    if (user && domain) link.href = `mailto:${user}@${domain}`;
  });
}
