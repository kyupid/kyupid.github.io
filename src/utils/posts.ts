import { getCollection, type CollectionEntry } from 'astro:content';
import readingTime from 'reading-time';

export type Post = CollectionEntry<'posts'>;

/**
 * Slug from a post id. Ids look like "2026/2026-07-23-title.mdx" or
 * "2026-07-23-title/index.mdx". Returns just the title portion.
 */
export function getSlugFromId(id: string): string {
  const clean = id.replace(/\/index$/, '').replace(/\.mdx?$/, '');
  const basename = clean.split('/').pop() ?? clean;
  return basename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

/** Permalink path for a post: /<id>/ (numeric, from frontmatter). */
export function getPostPath(post: Post): string {
  return `/${post.data.id}/`;
}

/** "YYYY-MM-DD" parsed from the filename prefix. */
export function getDateFromId(id: string): string {
  const basename = id.split('/').pop() ?? id;
  const match = basename.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}

/** English long date with ordinal, e.g. "22nd July 2026". */
export function formatDate(date: string): string {
  const d = new Date(date + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return date;
  const day = d.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';
  const month = d.toLocaleString('en-US', { month: 'long' });
  return `${day}${suffix} ${month} ${d.getFullYear()}`;
}

export function getReadingTime(body: string) {
  return readingTime(body);
}

/** Word count for the Simon-style "[1,234 words]" marker. */
export function getWordCount(body: string): number {
  return getReadingTime(body).words;
}

/** Strip markdown/MDX to a short plain-text excerpt. */
export function getExcerpt(body: string, maxLength = 160): string {
  const text = body
    .replace(/^import\s.+$/gm, '')
    .replace(/^export\s.+$/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/\[\^[^\]]+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/**
 * Share-card image for a post: explicit frontmatter `image` wins, otherwise the
 * first image in the body. Returns undefined so the layout can fall back to
 * SITE.ogImage.
 */
export function getOgImage(post: Post): string | undefined {
  if (post.data.image) return post.data.image;
  const body = post.body || '';
  // Markdown ![alt](/path) first, then an MDX/HTML src="..." attribute.
  const md = body.match(/!\[[^\]]*\]\((\/[^)\s]+)\)/);
  if (md) return md[1];
  const attr = body.match(/src=["'](\/[^"']+\.(?:png|jpe?g|gif|webp|avif))["']/i);
  return attr ? attr[1] : undefined;
}

/** All published posts (drops hidden always, drafts only in prod), newest first. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => {
    if (data.hide) return false;
    if (data.draft && import.meta.env.PROD) return false;
    return true;
  });
  return posts.sort((a, b) => getDateFromId(b.id).localeCompare(getDateFromId(a.id)));
}

/** Previous (older) and next (newer) post relative to the given slug. */
export function getAdjacentPosts(posts: Post[], currentId: string) {
  const idx = posts.findIndex((p) => p.id === currentId);
  // posts are newest-first: next (newer) is idx-1, prev (older) is idx+1
  return {
    newer: idx > 0 ? posts[idx - 1] : null,
    older: idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null,
  };
}
