# Frontend Architecture — Zenika website (Astro, static)

Single source of truth for the Frontend agent. It is loaded on every frontend task, so keep it short. Longer rationale belongs in `docs/decisions/`.

Lines marked **[DECISION]** are defaults to confirm with the team. Change them here, not in individual plans.

## Stack

- Astro with `output: 'static'`, TypeScript in strict mode.
- Styling: Astro scoped `<style>` blocks plus global CSS custom properties (design tokens). No CSS framework. **[DECISION]**
- No UI framework integrations. No new dependencies or Astro integrations without approval.
- npm, Node LTS.

## Project Structure

```
src/
├── components/
│   ├── layout/      # Header, Footer, Nav, LanguageSwitcher, ThemeToggle, SkipLink
│   ├── sections/    # page sections (Hero, ClientLogos, ...)
│   └── ui/          # small reusable pieces (Button, Link, Card, ...)
├── content/         # page copy, one folder per locale
├── i18n/            # ui.ts (UI strings per locale), utils.ts (helpers)
├── layouts/         # BaseLayout.astro (html, head, SEO, shell)
├── pages/[lang]/    # one file per page, generated for every locale
└── styles/          # tokens.css, global.css
tests/
├── e2e/             # Playwright tests
└── a11y/            # axe checks per page
```

The root-level folders `01b-product-requirements/`, `02-static-prototyping/` and `04-dynamic-prototyping/` are workflow artifacts. They are not part of the site; never import from them.

## Components

- `.astro` components only. PascalCase filenames, one component per file.
- Props typed with `interface Props` in the component frontmatter.
- No hardcoded user-facing text: take it from props, content files, or i18n strings.
- Semantic HTML first; add ARIA only when no native element does the job.

## Pages, Content and i18n

- Locales are defined **only** in the `i18n` block of `astro.config.mjs`. Never hardcode a list of locales anywhere else. Locales: `fr` (default, content written in French first) and `en` (English translations follow). Singapore localisation is undecided.
- Every URL carries a locale prefix (`/en/...`). Use Astro's i18n routing config and `astro:i18n` helpers for locale-aware URLs; never build them by string concatenation.
- Every page lives in `src/pages/[lang]/` and uses `getStaticPaths` to generate one page per locale.
- Page copy lives in a content collection: `src/content/pages/{locale}/{page}.md`, with its schema in `src/content.config.ts`.
- UI strings (nav labels, button text, aria-labels) live in `src/i18n/ui.ts`, keyed by locale, and are read through a `t()` helper in `src/i18n/utils.ts`.
- Every page must exist in every locale. A missing translation is a build error, not a silent fallback. **[DECISION]**
- Every page sets `<html lang>` and `hreflang` alternate links for all locales.

## Styling and Design Tokens

- `src/styles/tokens.css` defines all colours, the spacing scale, the type scale, radii, shadows, and motion durations/easings as CSS custom properties.
- Tokens come from Figma when designs exist. Never invent brand colours or fonts; if a value is missing, ask and add a token.
- Components use only `var(--token)`. No raw hex/rgb values, pixel font sizes, or one-off magic numbers.
- Mobile-first: base styles target small screens; enhance with `min-width` media queries.
- Breakpoints (CSS custom properties do not work inside media queries, so use these fixed values): 640px, 1024px, 1280px. **[DECISION]**

## Dark Mode

- Light values on `:root`, dark values on `:root[data-theme="dark"]`.
- Default follows `prefers-color-scheme`. The user's choice is stored in `localStorage` and applied by a tiny `is:inline` script in `<head>`, before first paint, so the page never flashes the wrong theme.
- Without JavaScript, dark values also apply through `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { ... } }`. Keep these values identical to the `[data-theme="dark"]` block; a test checks that they match.
- The toggle is a `<button>` whose accessible name states the action or current state.
- Both themes must meet contrast requirements.

## Motion and Page Transitions

