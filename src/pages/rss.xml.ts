import rss from '@astrojs/rss';
import { SITE } from '../consts';
import { getAllPublishedPosts } from '../lib/content';

export async function GET(context) {
  const posts = await getAllPublishedPosts();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.title,
      description: post.description,
      pubDate: post.pubDate,
      link: post.url,
      categories: post.tags,
    })),
  });
}
