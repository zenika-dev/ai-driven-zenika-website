# MVP Pages (Presentation + Contact) — Frontend Plan

## Sources

- **PRDs:** `01b-product-requirements/presentation-page-prd.md`, `01b-product-requirements/contact-page-prd.md`.
- **Design:** Figma mockup exports shared in chat, not kept in the repo (high-fidelity desktop, tablet and mobile frames, exported from Figma `KMB87FX50hnHWQiXugGlGN`, node `3410-6657`). The Figma file itself cannot be read (no Dev Mode or MCP access), so **every token value below is sampled from the PNG** and must be confirmed against Figma.
- **Demo:** none.
- **Conflicts, resolved in the PRDs:**
  - The mockup's contact form becomes a mailto button.
  - The mockup's nav (Expertises, Méthodologie, Clients, Publications) is reduced to Présentation plus a "Nous contacter" button.
  - The mockup's footer link columns and social links are out of scope.
- **Conflicts still open:** see Open Questions 1–5 (contrast failures in the mockup, fonts, EN copy, publication card links, language switcher placement).

## Scope

- **Routes:** `/{lang}/` (Presentation, a full rebuild of the stub) and `/{lang}/contact/` (Contact, a rebuild of the stub), for `en` and `fr`.
- **Shell updates:**
  - **Header:** logo, Présentation link, "Nous contacter" CTA button, language switcher, and an icon-only theme toggle.
  - **Footer:** logo, tagline and copyright line.
- **Unchanged:** the Expertise, Clients and Publications stubs (they pick up the new shell automatically).
- **Out of scope:** the contact form, footer link columns and social links, Méthodologie, the client-logo marquee animation (a static row in the MVP), decorative motion beyond the existing View Transitions, and analytics.

## Files

| Path                                                 | New / Modified | Purpose                                                                                    |
| ---------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------ |
| `src/styles/tokens.css`                              | Modified       | Replace placeholders with sampled brand values (see Tokens)                                |
| `src/styles/global.css`                              | Modified       | Section rhythm, heading scale, `.section--dark` / `.section--cream` surfaces               |
| `src/content.config.ts`                              | Modified       | Typed `presentation` and `contact` blocks on the `pages` schema                            |
| `src/content/pages/{en,fr}/index.md`                 | Modified       | Hero, about, offers, approach, clients, publications, contact copy                         |
| `src/content/pages/{en,fr}/contact.md`               | Modified       | Contact section copy                                                                       |
| `src/i18n/ui.ts`                                     | Modified       | New UI keys (see Content and i18n)                                                         |
| `src/i18n/utils.ts`                                  | Modified       | `getPage` returns the typed block for each page and fails the build if it is missing       |
| `src/components/ui/Button.astro`                     | New            | Link styled as a button: `primary` (red pill), `dark` (black pill), `ghost` (text + arrow) |
| `src/components/ui/Eyebrow.astro`                    | New            | "01 / QUI SOMMES-NOUS" label                                                               |
| `src/components/ui/SectionHeading.astro`             | New            | Eyebrow, heading with optional highlighted phrase, intro; two-column at ≥1024px            |
| `src/components/ui/Badge.astro`                      | New            | Tinted category badge (`conseil`, `engineering`, `formation`)                              |
| `src/components/ui/Icon.astro`                       | New            | Inline decorative SVGs (arrow, moon, sun), `aria-hidden`                                   |
| `src/components/sections/Hero.astro`                 | New            | Hero: label, h1 with highlight, intro, 2 CTAs, image                                       |
| `src/components/sections/About.astro`                | New            | 01 Qui sommes-nous: intro and 4 stats (`<dl>`)                                             |
| `src/components/sections/Offers.astro`               | New            | 02 Ce que nous faisons: 3 offer cards                                                      |
| `src/components/sections/Approach.astro`             | New            | 03 Notre manière d'agir: dark section, 3 cards with corner glow                            |
| `src/components/sections/Clients.astro`              | New            | 04 Nos clients: client name chips (`<ul>`)                                                 |
| `src/components/sections/Publications.astro`         | New            | 05 Publications: 3 gradient cards                                                          |
| `src/components/sections/ContactCta.astro`           | New            | 06 Parlons-nous: dark section, mailto button; reused by the Contact page                   |
| `src/components/layout/Header.astro`                 | Modified       | Mockup layout; CTA button; mobile shows logo, CTA and tools only                           |
| `src/components/layout/Nav.astro`                    | Modified       | Présentation link only (`navPages = ['index']`); contact moves to the CTA                  |
| `src/components/layout/ThemeToggle.astro`            | Modified       | Icon-only button (moon/sun), accessible name from `aria-label`                             |
| `src/components/layout/Footer.astro`                 | Modified       | Dark footer: logo, tagline, copyright                                                      |
| `src/i18n/routes.ts`                                 | Modified       | `navPages = ['index']`; adds `ctaPage = 'contact'`                                         |
| `src/assets/placeholders/hero.svg`                   | New            | Neutral placeholder at the mockup's aspect ratio, until the Figma photo export             |
| `src/pages/[lang]/index.astro`                       | Modified       | Composes the sections                                                                      |
| `src/pages/[lang]/contact.astro`                     | Modified       | h1 and ContactCta block                                                                    |
| `tests/e2e/presentation.spec.ts`                     | New            | Section order, CTAs, anchors, stats                                                        |
| `tests/e2e/shell.spec.ts`, `tests/e2e/smoke.spec.ts` | Modified       | Nav is now Présentation + CTA; contact link is the header CTA                              |

