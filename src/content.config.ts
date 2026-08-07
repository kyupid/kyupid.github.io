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
      // No id field: the URL is /<type>/<slug>/, and the slug comes from the
      // filename, so nothing here has to be assigned by hand.
      type: z.enum(['entry', 'link']).default('entry'),
      title: z.string(),
      // The source URL. Required for `type: link`, unused otherwise.
      link: z.string().url().optional(),
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
