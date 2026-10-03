/**
 * Heuristic detection of crawlers, monitoring tools and automation browsers.
 *
 * Automatic language redirects must never run for them: a crawler that follows
 * the JS redirect would see `/` as a duplicate of `/es/` (hurting indexing of
 * the English URL), and synthetic tools such as Lighthouse would be measured on
 * the wrong page.
 */
const BOT_PATTERN =
  /(?:^|[\s;/(])(?:[a-z0-9_-]*(?<!ro)bot|[a-z0-9_-]*crawler|[a-z0-9_-]*spider)(?=[\s;/).,_-]|$)|headlesschrome|lighthouse|pagespeed|pingdom|uptimerobot|facebookexternalhit|ia_archiver|whatsapp|telegrambot|slackbot|discordbot|embedly|mediapartners|apis-google|googleother|yandeximages|yandexvideo|yandexmedia/i;

export function isBotUserAgent(userAgent: string): boolean {
  return BOT_PATTERN.test(userAgent);
}