## Content and i18n

**Content schema** (`pages` collection). `title` and `description` stay required, and these blocks are added as optional:

- `presentation`:
  - `hero`: `{ label, heading, highlight, intro, primaryCta, secondaryCta, imageAlt }`
  - `about`: `{ eyebrow, heading, highlight, lead, body, stats: [{ value, label }] ×4 }`
  - `offers`: `{ eyebrow, heading, intro, items: [{ badge, title, text }] ×3 }`
  - `approach`: `{ eyebrow, heading, intro, items: [{ title, text }] ×3 }`
  - `clients`: `{ eyebrow, heading, intro, names: string[] }`
  - `publications`: `{ eyebrow, heading, intro, items: [{ kind, title }] ×3 }`
- `contact`: `{ eyebrow, heading, intro, ctaLabel }`, used by the Contact page and by section 06 on the Presentation page.

`getPage(lang, 'index')` throws if `presentation` is missing, and `getPage(lang, 'contact')` throws if `contact` is missing. `zod` enforces exact array lengths (e.g. 4 stats, 3 offers).

**Copy:**

- **FR:** the mockup's text, verbatim, as draft.
- **EN:** see Open Question 3.
- Owner: Zenika marketing.

**New UI keys** (en/fr):

| Key                | Purpose                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| `header.cta`       | "Nous contacter" / "Contact us"                                               |
| `theme.toggle`     | Existing key; now the toggle's `aria-label`                                   |
| `footer.tagline`   | "Ensemble, construisons les Systèmes d'Information des 20 prochaines années." |
| `footer.copyright` | "© {year} Zenika. Tous droits réservés."                                      |
| `logo.alt`         | "Zenika — accueil" / "Zenika — home"                                          |

`footer.placeholder` and `nav.contact` are removed.

## Tokens

All values were **sampled from the PNG**. Each group is commented `SAMPLED FROM MOCKUP PNG — confirm against Figma`.

