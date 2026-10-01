import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const heading = {
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  intro: z.string().min(1),
};

/** Copy for the Presentation page sections, top to bottom. */
const presentation = z.object({
  hero: z.object({
    label: z.string().min(1),
    heading: z.string().min(1),
    highlight: z.string().min(1),
    intro: z.string().min(1),
    primaryCta: z.string().min(1),
    secondaryCta: z.string().min(1),
    imageAlt: z.string().min(1),
  }),
  about: z.object({
    eyebrow: z.string().min(1),
    heading: z.string().min(1),
    highlight: z.string().min(1),
    lead: z.string().min(1),
    body: z.string().min(1),
    stats: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })).length(4),
  }),
  offers: z.object({
    ...heading,
    items: z
      .array(z.object({ badge: z.string().min(1), title: z.string().min(1), text: z.string() }))
      .length(3),
  }),
  approach: z.object({
    ...heading,
    items: z.array(z.object({ title: z.string().min(1), text: z.string().min(1) })).length(3),
  }),
  clients: z.object({ ...heading, names: z.array(z.string().min(1)).min(1) }),
  publications: z.object({
    ...heading,
    items: z.array(z.object({ kind: z.string().min(1), title: z.string().min(1) })).length(3),
  }),
});

/** Copy for the "Parlons-nous" block, shown on the Contact page and at the end of Presentation. */
const contact = z.object({ ...heading, ctaLabel: z.string().min(1) });

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
    presentation: presentation.optional(),
    contact: contact.optional(),
  }),
});

export const collections = { pages };
