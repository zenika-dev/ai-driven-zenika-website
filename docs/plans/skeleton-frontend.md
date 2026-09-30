# Skeleton — Frontend Plan

## Sources

- **PRD:** none. **Wireframe:** none. **Demo:** none. **Design/Figma:** none. The user confirmed we build from the task description alone.
- **Rules:** `.github/skills/frontend/references/architecture.md` and `.github/agents/frontend.agent.md`.
- **Existing code:** none. `src/` does not exist yet, so this plan follows `architecture.md` alone.
- **Conflicts:** no conflicts between sources. Constraints found in the environment:
  - Local Node is **v18.19.1**, but `astro@7` needs `>=22.12.0` (the same applies to `prettier-plugin-astro`). Node must be upgraded before step 1 (see Open Questions).
  - `typescript@latest` is 7.x, but `@astrojs/check` supports only `^5 || ^6` and `typescript-eslint` supports only `<6.1`. Pin **`typescript@~6.0`**.
  - `astro` itself is not on the approved dev-dependency list. It is the stack, so it goes in as the only runtime `dependency`.
  - `@eslint/js` and `globals` are **not** approved. The ESLint config uses only `typescript-eslint` and `eslint-plugin-astro` presets.

Package versions at the time of planning: astro 7.3.5, @astrojs/check 0.9.10, typescript 6.0.3, eslint 10.11.0, eslint-plugin-astro 3.2.1, typescript-eslint 8.71.0, prettier 3.9.9, prettier-plugin-astro 1.1.0, @playwright/test 1.63.0, @axe-core/playwright 4.13.0.

## Scope

**Routes** (static, one per locale for `en` and `fr`):

| Route | Page | In nav |
| --- | --- | --- |
| `/` | Redirects to `/en/` (meta refresh) | — |
| `/{lang}/` | Presentation | Yes |
| `/{lang}/expertise/` | Expertise | No (hidden) |
| `/{lang}/clients/` | Clients | No (hidden) |
| `/{lang}/publications/` | Publications | No (hidden) |
| `/{lang}/contact/` | Contact (`mailto:info@zenika.com`) | Yes |

**Cross-cutting concerns wired in:** config and i18n routing, tooling, the quality gate, placeholder tokens, light and dark themes, BaseLayout with SEO, the shell components, the content collection, UI strings, View Transitions, and smoke and a11y tests.

**Out of scope:** real copy, images (so there is no `og:image`), brand colours and fonts, Figma, decorative animations, a contact form, CI/CD, deployment, and a JavaScript hamburger menu.

## Files

