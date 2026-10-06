/**
 * Page registry. Every file in src/pages/[lang]/ has an entry here.
 * Kept free of `astro:*` imports so Playwright tests can import it.
 */
export const pages = ['index', 'expertise', 'clients', 'publications', 'contact'] as const;

export type Page = (typeof pages)[number];

/** Pages shown in the main navigation, in order. The others exist but are hidden. */
export const navPages = ['index'] as const satisfies readonly Page[];

/** Page the header call-to-action button links to. */
export const ctaPage: Page = 'contact';

export type NavPage = (typeof navPages)[number];

/** Header nav entries: sections of the home page, in order. `id` is the section's anchor. */
export const navSections = [
  'values',
  'services',
  'methodology',
  'clients',
  'publications',
] as const;

export type NavSection = (typeof navSections)[number];

/** Path of a page relative to its locale root, as passed to `getRelativeLocaleUrl`. */
export function pagePath(page: Page): string {
  return page === 'index' ? '' : `${page}/`;
}
