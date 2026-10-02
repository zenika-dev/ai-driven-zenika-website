# MVP Pages (Presentation + Contact) — Frontend Plan

## Sources

- **PRDs:** `01b-product-requirements/presentation-page-prd.md`, `01b-product-requirements/contact-page-prd.md`.
- **Design:** Figma file `KMB87FX50hnHWQiXugGlGN`, updated laptop (1440px), tablet (834px) and mobile (390px) frames, shared as PNG exports in chat and not kept in the repo. The Figma file itself cannot be read (no Dev Mode or MCP access), so token values are **sampled and measured from the PNG exports** and must be confirmed against Figma.
- **History:** a first build followed an earlier, outdated Figma frame (sections "Qui sommes-nous", "Ce que nous faisons", "Notre manière d'agir"). It was replaced by the updated design in steps 8–11.
- **Demo:** none.
- **Conflicts, resolved in the PRDs:**
  - The design's contact form becomes a mailto button.
  - The design's nav (Expertises, Méthodologie, Clients, Publications) is reduced to Présentation plus a "Nous contacter" button.
  - The design's footer link columns, social links and legal links are out of scope.

## Scope

- **Routes:** `/{lang}/` (Presentation) and `/{lang}/contact/` (Contact), for `fr` (default) and `en`.
- **Shell:**
  - **Header:** logo, Présentation link, FR / EN switcher, "Nous contacter" CTA button, theme toggle. Mobile: logo and controls only. Tablet: nav on its own second row.
  - **Footer:** logo, tagline and copyright line.
- **Unchanged:** the Expertise, Clients and Publications stubs (they pick up the shell automatically).
- **Out of scope:** the contact form, footer link columns and social links, Méthodologie, the "Découvrir" buttons on the expertise cards (until the Expertise page exists), the client-logo marquee (a static row in the MVP), decorative motion beyond the existing View Transitions, and analytics.

## Files

| Path                                            | New / Modified | Purpose                                                                                    |
| ----------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------ |
| `astro.config.mjs`                              | Modified       | Montserrat and Nunito via the Astro Fonts API                                              |
| `src/styles/tokens.css`                         | Modified       | Brand palette, contrast-corrected colours, responsive rhythm and type scale (see Tokens)   |
| `src/styles/global.css`                         | Modified       | Base type, `.section`, `.section--alt`, `.section--inverse` bands                          |
| `src/layouts/BaseLayout.astro`                  | Modified       | `<Font />` tags, favicon                                                                   |
| `src/content.config.ts`                         | Modified       | Typed `presentation` and `contact` blocks on the `pages` schema                            |
| `src/content/pages/{fr,en}/index.md`            | Modified       | Presentation copy for every section                                                        |
| `src/content/pages/{fr,en}/contact.md`          | Modified       | Contact copy                                                                               |
| `src/i18n/ui.ts`, `src/i18n/routes.ts`          | Modified       | Header, footer and contact UI keys; `navPages = ['index']`, `ctaPage = 'contact'`          |
| `src/i18n/utils.ts`                             | Modified       | `getPresentation` / `getContact` fail the build if a block is missing                      |
| `src/components/ui/Button.astro`                | New            | Link styled as a button: `primary` (red pill), `dark` (black pill), `ghost` (text + arrow) |
| `src/components/ui/Eyebrow.astro`               | New            | "01 / NOS EXPERTISES" label                                                                |
| `src/components/ui/Highlight.astro`             | New            | Heading text with one phrase in the brand colour; fails the build if the phrase is absent  |
| `src/components/ui/SectionHeading.astro`        | New            | Eyebrow, heading and intro; intro column fixed at 30rem from 1024px                        |
| `src/components/ui/Icon.astro`                  | New            | Inline decorative SVGs (arrow, moon, sun), `aria-hidden`                                   |
| `src/components/ui/Logo.astro`                  | New            | Logo image; light variant in dark mode and on always-dark surfaces                         |
| `src/components/sections/Hero.astro`            | New            | Label, context paragraph, h1 with highlight, 2 CTAs, photo                                 |
| `src/components/sections/Expertises.astro`      | New            | 01: two-part heading, problem / outcome lists, Optimiser / Innover / Transformer cards     |
| `src/components/sections/Approach.astro`        | New            | 02: heading and five numbered commitments (`<ol>`)                                         |
| `src/components/sections/Values.astro`          | New            | 03: history, values list, closing line, 4 stats (`<dl>`)                                   |
| `src/components/sections/Clients.astro`         | New            | 04: heading, four points, client name chips                                                |
| `src/components/sections/Publications.astro`    | New            | 05: 3 gradient cards with a decorative "Z" watermark                                       |
| `src/components/sections/ContactCta.astro`      | New            | 06: mailto block; always-dark on Presentation, themed on the Contact page                  |
| `src/components/layout/*.astro`                 | Modified       | Header, Nav, LanguageSwitcher, ThemeToggle and Footer to the design                        |
| `src/assets/brand/*`, `src/assets/images/*`     | New            | Logo (+ derived light variant) and hero photo                                              |
| `public/favicon.png`                            | New            | Favicon                                                                                    |
| `src/pages/[lang]/index.astro`, `contact.astro` | Modified       | Compose the sections                                                                       |
| `tests/e2e/presentation.spec.ts`                | New            | Section order, CTAs, anchors, content counts, fonts                                        |
| `tests/e2e/{shell,smoke,theme,seo}.spec.ts`     | Modified       | Header CTA, logo, one-row header, themed content, favicon                                  |