| Token                                                            | Value                                 | Use                                               |
| ---------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------- |
| `--color-brand`                                                  | `#e31128` (mockup `#ee2238`, see OQ1) | Highlights, eyebrows, primary button, stat "600+" |
| `--color-ink`                                                    | `#0b0b0f`                             | Text; dark section and footer background          |
| `--color-ink-raised`                                             | `#16161d`                             | Cards on dark sections                            |
| `--color-cream`                                                  | `#faf9f6`                             | Alternate section and card background             |
| `--color-muted`                                                  | `#5e5e5e`                             | Body text on light backgrounds (6.2:1 on cream)   |
| `--color-accent-teal` / `--color-accent-teal-text`               | `#06c3a2` / `#04806b`                 | Badge tint, glow / text (OQ1)                     |
| `--color-accent-indigo` / `--color-accent-indigo-text`           | `#8185ea` / `#5e63e4`                 | Badge tint, glow / text (OQ1)                     |
| `--color-tint-brand`, `--color-tint-teal`, `--color-tint-indigo` | `#f9e3e3`, `#e1f3ed`, `#eeedf5`       | Badge backgrounds                                 |
| `--gradient-orange`                                              | `#ffa27c → #ffc44f`                   | Publication card 1 (ink text, 10:1)               |
| `--gradient-purple`                                              | `#8c70e5 → #7657d8`                   | Publication card 2 (white text; OQ1)              |
| `--gradient-blue`                                                | `#4a93e9 → #4cb2de`                   | Publication card 3 (ink text, 6.2:1)              |
| `--radius-pill`, `--radius-card`                                 | measured from the PNG                 | Buttons, cards                                    |
| Spacing and type scale                                           | measured from the PNG                 | Section padding, heading sizes per breakpoint     |

The semantic tokens from the skeleton (`--color-bg`, `--color-text`, …) are kept and mapped onto these. **Dark theme:** uses the mockup's own dark-section palette (`--color-bg: #0b0b0f`, `--color-surface: #16161d`, text white, muted sampled from the dark-section body text). Cream sections become `--color-ink-raised`.

**Fonts:** Montserrat (headings, labels, buttons) and Nunito (body), configured with the Astro Fonts API in `astro.config.mjs`: downloaded from Google Fonts at build time and served from this site, with `font-display: swap` and generated fallback metrics.

## JavaScript

No new JavaScript. The theme toggle keeps its existing script and changes only its markup. Anchors (`#qui-sommes-nous`) and the CTAs are plain links.

## Accessibility Notes

- One `<h1>` (hero heading); each section is a `<section aria-labelledby>` with an `<h2>`, and card titles are `<h3>`.
- The highlighted phrase is a `<span>` styled with colour only; the heading reads as one string.
- Stats use a `<dl>` (`<dt>` label, `<dd>` value) so the number and its label are read together.
- Badges are text, not colour-only.
- Arrow and moon/sun icons are `aria-hidden`. The icon-only toggle has `aria-label` plus `aria-pressed`, and a target of at least 24×24 (the mockup icon is about 16px, so it gets padding).
- The mailto button's text states its action ("Écrivez-nous"), and the address is shown as text next to it.
- The client chips are a `<ul>`, so screen readers announce the count.
- Every mockup contrast failure is fixed before the build (OQ1). Axe runs in both themes and must stay at zero violations.
- The `#qui-sommes-nous` anchor target gets `scroll-margin-top`, and `scroll-behavior: smooth` applies only outside `prefers-reduced-motion`.

## Steps

- [x] 1. **Tokens.** Replace the placeholder values with the sampled brand tokens plus the contrast fixes (OQ1), and map the semantic tokens to them. Dark theme from the mockup's dark palette. Gate. — Risk: **medium** (shared tokens affect every page)
- [x] 2. **UI primitives.** Button, Eyebrow, SectionHeading, Badge, Icon. Not used yet. Gate. — Risk: low (new files only)
- [x] 3. **Shell.** Header (logo, nav = Présentation, CTA, switcher, icon toggle; mobile: logo, CTA, tools), Footer (dark, tagline, copyright), and updates to `routes.ts`, `ui.ts`, `shell.spec.ts` and `smoke.spec.ts`. Gate. — Risk: **medium** (shared layout on every page)
- [x] 4. **Content schema and copy.** Extend the schema, fill `index.md` and `contact.md` (FR from the mockup; EN per OQ3), and make `getPage` typed per page. Gate. — Risk: medium (shared schema)
- [x] 5. **Hero, About and Offers sections**, composed into `index.astro`. Add the first part of `presentation.spec.ts` (h1, CTAs, anchor, 4 stats, 3 offers). Gate. — Risk: low (new files and one page)
- [x] 6. **Approach, Clients, Publications and ContactCta sections**, plus the Contact page rebuild. Extend `presentation.spec.ts` (section order, mailto on both pages). Gate. — Risk: low
- [x] 7. **Responsive pass** against the three mockup frames (375 / 768 / 1280), in both themes and both locales, keyboard only. Lighthouse mobile run on both pages (target 95+). Gate. — Risk: low

