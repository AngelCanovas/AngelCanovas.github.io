import { personal } from '../data/site';

/**
 * `JSON.stringify` that additionally escapes `<` so a payload can never
 * terminate its surrounding `<script>` element (defence in depth for inline
 * JSON-LD / data blocks).
 */
export function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/**
 * HTML-entity-encode an email address so naive scrapers cannot read it from the
 * raw markup. The browser renders it normally and the `mailto:` href is
 * assembled client-side (see `upgradeEmailLinks`).
 */
export function obfuscateEmail(email: string = personal.email): string {
  return email.replace(/@/g, '&#64;').replace(/\./g, '&#46;');
}

/** Split an email address into the parts needed to build a `mailto:` link. */
export function emailParts(email: string = personal.email): { user: string; domain: string } {
  const [user = '', domain = ''] = email.split('@');
  return { user, domain };
}
