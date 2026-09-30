import type { AstroUserConfig } from 'astro';
import config from '../../astro.config.mjs';
import { pagePath, pages } from '../../src/i18n/routes';

const i18n: AstroUserConfig['i18n'] = config.i18n;
if (!i18n) throw new Error('astro.config.mjs has no i18n block');

export const defaultLocale = i18n.defaultLocale;
export const locales = i18n.locales.map((locale) =>
  typeof locale === 'string' ? locale : locale.path,
);

export function pageUrl(locale: string, page: (typeof pages)[number]): string {
  return `/${locale}/${pagePath(page)}`;
}

/** Every page in every locale. */
export const routes = locales.flatMap((locale) =>
  pages.map((page) => ({ locale, page, url: pageUrl(locale, page) })),
);
