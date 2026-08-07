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
    items: posts.map((p) => {
      const isLink = p.data.type === 'link';
      // Links carry their whole note; entries get a teaser.
      const body = p.data.description || getExcerpt(p.body || '', isLink ? 400 : 160);
      return {
        title: p.data.title,
        // <link> stays the permalink even for links, so readers that dedupe or
        // count by URL see this site. The source goes in the body instead.
        description: isLink ? `${body}\n\n원문: ${p.data.link}` : body,
        pubDate: new Date(getDateFromId(p.id) + 'T00:00:00'),
        link: getPostPath(p),
      };
    }),
  });
}
