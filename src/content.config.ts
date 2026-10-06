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
const text = z.string().min(1);

const presentation = ({ image }: SchemaContext) =>
  z.object({
    hero: z.object({
      label: text,
      heading: text,
      highlight: text,
      intro: text,
      primaryCta: text,
      secondaryCta: text,
      image: image(),
      imageAlt: text,
    }),
    values: z.object({
      eyebrow: text,
      heading: text,
      highlight: text,
      lead: text,
      text,
      stats: z.array(z.object({ value: text, label: text })).length(4),
    }),
    services: z.object({
      ...heading,
      items: z.array(z.object({ tag: text, title: text, text })).length(3),
    }),
    methodology: z.object({
      eyebrow: text,
      heading: text,
      highlight: text,
      intro: text,
      levers: z.array(z.object({ title: text, text })).length(3),
    }),
    clients: z.object({
      ...heading,
      names: z.array(text).min(1),
    }),
    publications: z.object({
      ...heading,
      items: z.array(z.object({ kind: text, title: text })).length(3),
    }),
  });

/** Copy for the "Parlons-nous" block, shown on the Contact page and at the end of Presentation. */
const field = z.object({ label: text, placeholder: text });
const contact = z.object({
  ...heading,
  ctaLabel: text,
  form: z.object({ name: field, email: field, company: field, project: field, subject: text }),
});

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
