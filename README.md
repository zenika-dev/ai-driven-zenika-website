# ai-driven-zenika-website

Zenika's website, developed and maintained through an agentic-based process.

## Getting started

Requires Node 22 (see `.nvmrc`; 22.22.3 or later).

```sh
nvm use
npm ci
npx playwright install chromium webkit
npm run dev
```

## Quality gate

Run all four before every commit:

| Check                        | Command            |
| ---------------------------- | ------------------ |
| Lint (ESLint + Prettier)     | `npm run lint`     |
| Type and Astro check         | `npm run check`    |
| Build                        | `npm run build`    |
| End-to-end and accessibility | `npm run test:e2e` |

`npm run test:e2e` builds the site and serves it on port 4399, then runs Playwright in Chromium and WebKit at 1280px and 375px, including axe checks on every page in both themes.
