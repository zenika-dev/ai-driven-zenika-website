import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Page copy: src/content/pages/{locale}/{page}.md, entry id `{locale}/{page}`. */
const pages = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/pages',
    // Keep `{locale}/index` rather than the default slug, which collapses it to `{locale}`.
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
});

export const collections = { pages };
