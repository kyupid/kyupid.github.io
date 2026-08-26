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

export const collections = { posts };