- Page transitions use native cross-document View Transitions, enabled in `global.css` with `@view-transition { navigation: auto; }`. No client-side router. **[DECISION]** Browsers without support simply navigate normally.
- Use `view-transition-name` only on elements shared between pages (e.g. header, logo).
- All animation is CSS. Animate `transform` and `opacity` only. Durations and easings come from tokens.
- Every animation and transition is removed or reduced under `@media (prefers-reduced-motion: reduce)`.

## JavaScript

- Default: none. Allowed uses: theme toggle, mobile navigation toggle, small enhancements to the language switcher.
- Put scripts in the component's `<script>` tag, written in TypeScript with no dependencies. Use `is:inline` only for the pre-paint theme script.
- Progressive enhancement: navigation and language switching must work as plain links without JavaScript.

## Accessibility (WCAG 2.2 AA)

- Landmarks (`header`, `nav`, `main`, `footer`), one `<h1>` per page, no skipped heading levels.
- A skip link is the first focusable element.
- Visible focus styles, taken from tokens. Never remove an outline without a replacement.
- Interactive targets are at least 24×24 CSS px.
- Images have meaningful `alt` text from content; decorative images use `alt=""`.
- Language switcher options carry `lang` and `hreflang` attributes.

## Performance and SEO

- Images use `<Image />` from `astro:assets` with explicit dimensions, so there is no layout shift.
- Fonts are configured with the Astro Fonts API (`fonts` in `astro.config.mjs`, `<Font />` in `BaseLayout`): fetched at build time and served from this site, at most two families, with `font-display: swap`. No font CDNs at runtime, and no font files committed.
- Every page has a unique title, meta description, canonical URL, `hreflang` links, and Open Graph tags, all set through `BaseLayout` props.
- Target Lighthouse (mobile) of 95 or higher for performance, accessibility, best practices, and SEO on every page. **[DECISION]**

## Contact

- The MVP contact page uses `mailto:info@zenika.com`. No forms and no backend.

## Quality Gate

| Check | Command |
| --- | --- |
| Lint | `npm run lint` |
| Type and Astro check | `npm run check` |
| Build | `npm run build` |
| End-to-end and accessibility tests | `npm run test:e2e` |

Run the whole gate after every step. If a script does not exist yet, report it as missing; do not invent a substitute command. Never weaken, skip, or delete a test to make the gate pass.

## Frontend Plan Format

Save to `docs/plans/[feature-slug]-frontend.md`:

```markdown
# [Feature] — Frontend Plan

## Sources
PRD, wireframe, demo, and design links used. Conflicts found and how they were resolved.

## Scope
Pages/routes and locales affected. What is out of scope.

## Files
| Path | New / Modified | Purpose |

## Content and i18n
Content files and UI string keys to add, per locale.

## Tokens
New tokens needed (or "None").

## JavaScript
"None", or what script is added and why HTML/CSS cannot do it.

## Accessibility Notes

## Steps
- [ ] 1. [small step] — Risk: low (new files only) / medium (modifies shared layout, tokens, or config)
- [ ] 2. ...

## Test Plan
Gate commands plus the new e2e and a11y tests.

## Open Questions
```

## Implementation Checklist

For each step in the approved plan:

1. Implement that step only.
2. Run the quality gate.
3. If anything that passed before now fails, fix it before moving on.
4. Tick the step in the plan file.

Before finishing, check every changed page in both themes, in every locale, at 375px and 1280px wide, using the keyboard only.

## Handover Format

```markdown
## Frontend Handover

### Summary

### Files Changed

### Content and i18n Keys Added

### Self-Review
- [ ] No hardcoded user-facing text
- [ ] Tokens only — no raw colours, sizes, or spacing
- [ ] No new dependencies or integrations
- [ ] JavaScript is absent or justified, and the page works without it
- [ ] Reduced-motion behaviour verified
- [ ] Keyboard navigation and focus verified
- [ ] Both themes and all locales checked

### Test Result
- Status: PASS | FAIL
- Command:
- Notes:

### Follow-ups
```
