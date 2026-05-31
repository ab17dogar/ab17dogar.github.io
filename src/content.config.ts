import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// NOTE: Projects are no longer a local content collection — they are synced from
// GitHub at build time (see src/lib/github-projects.ts), driven by each repo's
// `portfolio-content.md`.

const research = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/research' }),
  schema: z.object({
    title: z.string(),
    abstract: z.string(),
    venue: z.string(),
    year: z.number(),
    link: z.string().url().optional(),
    pdf: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { research, posts };
