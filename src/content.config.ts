import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Single stream of posts. Date + slug come from the filename (YYYY-MM-DD-title),
// so frontmatter stays minimal.
//
// Two kinds share the stream and the id sequence:
//   entry — a full post, the default.
//   link  — a short note about someone else's writing. Its title points at the
//           source; the permalink exists mainly for the feed.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/posts' }),
  schema: z
    .object({
      // Permalink id → URL is /<type>/<id>/. Assign the next integer per post;
      // the sequence is shared by entries and links, and the build fails on a
      // duplicate (see assertUniqueIds in utils/posts.ts).
      id: z.number().int().positive(),
      type: z.enum(['entry', 'link']).default('entry'),
      title: z.string(),
      // The source URL. Required for `type: link`, unused otherwise.
      link: z.string().url().optional(),
      // Opt-in thread key, e.g. `eight-words`. Links sharing one render as a
      // single chronological timeline on each of their permalinks — a second
      // thought about the same book becomes a new post, not an edit of the old
      // one. Deliberately not derived from `link`: the source URL can change
      // while the thread doesn't, and two notes on one URL can be separate
      // threads.
      thread: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).default([]),
      image: z.string().optional(),
      draft: z.boolean().default(false),
      hide: z.boolean().default(false),
    })
    .refine((data) => data.type !== 'link' || !!data.link, {
      message: 'type: link 인 글에는 link 필드가 필요합니다.',
      path: ['link'],
    }),
});

// Standalone explainers, shown as a grid at /materials/ rather than in the
// stream. Their point is to be openable mid-conversation: one page that
// explains one thing without the surrounding blog.
//
// Two body shapes share the collection:
//   embed — a self-contained HTML page under public/, framed by the material
//           page. This is how a Claude artifact lands here unedited.
//   mdx   — the file's own body, rendered like a post.
const materials = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/materials' }),
  schema: z.object({
    title: z.string(),
    // Shown on the grid card and used as the page description. Also the only
    // text pagefind sees for an embedded material, since it can't read into
    // the iframe — worth writing properly.
    description: z.string(),
    // In frontmatter, not the filename: the grid is browsed by subject, so the
    // date is a detail on the card rather than the sort key that names the file.
    // YAML turns an unquoted 2026-08-27 into a Date, so both shapes are accepted
    // and normalized here rather than making every file remember the quotes.
    date: z
      .union([z.string(), z.date()])
      .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v))
      .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), {
        message: 'date 는 YYYY-MM-DD 형식이어야 합니다.',
      }),
    tags: z.array(z.string()).default([]),
    // Path under public/, e.g. /materials/argus-concurrency.html. When set, the
    // material page frames this file instead of rendering the body.
    embed: z.string().optional(),
    // Aspect ratio for an embedded material's frame, e.g. "16/9". Set it when
    // the embedded page fills its viewport instead of flowing top to bottom —
    // a slide deck has no document height to grow the frame to.
    aspect: z.string().optional(),
    // Grid thumbnail. Without one the card falls back to showing its title
    // large, the way an artifact with no preview does.
    thumb: z.string().optional(),
    // Held at the front of the grid: the ones reached for most often.
    pinned: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, materials };
