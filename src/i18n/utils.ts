import { getEntry } from 'astro:content';
import { i18n } from 'astro:config/client';
import { getRelativeLocaleUrl, toCodes } from 'astro:i18n';
import type { Page } from './routes';
import { ui, type UIKey } from './ui';

function config() {
  if (!i18n) throw new Error('i18n is not configured in astro.config.mjs');
  return i18n;
}

/** Locale codes, in the order declared in astro.config.mjs. */
export function getLocales(): string[] {
  return toCodes(config().locales);
}

export function getDefaultLocale(): string {
  return config().defaultLocale;
}

/** `getStaticPaths` result that generates one page per locale. */
export function getLocalePaths() {
  return getLocales().map((lang) => ({ params: { lang } }));
}

/** Returns a lookup for the UI strings of `lang`. Fails the build if the locale has no strings. */
export function t(lang: string): (key: UIKey) => string {
  const strings = ui[lang];
  if (!strings) throw new Error(`Missing UI strings for locale "${lang}" in src/i18n/ui.ts`);
  return (key) => strings[key];
}

/** Page copy for `page` in `lang`. A missing translation fails the build. */
export async function getPage(lang: string, page: Page) {
  const entry = await getEntry('pages', `${lang}/${page}`);
  if (!entry) throw new Error(`Missing content: src/content/pages/${lang}/${page}.md`);
  return entry.data;
}

/** Path of the current page below its locale root, e.g. "contact/" for /fr/contact/. */
export function getPagePath(url: URL, locale: string): string {
  return url.pathname.slice(getRelativeLocaleUrl(locale).length);
}
