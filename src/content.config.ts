import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Single stream of posts. Date + slug come from the filename (YYYY-MM-DD-title),
// so frontmatter stays minimal.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/posts' }),
  schema: z.object({
    // Numeric permalink id → URL is /<id>/. Assign the next integer per post (auto-increment).
    id: z.number().int().positive(),
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    draft: z.boolean().default(false),
    hide: z.boolean().default(false),
  }),
});

export const collections = { posts };
