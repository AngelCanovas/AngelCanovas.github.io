import { describe, expect, it } from 'vitest';

import { isBotUserAgent } from './bots';

const DESKTOP_CHROME =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

describe('isBotUserAgent', () => {
  it('detects search engine crawlers', () => {
    expect(
      isBotUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'),
    ).toBe(true);
    expect(
      isBotUserAgent('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'),
    ).toBe(true);
    expect(isBotUserAgent('DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)')).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 (compatible; YandexBot/3.0)')).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 (compatible; Baiduspider/2.0)')).toBe(true);
  });

  it('detects crawler variants whose token continues with a suffix', () => {
    expect(isBotUserAgent('Googlebot-Image/1.0')).toBe(true);
    expect(isBotUserAgent('Googlebot-News')).toBe(true);
    expect(isBotUserAgent('AdsBot-Google-Mobile (+http://www.google.com/mobile/adsbot.html)')).toBe(
      true,
    );
    expect(isBotUserAgent('Mediapartners-Google')).toBe(true);
    expect(
      isBotUserAgent('APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)'),
    ).toBe(true);
    expect(isBotUserAgent('YandexImages/3.0')).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 (compatible; SemrushBot/7~bl)')).toBe(true);
  });

  it('detects automation and monitoring tools', () => {
    expect(
      isBotUserAgent(
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36',
      ),
    ).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 (compatible; Google PageSpeed Insights)')).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 (compatible; UptimeRobot/2.0)')).toBe(true);
  });

  it('does not flag real browsers', () => {
    expect(isBotUserAgent(DESKTOP_CHROME)).toBe(false);
    expect(isBotUserAgent(IPHONE_SAFARI)).toBe(false);
    expect(isBotUserAgent('')).toBe(false);
  });

  it('does not flag unrelated words containing "bot"', () => {
    expect(isBotUserAgent('Mozilla/5.0 (compatible; Robot Viewer)')).toBe(false);
  });
});
