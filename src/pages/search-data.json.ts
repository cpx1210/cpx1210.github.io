import type { APIRoute } from 'astro';
import { getAllPublishedPosts } from '../lib/content';

export const GET: APIRoute = async () => {
  const posts = await getAllPublishedPosts();

  const payload = posts.map((post) => ({
    title: post.title,
    description: post.description,
    url: post.url,
    section: post.section,
    category: post.category,
    tags: post.tags,
    content: post.contentText.slice(0, 2400),
  }));

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
