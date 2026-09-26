# portfolio

Source of the portfolio of **Mohamed Aziz Mabrouki**, software engineer growing into software architecture.

The site has two jobs: show how I think about systems, and be a working example of how I ship them. This README is part of that second job, so it records the decisions behind the site, not just how to run it.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [Astro](https://astro.build) 7, TypeScript (strict) |
| Styling | CSS custom properties as design tokens (`src/styles/tokens.css`), shown on `/style` |
| Fonts | Fraunces, Inter, JetBrains Mono via Astro's fonts API: self-hosted, metric-matched fallbacks |
| Motion (from Phase 2) | GSAP + ScrollTrigger, Lenis, Astro View Transitions |
| Content (from Phase 3) | Markdown/MDX content collections with Zod schemas |
| CI | GitHub Actions: type-check, build, link check, Lighthouse CI |
| Hosting | Cloudflare Workers (static assets), deployed on every push to `main` |

## Decisions

**Static site, JavaScript only where it earns its place.** A portfolio is read far more than it is used, so pages are pre-rendered HTML. Scripts are added per component (islands) for animation and nothing else. Budget: under 120 KB of gzipped JS on the home page.

**Astro over Next.js.** Content collections, View Transitions and zero-JS-by-default cover everything this site needs. Next.js would only be worth it if the site became app-like (shared state or persistent 3D across pages).

**Design tokens as the only source of style.** Colours, type, spacing, lines and motion timings live in one file; components read custom properties and never hard-code values. Re-theming the site means editing `tokens.css`, and `/style` shows every token and component in light and dark.

**Fonts through Astro's fonts API, not font packages.** Files are fetched from Fontsource at build time and served from the site itself, like `@fontsource` would, and Astro generates metric-matched fallbacks, so text does not jump when the real font arrives. No extra dependencies.

**Fonts are not preloaded.** The first version preloaded three font files (~340 KB). Lighthouse CI measured mobile LCP at 3.2 s and a performance score of 0.94, below the 0.95 gate: the preloads competed with the stylesheet on a slow connection. Without preloads, and with the few KB of CSS inlined, text paints immediately in the metric-matched fallback and swaps to the real font without layout shift.

**Contrast is designed, not checked afterwards.** Every text colour passes WCAG AA (4.5:1) in both themes. Vermilion at 3.8:1 is kept for lines, fills and large text; body-size vermilion uses a darker text shade (5.1:1).

**Quality gates in CI, not in good intentions.** Every pull request and every push to `main` must type-check, build, have no broken links, and score 95+ on all four Lighthouse categories. A regression fails the build.

**Hosting decoupled from CI.** Cloudflare builds and deploys from Git on its own; GitHub Actions verifies. Every branch gets its own preview URL, `main` is production.

**Workers over Pages.** The plan started on Cloudflare Pages, but Cloudflare now presents Pages as its legacy workflow. Workers static assets serves the same pre-built files, honours the same `_headers` file and a real 404 page, and is where new platform features land. The cost is one config file, `wrangler.jsonc`.

## Project structure

```text
src/
  config/site.ts        name, role, links, navigation
  config/palette.ts     colour tokens as data, for swatches and contrast ratios on /style
  styles/tokens.css     colour (light and dark), type scale, space, lines, radii, motion
  styles/global.css     base styles, typography, links, buttons, layout utilities
  layouts/              BaseLayout: <head>, meta, fonts
  components/drawing/   Rule, DimensionLine, SectionMarker, Hatch, TitleBlock
  components/           Button, BuildingSketch
  lib/contrast.ts       WCAG contrast ratios, computed at build
  pages/                index, style (design system), 404
public/
  favicon.svg
  _headers              security headers and long-term caching for /_astro/*
.github/
  workflows/ci.yml      verification pipeline
  dependabot.yml        weekly dependency updates
lighthouserc.json       Lighthouse CI thresholds
wrangler.jsonc          Cloudflare Workers config: serve dist/ as static assets
.nvmrc                  Node version, read by CI and Cloudflare
```

## Running locally

Requires Node 22.12 or newer.

```bash
npm install
npm run dev       # http://localhost:4321
npm run check     # type-check .astro and .ts files
npm run build     # static output in dist/
npm run preview   # serve dist/
```

## Deployment (Cloudflare Workers)

1. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Continue with GitHub**.
2. Pick `azizmabrouki/portfolio`. Name the Worker `aziz-mabrouki`: it must match `name` in `wrangler.jsonc`.
3. Build command `npm run build`, deploy command `npx wrangler deploy`, non-production branch deploy command `npx wrangler versions upload`. The Node version comes from `.nvmrc`.
4. **Deploy**. Then set `site` in `astro.config.mjs` to the `*.workers.dev` URL (canonical and Open Graph URLs switch on automatically).

Pushes to `main` deploy to production; other branches get a preview URL, posted on their pull request.

The custom domain and Cloudflare Web Analytics are added in Phase 6.

## Roadmap

| Phase | Scope | Status |
| --- | --- | --- |
| 0. Setup | Repo, Astro + TypeScript, CI, Cloudflare Workers | Done |
| 1. Design system | Tokens, fonts, grid, type scale, drawing components | In review |
| 2. Hero | The building draws itself; reduced-motion fallback | |
| 3. Content and pages | Home sections, case studies, CV, 404, SEO | |
| 4. Signature motion | Floor-by-floor scroll, blueprint cards, View Transitions | |
| 5. Polish | Smooth scroll, cursor details, dark mode, a11y and perf pass | |
| 6. Launch | Custom domain, analytics, links from LinkedIn, CV and GitHub | |
