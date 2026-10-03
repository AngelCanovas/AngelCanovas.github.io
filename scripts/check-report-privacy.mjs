/** Inspect the ZIP embedded in Playwright HTML; never print offending values. */
import { readFileSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';

const html = readFileSync('playwright-report/index.html', 'utf8');
const match = html.match(/data:application\/zip;base64,([A-Za-z0-9+/=]+)/);
if (!match) throw new Error('Missing embedded Playwright ZIP');
const zip = Buffer.from(match[1], 'base64');
const texts = [html];
let entries = 0;
for (let offset = 0; offset + 46 < zip.length; offset++) {
  if (zip.readUInt32LE(offset) !== 0x02014b50) continue;
  const method = zip.readUInt16LE(offset + 10);
  const size = zip.readUInt32LE(offset + 20);
  const nameSize = zip.readUInt16LE(offset + 28);
  const extraSize = zip.readUInt16LE(offset + 30);
  const commentSize = zip.readUInt16LE(offset + 32);
  const local = zip.readUInt32LE(offset + 42);
  const name = zip.subarray(offset + 46, offset + 46 + nameSize).toString();
  const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
  const data = zip.subarray(start, start + size);
  if (![0, 8].includes(method)) throw new Error('Unsupported ZIP compression');
  texts.push(name, (method === 8 ? inflateRawSync(data) : data).toString('utf8'));
  entries++;
  offset += 45 + nameSize + extraSize + commentSize;
}
if (!entries) throw new Error('Empty report ZIP');
const forbidden = [/"gitCommit"\s*:/, /"gitDiff"\s*:/, /regmurcia\.com/i, /C:[\\/]+Users[\\/]+/i];
if (texts.some((text) => forbidden.some((pattern) => pattern.test(text)))) {
  throw new Error('Report contains excluded Git metadata or a personal path/contact');
}
console.log(`Report privacy passed: ${entries} embedded entries inspected; Git capture disabled.`);
