// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  // Placeholder until deployment is decided.
  site: 'https://www.zenika.com',
  trailingSlash: 'always',
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
});