| Path | New / Modified | Purpose |
| --- | --- | --- |
| `.nvmrc` | New | Pins Node 22 LTS (22.12 or later) |
| `.gitignore` | New | Ignores `node_modules`, `dist`, `.astro`, `test-results`, `playwright-report` |
| `package.json` / `package-lock.json` | New | Dependencies and the `dev`, `preview`, `format`, `lint`, `check`, `build`, `test:e2e` scripts |
| `astro.config.mjs` | New | `output: 'static'`, `site`, and the `i18n` block (the **only** place locales are listed) |
| `tsconfig.json` | New | Extends `astro/tsconfigs/strict` |
| `eslint.config.mjs` | New | Flat config: typescript-eslint and eslint-plugin-astro, plus ignores |
| `.prettierrc.json` | New | Loads prettier-plugin-astro |
| `.prettierignore` | New | `01b-*`, `02-*`, `04-*` and build output |
| `playwright.config.ts` | New | `testDir: tests`, a `webServer` that builds and runs `astro preview`, Chromium projects at 1280px and 375px |
| `src/pages/index.astro` | New | Static redirect from `/` to the default-locale home |
| `src/pages/[lang]/index.astro` | New | Presentation page |
| `src/pages/[lang]/expertise.astro` | New | Expertise stub (hidden from nav) |
| `src/pages/[lang]/clients.astro` | New | Clients stub (hidden from nav) |
| `src/pages/[lang]/publications.astro` | New | Publications stub (hidden from nav) |
| `src/pages/[lang]/contact.astro` | New | Contact stub plus the mailto link |
| `src/i18n/ui.ts` | New | UI strings keyed by locale |
| `src/i18n/utils.ts` | New | `t()`, `getLocales()`, `getLocalePaths()` (for `getStaticPaths`), `getPage()` (throws on a missing translation) |
| `src/content.config.ts` | New | `pages` collection: glob loader and zod schema |
| `src/content/pages/{en,fr}/{index,expertise,clients,publications,contact}.md` | New | 10 placeholder stubs |
| `src/styles/tokens.css` | New | Placeholder tokens, light values plus `[data-theme="dark"]` |
| `src/styles/global.css` | New | Reset, base typography, focus ring, View Transitions, reduced motion |
| `src/layouts/BaseLayout.astro` | New | html/head/SEO, the no-flash theme script, and the shell |
| `src/components/layout/SkipLink.astro` | New | First focusable element, targets `#main` |
| `src/components/layout/Header.astro` | New | Site name link, Nav, LanguageSwitcher, ThemeToggle; `view-transition-name: site-header` |
| `src/components/layout/Nav.astro` | New | Presentation and Contact links; `aria-current="page"` |
| `src/components/layout/LanguageSwitcher.astro` | New | Links to the same page in each locale, with `lang` and `hreflang` |
| `src/components/layout/ThemeToggle.astro` | New | `<button aria-pressed>`; hidden until its script runs |
| `src/components/layout/Footer.astro` | New | Placeholder footer text from `ui.ts` |
| `tests/helpers/routes.ts` | New | Gets locales from `astro.config.mjs` and routes from `src/pages/[lang]/*.astro`, so coverage grows on its own as pages are added |
| `tests/e2e/smoke.spec.ts` | New | Every page in every locale returns 200 and has one `<h1>`; `/` redirects |
| `tests/e2e/seo.spec.ts` | New | `lang`, canonical, hreflang (+ x-default), OG tags |
| `tests/e2e/shell.spec.ts` | New | Skip link, nav contents, language switcher, mobile nav without JS at 375px |
| `tests/e2e/theme.spec.ts` | New | System default, toggle, persistence, no flash |
| `tests/e2e/motion.spec.ts` | New | View Transitions CSS present, and disabled under reduced motion |
| `tests/a11y/axe.spec.ts` | New | axe (WCAG 2.2 AA tags) on every page × locale × {light, dark} |

`README.md` is left unchanged except for a short "Getting started" section (Node version, `npm ci`, `npx playwright install chromium`, gate commands) in step 1.

## Content and i18n

**Collection schema** (`src/content.config.ts`, `import { z } from 'astro/zod'`):

```ts
pages: defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({ title: z.string().min(1), description: z.string().min(1) }),
})
```

Entry IDs are `{locale}/{page}`. `getPage(lang, page)` throws when an entry is missing, so a missing translation **fails the build** (the "every page must exist in every locale" rule).

**Stubs** (10 files). Each has frontmatter only: a `title`, and a `description` that starts with `[PLACEHOLDER]`, for example:

```md
---
title: Expertise
description: "[PLACEHOLDER] One-line description of Zenika's expertise."
---
```

French stubs get French titles (`Présentation`, `Expertise`, `Clients`, `Publications`, `Contact`) with the same `[PLACEHOLDER]` marker.

**UI string keys** (`src/i18n/ui.ts`, identical key set for `en` and `fr`, type-checked so a missing key in `fr` is a type error):

