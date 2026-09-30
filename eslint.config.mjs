// @ts-check
import { defineConfig } from 'eslint/config';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      '01b-*/',
      '02-*/',
      '04-*/',
      'dist/',
      '.astro/',
      'node_modules/',
      'test-results/',
      'playwright-report/',
    ],
  },
  tseslint.configs.strict,
  astro.configs.recommended,
);
