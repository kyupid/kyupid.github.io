import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '@config';
import { getPublishedPosts, getPostPath, getDateFromId, getExcerpt } from '@utils/posts';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description || getExcerpt(p.body || ''),
      pubDate: new Date(getDateFromId(p.id) + 'T00:00:00'),
      link: getPostPath(p),
    })),
  });
}
