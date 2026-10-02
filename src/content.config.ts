import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';

const heading = {
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  intro: z.string().min(1),
};

/** Copy for the Presentation page sections, top to bottom. */
const labelledList = z.object({
  label: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});

const presentation = ({ image }: SchemaContext) =>
  z.object({
    hero: z.object({
      label: z.string().min(1),
      intro: z.string().min(1),
      heading: z.string().min(1),
      highlight: z.string().min(1),
      primaryCta: z.string().min(1),
      secondaryCta: z.string().min(1),
      image: image(),
      imageAlt: z.string().min(1),
    }),
    expertises: z.object({
      eyebrow: z.string().min(1),
      heading: z.string().min(1),
      highlight: z.string().min(1),
      conclusion: z.string().min(1),
      conclusionHighlight: z.string().min(1),
      problems: labelledList,
      outcomes: labelledList,
      levers: z.array(z.object({ title: z.string().min(1), text: z.string().min(1) })).length(3),
    }),
    approach: z.object({
      eyebrow: z.string().min(1),
      heading: z.string().min(1),
      commitments: z.array(z.string().min(1)).min(1),
    }),
    values: z.object({
      eyebrow: z.string().min(1),
      heading: z.string().min(1),
      highlight: z.string().min(1),
      paragraphs: z.array(z.string().min(1)).min(1),
      list: z.array(z.string().min(1)).min(1),
      closing: z.string().min(1),
      stats: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })).length(4),
    }),
    clients: z.object({
      eyebrow: z.string().min(1),
      heading: z.string().min(1),
      points: z.array(z.string().min(1)).min(1),
      names: z.array(z.string().min(1)).min(1),
    }),
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
  schema: (context) =>
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      presentation: presentation(context).optional(),
      contact: contact.optional(),
    }),
});

export const collections = { pages };
