import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { siteData } from '../data/siteData';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts')).filter((p) => !p.data.draft);
  return rss({
    title: `${siteData.name} — Writing`,
    description: 'Notes on ML, computer vision, LLMs, cloud, and systems.',
    site: context.site!,
    items: posts
      .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: `/writing/${post.id}/`,
      })),
  });
}