## Test Plan

- **Gate:** `npm run lint`, `npm run check`, `npm run build`, `npm run test:e2e`.
- **New `presentation.spec.ts`:**
  - One h1.
  - The h2s appear in mockup order (01 to 06).
  - "Parlons de vos projets" goes to `/{lang}/contact/`, and "Découvrir Zenika" goes to `#qui-sommes-nous`, which exists.
  - 4 stats and 3 offer cards are present.
  - The mailto `href` is correct on Presentation and Contact.
  - No horizontal overflow at 375px.
- **Updated tests:**
  - `shell.spec.ts`: nav plus CTA; icon toggle has an accessible name.
  - `smoke.spec.ts`: hidden pages are still absent from the nav.
- **Unchanged:** the axe, theme, motion and SEO tests cover the new content in both themes automatically.
- **Manual:** Lighthouse mobile on `/fr/` and `/fr/contact/`; scores recorded in the handover.

## Implementation Notes

Built with the recommended answer to each open question below, pending your confirmation:

- **OQ1:** contrast fixes applied.
- **OQ2:** system font stack.
- **OQ3:** English drafted, with a review comment in each EN content file.
- **OQ4:** publication cards are not links.
- **OQ5:** compact FR / EN switcher.

Other changes from the plan:

- Section anchors use stable ids (`#about`, `#offers`, …) rather than localised ones.
- The dark theme is derived from the mockup's dark sections, using a lighter red (`#ff4d5e`) where the brand red fails contrast on dark.
- The hero image is a CSS placeholder with `role="img"` and the content alt text, until the Figma export arrives.
- Lighthouse has not been run yet (step 7 manual check).

## Open Questions

1. **Contrast failures in the mockup** (WCAG AA, which the axe tests enforce). Proposed fixes, each the smallest change that passes:
   - Brand red `#ee2238` → **`#e31128`**: red text on white or cream and white text on red buttons go from 4.05–4.27 to 4.56. Visually almost identical.
   - Teal `#06c3a2` (2.1:1) and indigo `#8185ea` (3.1:1) **as text** (the "12" and "3" stats, badge labels) → darker text variants `#04806b` / `#5e63e4`. The bright values stay for glows and tints.
   - Publication cards: white text on the orange (1.6–2.0) and blue (2.4–3.2) gradients fails → **use ink text** on those two (6–12:1). The purple card keeps white text with its light end darkened `#8c70e5` → `#7e5fe2`.

   Should I apply these, or will the designer adjust in Figma?

2. **Fonts.** The headings look like a geometric sans (Montserrat or Poppins?), but a PNG cannot confirm it. Which family and weights? Until confirmed, the build uses the system stack.
3. **English copy.** You chose "FR copy is draft". Should I draft English translations marked `[DRAFT]` for marketing to review (recommended: putting French text under `lang="en"` misleads screen readers and search engines), or use the French text in both locales?
4. **Publication cards** show an arrow (↗), but the Publications page is hidden in the MVP. Should the cards be non-interactive for now (recommended), or link to the Publications stub?
5. **Language switcher** is not in the mockup. The plan puts a compact "FR / EN" next to the theme toggle. OK?
6. **Assets.** The logo, hero photo and section photos come from Figma exports. Until then: a text wordmark and neutral placeholder images (alt text still from content). Client names stay as text chips, as in the mockup.