| Key | en | fr |
| --- | --- | --- |
| `site.name` | Zenika | Zenika |
| `skipLink` | Skip to main content | Aller au contenu principal |
| `nav.label` | Main | Principale |
| `nav.index` | Presentation | Présentation |
| `nav.contact` | Contact | Contact |
| `langSwitcher.label` | Language | Langue |
| `lang.name` | English | Français |
| `theme.toggle` | Dark theme | Thème sombre |
| `footer.placeholder` | [PLACEHOLDER] Footer | [PLACEHOLDER] Pied de page |
| `contact.emailLabel` | Email us | Écrivez-nous |
| `contact.email` | info@zenika.com | info@zenika.com |
| `meta.ogLocale` | en_GB | fr_FR |

`t(lang)` returns a typed lookup, `(key) => string`. Locales come from `astro:config/client` (`i18n.locales`) and are never hardcoded. `ui.ts` is typed as `Record<Locale, Strings>`, where `Locale` comes from the config, so adding a locale to the config without strings fails `npm run check`.

## Tokens

All new, in `src/styles/tokens.css`. Each group carries a `/* PLACEHOLDER — replace from Figma */` comment. Values are neutral greys and system fonts only.

- **Colour** (light on `:root`, dark on `:root[data-theme="dark"]`): `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-link`, `--color-link-hover`, `--color-focus`. Each pair meets 4.5:1 for text and 3:1 for the focus ring and borders. Also `color-scheme: light` / `dark`.
- **Spacing:** `--space-1` … `--space-8` (rem scale).
- **Type:** `--font-family-base` (system-ui stack), `--font-size-sm/base/lg/xl/2xl` (rem), `--line-height-base/tight`.
- **Radii:** `--radius-sm`, `--radius-md`.
- **Shadows:** `--shadow-sm`.
- **Focus:** `--focus-ring-width`, `--focus-ring-offset`.
- **Layout:** `--layout-max-width`, `--target-min` (24px minimum target size).
- **Motion:** `--duration-fast`, `--duration-base`, `--easing-standard`.

## JavaScript

Two scripts, both allowed by `architecture.md`:

1. **No-flash theme script** (`is:inline` in `<head>` of `BaseLayout`, about 10 lines). It reads `localStorage.theme`, falls back to `matchMedia('(prefers-color-scheme: dark)')`, and sets `document.documentElement.dataset.theme` before first paint. It must be inline and blocking, because a bundled module runs after paint and causes a flash. localStorage access is wrapped in try/catch.
2. **ThemeToggle** (`<script>` in the component, TypeScript, no dependencies). It flips `data-theme`, writes `localStorage`, updates `aria-pressed`, and removes the button's `hidden` attribute so the button only appears when it can work.

**Mobile navigation needs no JavaScript.** With two nav links, the header uses a wrapping flex layout at 375px (nav, language switcher and toggle wrap onto a second row). No hamburger menu. A disclosure menu is deferred until the nav grows or Figma defines one.

**Without JavaScript:** the theme stays light (the toggle is hidden), and all navigation and language switching still work as plain links.

## Accessibility Notes

