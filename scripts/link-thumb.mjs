// Save a link post's thumbnail locally.
//
//   node scripts/link-thumb.mjs src/posts/2026/2026-08-20-eight-words.md
//
// Reads the post's `link:`, pulls og:image (or twitter:image) off that page,
// downloads it to public/images/links/<slug>.<ext>, and prints the frontmatter
// line to paste in. Run by hand while writing a link post, never at build time,
// so a deploy never depends on someone else's site being up.
//
// Check the result before committing it: a transparent logo drawn in white
// disappears on the light theme, so flatten it onto a solid background (or pick
// another image) rather than shipping a blank box.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { basename, extname } from 'node:path';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/link-thumb.mjs <post file>');
  process.exit(1);
}

const source = await readFile(file, 'utf8');
const link = source.match(/^link:\s*(\S+)\s*$/m)?.[1];
if (!link) {
  console.error(`${file}: link: 필드가 없습니다.`);
  process.exit(1);
}
const slug = basename(file)
  .replace(/\.mdx?$/, '')
  .replace(/^\d{4}-\d{2}-\d{2}-/, '');

const page = await fetch(link, { headers: { 'user-agent': UA } });
if (!page.ok) throw new Error(`${link} → HTTP ${page.status}`);
const html = await page.text();

// <meta property="og:image" content="..."> in either attribute order.
const meta = (name) =>
  html.match(
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']|` +
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`,
      'i'
    )
  );
const hit = meta('og:image') ?? meta('twitter:image');
const found = hit && (hit[1] ?? hit[2]);
if (!found) {
  console.error(`${link}: og:image 를 못 찾았습니다. 이미지를 직접 저장하세요.`);
  process.exit(2);
}
const imageUrl = new URL(found, link).href;

const image = await fetch(imageUrl, { headers: { 'user-agent': UA, referer: link } });
if (!image.ok) throw new Error(`${imageUrl} → HTTP ${image.status}`);
const type = (image.headers.get('content-type') ?? '').split(';')[0].trim();
const ext =
  { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif' }[type] ||
  extname(new URL(imageUrl).pathname) ||
  '.jpg';

const out = `public/images/links/${slug}${ext}`;
await mkdir('public/images/links', { recursive: true });
const bytes = Buffer.from(await image.arrayBuffer());
await writeFile(out, bytes);

console.log(`${imageUrl}\n→ ${out} (${Math.round(bytes.length / 1024)}KB)`);
console.log(`frontmatter: image: /images/links/${slug}${ext}`);