## Content and i18n

**Content schema** (`pages` collection). `title` and `description` stay required, and these blocks are optional:

- `presentation`:
  - `hero`: `{ label, intro, heading, highlight, primaryCta, secondaryCta, image, imageAlt }`
  - `expertises`: `{ eyebrow, heading, highlight, conclusion, conclusionHighlight, problems: { label, items }, outcomes: { label, items }, levers: [{ title, text }] ×3 }`
  - `approach`: `{ eyebrow, heading, commitments: string[] }`
  - `values`: `{ eyebrow, heading, highlight, paragraphs, list, closing, stats: [{ value, label }] ×4 }`
  - `clients`: `{ eyebrow, heading, points, names }`
  - `publications`: `{ eyebrow, heading, intro, items: [{ kind, title }] ×3 }`
- `contact`: `{ eyebrow, heading, intro, ctaLabel }`, used by the Contact page and by section 06 on the Presentation page.

**Copy:**

- **FR:** the design's text, as draft. Owner: Zenika marketing.
- **EN:** draft translations, marked with a review comment in each EN content file.

**UI keys** (fr/en): `header.cta`, `header.ctaShort`, `theme.toggle` (the toggle's `aria-label`), `footer.tagline`, `footer.copyright` (`{year}` filled at build), `contact.email`, `contact.emailLabel`.

## Tokens

Sampled and measured from the PNG exports; each group in `tokens.css` says so.

| Token                                     | Value                              | Use                                                    |
| ----------------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| `--brand-red`                             | `#dc1026` (design `#ee2238`)       | Highlights, eyebrows, primary button (AA on new cream) |
| `--brand-ink` / `--brand-black`           | `#0b0b0f` / `#000000`              | Text / dark sections and footer                        |
| `--brand-ink-raised`                      | `#16161d`                          | Cards on dark sections                                 |
| `--brand-cream`                           | `#f7f5f0`                          | Alternate sections                                     |
| `--color-text-muted`                      | `#5e5e5e`                          | Body text on light (5.95:1 on cream)                   |
| `--brand-teal` / `--brand-indigo`         | `#06c3a2` / `#8185ea`              | Glows, bullets, large stats                            |
| `--gradient-orange` / `-purple` / `-blue` | as design (purple start `#7e5fe2`) | Publication cards; ink text on orange and blue for AA  |
| `--color-watermark`                       | 15% of `--color-on-brand`          | Decorative "Z" on publication cards                    |
| `--layout-gutter`                         | 24 / 48 / 80px                     | Side margins at 390 / 834 / 1440px                     |
| `--section-padding-top` / `-bottom`       | 60–100px / 56–80px                 | Section rhythm                                         |
| `--font-size-3xl` / `-display` / `-2xl`   | 36–64 / 28–56 / 30–40px            | h1 / approach heading / h2                             |

**Dark theme:** derived from the design's dark sections (`--color-bg: #0b0b0f`, `--color-surface: #16161d`, white text, `#9a9aa0` muted, `#ff4d5e` red where the brand red fails contrast on dark).

**Fonts:** Montserrat (headings, labels, buttons) and Nunito (body), configured with the Astro Fonts API in `astro.config.mjs`: downloaded from Google Fonts at build time and served from this site, with `font-display: swap` and generated fallback metrics.

## JavaScript

No new JavaScript. The theme toggle keeps its existing script; anchors (`#expertises`) and CTAs are plain links.

## Accessibility Notes

- One `<h1>` (hero heading); each section is a `<section aria-labelledby>` with an `<h2>`; card titles are `<h3>`.
- The two-part expertise heading is a single `<h2>` with two spans, so it reads as one sentence.
- Highlighted phrases are colour only; headings read as one string.
- Stats use a `<dl>` (`<dt>` label, `<dd>` value). Commitments use an `<ol>`; bullet dots and the "Z" watermark are decorative pseudo-elements.
- Icons are `aria-hidden`; the icon-only toggle has `aria-label` and `aria-pressed`.
- The mailto button states its action, and the address is also shown as text.
- Every design contrast failure is corrected in tokens; axe runs on every page in both themes and both locales and must stay at zero violations.
- Anchor targets get `scroll-margin-top`; smooth scrolling only outside `prefers-reduced-motion`.

## Steps

- [x] 1. **Tokens** sampled from the first mockup, with contrast fixes. — Risk: medium (shared tokens)
- [x] 2. **UI primitives**: Button, Eyebrow, SectionHeading, Icon. — Risk: low (new files)
- [x] 3. **Shell**: header (logo, nav, CTA, switcher, toggle), footer. — Risk: medium (shared layout)
- [x] 4. **Content schema and copy**, typed per page. — Risk: medium (shared schema)
- [x] 5–6. **Sections and Contact page** for the first mockup. — Risk: low
- [x] 7. **Responsive pass and brand assets** (logo, photo, favicon; desktop proportions). — Risk: low
- [x] 8. **Updated design: tokens and fonts** (black / new cream, rhythm at 390 / 834 / 1440px, Astro Fonts API). — Risk: medium (shared tokens)
- [x] 9. **Updated design: content schema and copy** (hero intro, expertises, approach, values, clients points). — Risk: medium (shared schema)
- [x] 10. **Updated design: sections** (Hero, Expertises, Approach, Values, Clients, Publications; Offers / About / Badge removed). — Risk: low
- [x] 11. **Updated design: tablet and mobile layouts**, compared section by section with the frames. — Risk: low
- [ ] 12. **Lighthouse** mobile run on `/fr/` and `/fr/contact/` (target 95+), scores recorded in the handover. — Risk: low

## Test Plan

- **Gate:** `npm run lint`, `npm run check`, `npm run build`, `npm run test:e2e`.
- **`presentation.spec.ts`:** one h1; sections in design order (expertises, approach, values, clients, publications, contact); "Parlons de vos projets" goes to `/{lang}/contact/` and "Découvrir Zenika" to `#expertises`; 3 levers, 5 commitments, 4 stats, 3 publications, client points and chips; mailto on both pages; brand fonts load from this site; no horizontal overflow.
- **`shell.spec.ts`:** nav plus CTA, icon toggle accessible name, logo follows the theme, every header control on one row at 1280px and 375px.
- **`theme.spec.ts`:** page content (not just the header) follows the theme on every route.
- **Unchanged:** axe, motion, SEO and smoke tests cover the new content in both themes automatically.

## Decisions

- **Contrast:** design colours that fail WCAG AA are replaced by the nearest passing value (see Tokens).
- **Fonts:** Montserrat and Nunito via the Astro Fonts API; no font files committed.
- **English copy:** drafted, pending Zenika marketing review.
- **Publication cards:** not links while the Publications page is hidden.
- **Language switcher:** compact FR / EN next to the theme toggle (not in the design).
- **"Découvrir" buttons:** hidden until the Expertise page exists.
- **Logo:** official PNG; the dark-mode light variant is derived from it until an official SVG / light logo is supplied.
