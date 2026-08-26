import { getCollection, type CollectionEntry } from 'astro:content';
import readingTime from 'reading-time';

export type Post = CollectionEntry<'posts'>;
export type PostType = Post['data']['type'];

/** Source host shown under a link's title, e.g. "simonwillison.net". */
export function getLinkHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Slug from a post id. Ids look like "2026/2026-07-23-title.mdx" or
 * "2026-07-23-title/index.mdx". Returns just the title portion.
 */
export function getSlugFromId(id: string): string {
  const clean = id.replace(/\/index$/, '').replace(/\.mdx?$/, '');
  const basename = clean.split('/').pop() ?? clean;
  return basename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

/** Collection segment for a type: entries or links. */
export function getTypeSegment(type: PostType): string {
  return type === 'link' ? 'links' : 'entries';
}

/** Permalink path for a post: /entries/<id>/ or /links/<id>/. */
export function getPostPath(post: Post): string {
  return `/${getTypeSegment(post.data.type)}/${post.data.id}/`;
}

/**
 * Fails the build if two posts share an id. Without this a reused id quietly
 * drops one of the two posts from the build and hands its URL to the other.
 * Hidden and draft posts count too, so unhiding one can't surface a collision
 * later.
 */
export async function assertUniqueIds(): Promise<void> {
  const all = await getCollection('posts');
  const seen = new Map<number, string>();
  for (const post of all) {
    const clash = seen.get(post.data.id);
    if (clash) throw new Error(`포스트 id ${post.data.id} 가 중복입니다: ${clash} / ${post.id}`);
    seen.set(post.data.id, post.id);
  }
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
    // Only real tags: a bare <여덟 단어> in the prose has to survive.
    .replace(/<\/?[A-Za-z][^>]*>/g, '')
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

/**
 * All published posts (drops hidden always, drafts only in prod), newest first.
 * Pass a type to get just entries or just links, for the archive pages.
 */
export async function getPublishedPosts(type?: PostType): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => {
    if (data.hide) return false;
    if (data.draft && import.meta.env.PROD) return false;
    if (type && data.type !== type) return false;
    return true;
  });
  return posts.sort((a, b) => getDateFromId(b.id).localeCompare(getDateFromId(a.id)));
}

/**
 * Published posts sharing a thread key, oldest first — the order the timeline
 * reads in. Built on getPublishedPosts so a hidden or draft note can't reach
 * the page through a sibling's permalink.
 */
export async function getThreadPosts(thread: string): Promise<Post[]> {
  const links = await getPublishedPosts('link');
  return links.filter((p) => p.data.thread === thread).sort(compareChrono);
}

/** A stream row: one post, plus where it sits in its thread when it has one. */
export interface StreamItem {
  post: Post;
  /** 1-based position of this note in its thread, chronological. */
  threadIndex: number;
  /** Notes in the thread. 1 when the post isn't threaded. */
  threadTotal: number;
  /** The whole thread, newest first. Just [post] when it isn't threaded. */
  notes: Post[];
}

/** Groups posts by thread key. Each list keeps the order it was given. */
function groupByThread(posts: Post[]): Map<string, Post[]> {
  const threads = new Map<string, Post[]>();
  for (const post of posts) {
    const key = post.data.thread;
    if (!key) continue;
    const notes = threads.get(key);
    if (notes) notes.push(post);
    else threads.set(key, [post]);
  }
  return threads;
}

/** Chronological order: by date, then by id when two notes share a day. */
function compareChrono(a: Post, b: Post): number {
  return getDateFromId(a.id).localeCompare(getDateFromId(b.id)) || a.data.id - b.data.id;
}

/**
 * The note a thread starts from. That note's permalink is the whole thread's
 * page; the later notes are anchors on it, not pages of their own. Order of
 * the input doesn't matter — callers hold thread lists in both directions.
 */
export function getThreadOpener(notes: Post[]): Post {
  return notes.reduce((first, note) => (compareChrono(note, first) < 0 ? note : first));
}

/** Fragment id for one note inside its thread page, e.g. "note-31". */
export function getNoteAnchor(post: Post): string {
  return `note-${post.data.id}`;
}

/**
 * Canonical URL per post, keyed by collection id. A thread renders as one page
 * at its opening note's permalink, so a later note resolves to an anchor on
 * that page rather than a URL of its own. Everything that links to a post —
 * the stream, the sidebar, the feed — goes through this, so no link can point
 * at a page the build doesn't emit.
 */
export function getPostUrls(posts: Post[]): Map<string, string> {
  const openers = new Map<string, Post>();
  for (const [key, notes] of groupByThread(posts)) openers.set(key, getThreadOpener(notes));
  const urls = new Map<string, string>();
  for (const post of posts) {
    const opener = post.data.thread ? openers.get(post.data.thread) : undefined;
    urls.set(
      post.id,
      !opener || opener.id === post.id
        ? getPostPath(post)
        : `${getPostPath(opener)}#${getNoteAnchor(post)}`,
    );
  }
  return urls;
}

/**
 * Folds each thread down to one row for the stream pages: the note it started
 * from, at its own date. Laying every note out would show the same book three
 * times, and the thread page is one click away.
 *
 * The cost is that a new note doesn't lift its thread back up the stream — it
 * stays where the thread began. The feed still carries each note as its own
 * item, and the "1/3" marker grows, so a new thought isn't silent.
 */
export function collapseThreads(posts: Post[]): StreamItem[] {
  const threads = groupByThread(posts);
  const items: StreamItem[] = [];
  for (const post of posts) {
    const key = post.data.thread;
    if (!key) {
      items.push({ post, threadIndex: 1, threadTotal: 1, notes: [post] });
      continue;
    }
    const notes = threads.get(key) ?? [post];
    // The row belongs at the opening note, so the date shown is the date of
    // the note shown.
    if (getThreadOpener(notes).id !== post.id) continue;
    items.push({ post, threadIndex: 1, threadTotal: notes.length, notes });
  }
  return items;
}

/**
 * Previous (older) and next (newer) post relative to the given slug, staying
 * within the same type — otherwise "다음 글" jumps from an essay to a
 * two-sentence link and back.
 */
export function getAdjacentPosts(posts: Post[], currentId: string) {
  const current = posts.find((p) => p.id === currentId);
  const sameType = current ? posts.filter((p) => p.data.type === current.data.type) : posts;
  const idx = sameType.findIndex((p) => p.id === currentId);
  // posts are newest-first: next (newer) is idx-1, prev (older) is idx+1
  return {
    newer: idx > 0 ? sameType[idx - 1] : null,
    older: idx >= 0 && idx < sameType.length - 1 ? sameType[idx + 1] : null,
  };
}