- Landmarks: `header`, `nav[aria-label]` (main nav and the language switcher both labelled), `main#main`, `footer`. One `<h1>` per page (the page `title`), no skipped levels.
- SkipLink is the first focusable element. It is visually hidden until it receives focus, and targets `#main` (`tabindex="-1"` on main).
- Focus: `:focus-visible` outline from `--color-focus`, `--focus-ring-width` and `--focus-ring-offset`, never removed.
- Targets are at least `--target-min` (24×24 px) for links in the nav, the switcher and the toggle.
- Language switcher: each link has `lang` and `hreflang`; the current locale has `aria-current="true"`.
- ThemeToggle: a native `<button>` with a fixed name ("Dark theme") and `aria-pressed` to show the state.
- Nav: `aria-current="page"` on the active link.
- axe runs on every page, in both locales and both themes, with tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`. Any violation fails the test.

## Steps

The gate (`lint`, `check`, `build`, `test:e2e`) is fully runnable from **step 1**. The tests find locales and routes automatically, so every later page is covered by the smoke and axe tests with no test edits.

- [ ] 0. **Prerequisite:** switch to Node 22 LTS (22.12 or later), for example with `nvm install 22 && nvm use`. Nothing else can run until this is done. — Risk: low (environment only)
- [ ] 1. **Bootstrap and quality gate.** Create `package.json` (`"type": "module"`, `engines.node >=22.12`), install `astro` and the approved dev dependencies (`typescript@~6.0`), and run `npx playwright install chromium`. Add `astro.config.mjs` (static output; `site` placeholder; `i18n: { locales: ['en','fr'], defaultLocale: 'en', routing: { prefixDefaultLocale: true, redirectToDefaultLocale: true } }`), `tsconfig.json`, the ESLint and Prettier config and ignores, `.gitignore`, `.nvmrc`, and `playwright.config.ts`. Add the scripts: `lint` = `eslint . && prettier --check .`, `check` = `astro check`, `build` = `astro build`, `test:e2e` = `playwright test`. Add a minimal `src/pages/[lang]/index.astro` (plain `<h1>` via `getStaticPaths` over the config locales), `src/pages/index.astro` (`Astro.redirect(getRelativeLocaleUrl(defaultLocale))`, which is emitted as a static meta-refresh page), `tests/helpers/routes.ts`, `tests/e2e/smoke.spec.ts`, and `tests/a11y/axe.spec.ts` (light and dark via `emulateMedia`). Run the full gate. — Risk: **medium** (all project config; also checks that `redirectToDefaultLocale` and the static redirect behave as expected under Astro 7)
- [ ] 2. **i18n utilities.** Add `src/i18n/ui.ts` (all keys above) and `src/i18n/utils.ts` (`t`, `getLocales`, `getLocalePaths`). Refactor `[lang]/index.astro` to use `getLocalePaths()` and `t()`. — Risk: low (new files, and a one-line change to the stub page)
- [ ] 3. **Content collection.** Add `src/content.config.ts`, the 10 stub `.md` files, and `getPage()`. Render `title` as `<h1>` and `description` as `<p>` on the index page. Check once by hand that deleting a `fr` stub fails `npm run build`, then restore it. — Risk: low (new files only)
- [ ] 4. **Tokens and global styles.** Add `src/styles/tokens.css` (light and dark, grouped, with PLACEHOLDER comments) and `src/styles/global.css` (reset, base type, link and focus styles, all using tokens). Not imported anywhere yet. — Risk: medium (shared tokens that every later component depends on)
- [ ] 5. **BaseLayout.** Add `src/layouts/BaseLayout.astro` with `interface Props { title; description; locale }`. It imports tokens and global CSS, sets `<html lang>`, `<title>`, meta description, canonical (`getAbsoluteLocaleUrl`), `hreflang` alternates for each locale plus `x-default`, and OG tags (`og:type`, `og:title`, `og:description`, `og:url`, `og:locale`, `og:locale:alternate`), and includes the inline no-flash theme script. Move the index page onto it. Add `tests/e2e/seo.spec.ts`. — Risk: medium (shared layout)
- [ ] 6. **Shell components.** Add SkipLink, Header, Nav (Presentation and Contact only), LanguageSwitcher, and Footer, and wire them into BaseLayout with `<main id="main" tabindex="-1">`. Mobile-first styles with `min-width: 640px` enhancements. Add `tests/e2e/shell.spec.ts`: the skip link is the first Tab stop, the nav has exactly two links, the switcher goes to the same page in the other locale, and with **JavaScript disabled at 375×812** all nav and switcher links are visible, clickable, and cause no horizontal overflow. — Risk: medium (shared layout)
- [ ] 7. **ThemeToggle.** Add the component and its script, and put it in the Header. Add `tests/e2e/theme.spec.ts`: follows the system dark preference, the toggle flips `data-theme` and `aria-pressed`, the choice survives navigation and reload, and `data-theme` is set before `DOMContentLoaded`. — Risk: low (new component; a one-line Header edit)
- [ ] 8. **Remaining routes.** Add `expertise.astro`, `clients.astro`, `publications.astro`, and `contact.astro` under `src/pages/[lang]/`, each on BaseLayout with `getPage()`. Contact adds `<a href="mailto:{t('contact.email')}">{t('contact.emailLabel')}</a>`. The smoke and axe tests pick these up automatically. Extend `smoke.spec.ts` to check the mailto `href` and that hidden routes are absent from the nav. — Risk: low (new files only)
- [ ] 9. **Page transitions.** In `global.css`, add `@view-transition { navigation: auto; }` and `view-transition-name: site-header` on the header. Under `@media (prefers-reduced-motion: reduce)`, add `@view-transition { navigation: none; }`, and set `animation: none` / `transition: none` on `*`, `::before`, `::after` and `::view-transition-*`. Add `tests/e2e/motion.spec.ts` (with `reducedMotion: 'reduce'`, computed transition and animation durations are 0, and the header has its transition name). — Risk: medium (global CSS)
- [ ] 10. **Final pass.** Keyboard-only check in both themes, both locales, at 375px and 1280px. Update the README "Getting started" section. Run the full gate and write the handover. — Risk: low

## Test Plan

**Gate** (run after every step from step 1): `npm run lint`, `npm run check`, `npm run build`, `npm run test:e2e`.

**Playwright setup:** `webServer` runs `npm run build && npm run preview` (so `test:e2e` works on its own and always tests a fresh build) on port 4321 with `reuseExistingServer: !process.env.CI`. Projects: `chromium-desktop` (1280×800) and `chromium-mobile` (375×812).

**Tests added:**

| File | Covers |
| --- | --- |
| `tests/e2e/smoke.spec.ts` | Every route × locale returns 200, has one `<h1>`, and the correct `<html lang>`; `/` ends on `/en/`; contact mailto; the nav shows only Presentation and Contact |
| `tests/e2e/seo.spec.ts` | Unique `<title>` and description per page; canonical is absolute and self-referencing; hreflang for all locales plus `x-default`; OG tags present |
| `tests/e2e/shell.spec.ts` | Skip link comes first and moves focus to main; `aria-current`; the language switcher keeps the same page; nav works at 375px with JavaScript disabled, with no horizontal scroll |
| `tests/e2e/theme.spec.ts` | System default, toggle, persistence, no flash; toggle hidden when JavaScript is off |
| `tests/e2e/motion.spec.ts` | `view-transition-name` on the header; animations and transitions are removed under reduced motion |
| `tests/a11y/axe.spec.ts` | axe WCAG 2.2 AA on every route × locale × {light, dark}; zero violations |

## Open Questions

1. **Node version (blocking).** Local Node is 18.19.1; Astro 7 needs 22.12 or later. Should I pin **Node 22 LTS** in `.nvmrc`, or do you prefer 24?
2. **`site` URL.** Canonical, hreflang and OG URLs must be absolute. Should I use `https://www.zenika.com` as a placeholder until deployment is decided?
3. **Mobile nav pattern.** The plan uses a wrapping header with no hamburger menu (two links fit at 375px, zero JavaScript). Is that acceptable for the skeleton, with a disclosure menu to come with Figma?
4. **No-JS dark mode.** Following `architecture.md`, dark values sit only under `[data-theme="dark"]`, so visitors without JavaScript always get the light theme. Is that acceptable, or should the dark values also sit under `@media (prefers-color-scheme: dark)` (duplicated values)?
5. **Extra npm scripts.** Besides the four required scripts, the plan adds `dev`, `preview` and `format`. Is that OK?
6. **Playwright browsers.** Chromium only for now (cross-document View Transitions are Chromium/Safari only anyway). Should WebKit be added now or later?
