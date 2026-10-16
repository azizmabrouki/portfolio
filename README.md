# portfolio

Source of the portfolio of **Mohamed Aziz Mabrouki**, software architecture engineer in Tunis.

The site has two jobs: show how I think about systems, and be a working example of how I ship them. This README is part of that second job, so it records the decisions behind the site, not just how to run it.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [Astro](https://astro.build) 7, TypeScript (strict) |
| Styling | CSS custom properties as design tokens (`src/styles/tokens.css`), one dark theme |
| Fonts | Archivo (one variable file: weight and width axes) via Astro's fonts API: self-hosted, metric-matched fallback |
| Motion | A CSS 3D world driven by one vanilla module (`src/scripts/world`), springs and native scrolling; no animation library |
| Content | Markdown content collections with typed (Zod) frontmatter: case studies and notes |
| CI | GitHub Actions: type-check, build, link check, Lighthouse CI |
| Hosting | Cloudflare Workers (static assets), deployed on every push to `main` |

## Decisions

**Static site, JavaScript only where it earns its place.** A portfolio is read far more than it is used, so pages are pre-rendered HTML. Scripts are added per component (islands) for animation and nothing else. Budget: under 120 KB of gzipped JS on the home page.

**Astro over Next.js.** Content collections, View Transitions and zero-JS-by-default cover everything this site needs. Next.js would only be worth it if the site became app-like (shared state or persistent 3D across pages).

**Design tokens as the only source of style.** Colours, type, layout, focus and motion timings live in one file; components read custom properties and never hard-code values. The one exception is the shading of the 3D world, which is drawing rather than theme.

**Motion is an enhancement, never a requirement.** The home page has two readings of the same HTML. On wide, landscape screens with motion allowed, an inline script marks `<html>` with `w3d` before first paint, the sections pin over a scroll story and the 3D module is downloaded (dynamic import, about 10 KB gzipped): plates that scatter as noise, lock into a stack, light up per principle, turn into a live model you can break, carry each project's screen and end with an empty layer for the next team. Everywhere else (phones, tablets held upright, reduced motion, no JavaScript) the page is the still version drawn for phones: every word, flat drawings, nothing pinned. Mobile Lighthouse never loads the 3D code.

**The world is DOM, not WebGL.** Every box is six `div` faces in CSS 3D, ported as markup from the design canvas and inserted only where it runs. It costs about 3 KB gzipped, needs no canvas fallback, and stays crisp at any zoom. One `requestAnimationFrame` loop reads scroll positions and moves everything with springs, so scrolling back and forth is always smooth.

**The design was finished before the code.** v3 was designed in a Claude Design canvas (desktop and 390 px artboards for the home page, a case study, a note and the 404), went through a critique and accessibility pass, and was then ported here section by section, because motion and layout are hard to judge from a description.

**Fonts through Astro's fonts API, not font packages.** Files are fetched from Fontsource at build time and served from the site itself, like `@fontsource` would, and Astro generates metric-matched fallbacks, so text does not jump when the real font arrives. No extra dependencies.

**Font bytes are the performance budget.** Lighthouse CI measured the font setups (mobile, simulated slow 4G); the first three are v2:

| Setup | Font bytes | LCP | Performance |
| --- | --- | --- | --- |
| Three families + Fraunces italic, preloaded | ~377 KB | 3.2 s | 0.94 |
| Same, not preloaded (fonts found in CSS get "VeryHigh" priority, which Lighthouse treats as render-blocking) | ~377 KB | 3.0 s, first paint 3.0 s | 0.89 |
| Upright Fraunces only, preloaded, CSS inlined | ~230–260 KB | measured in CI | ≥ 0.95 gate |
| v3: Archivo, one variable file, preloaded | ~90 KB | ~1.5 s (local run) | 1.00 |

So the italic face went (it served one line of text), fonts stay preloaded, and the few KB of CSS are inlined so no stylesheet request blocks the first paint.

**Contrast is designed, not checked afterwards.** Every text colour passes WCAG AA (4.5:1) on every surface it is used on; the lowest pair is the label grey on a lit plate (4.9:1). Things that step back while you read, like the other projects or the rules not yet reached, are dimmed by colour, never by opacity, so they stay readable.

**Quality gates in CI, not in good intentions.** Every pull request and every push to `main` must type-check, build, have no broken links, and score 95+ on all four Lighthouse categories. A regression fails the build.

**One Markdown file per case study, diagram included.** A case study's context and problem are Markdown; its architecture diagram, key decisions, numbers and stack are typed frontmatter. The diagram is described on a coarse grid (boxes, groups, edges) and `src/lib/diagram.ts` lays it out and routes the arrows, so adding a project never means hand-drawing SVG. The same data renders a plain-text version of every drawing, for screen readers and small screens.

**No smooth-scroll library.** The browser keeps its own scrolling (wheel, trackpad, keyboard, assistive tech); the 3D world follows it. Focusing one of the four rules scrolls the story to that rule, so the pinned section works from the keyboard too.

**Colour has jobs.** Off-white is the text. Gold is emphasis: what you are reading now, numbers, the primary button. Blue is for links, focus and the contracts I built. Green and red-orange only report state on the live model and the departures board.

**Key words are marked in the content, not in components.** Short texts in frontmatter and config take a tiny markup, turned into HTML by `src/lib/rich.ts` after escaping: `==key phrase==` for the highlight band, `**609 tests**` for a metric, `[[RAG]]` or `[[shown words|term-id]]` for a glossary term. Markdown bodies use `<mark>`, `**bold**` and the term button directly.

**Reading aids for people who skim.** Case studies open with their numbers and a two-sentence problem and result; each decision can light its box in the diagram; jargon in notes opens a one-line definition in place (a popover without JavaScript); the departures board opens a role's detail in place. All of it works by keyboard and touch, and with reduced motion.

**Only what can be shown.** StudioLabCloud's screens may be shown; its code and client data stay out. Until screenshots exist, their frames say so.

**Hosting decoupled from CI.** Cloudflare builds and deploys from Git on its own; GitHub Actions verifies. Every branch gets its own preview URL, `main` is production.

**Workers over Pages.** The plan started on Cloudflare Pages, but Cloudflare now presents Pages as its legacy workflow. Workers static assets serves the same pre-built files, honours the same `_headers` file and a real 404 page, and is where new platform features land. The cost is one config file, `wrangler.jsonc`.

## Project structure

```text
src/
  config/site.ts          name, title, links, top-bar navigation
  config/home.ts          the home page's words: hero, statements, principles, break-it model, contact
  config/work.ts          the four work slots (A–D) and what each lights in the 3D world
  config/experience.ts    roles and the stops of the departures board
  config/glossary.ts      terms and one-line definitions for notes
  content/projects/*.md   case studies: body in Markdown, numbers, decisions and diagram in frontmatter
  content/notes/*.md      notes
  content.config.ts       collection schemas
  styles/tokens.css       colours, type, layout, focus and motion tokens
  styles/global.css       base styles, buttons, badges, the reveal used by the 3D world
  layouts/                BaseLayout (<head>, meta, font, js/w3d classes), PageLayout (top bar, main, footer)
  components/home/        HomeBar, Hero, System, Break, Work, Route, Notes, Contact sections, World
  components/case/        Diagram (wide and phone drawings from a case study's frontmatter)
  components/site/        TopBar, Footer, Glossary
  scripts/home.ts         clock, menu, pipeline, board panels, still-page principles; loads the world
  scripts/chaos.ts        the break-it model's state, shared by both readings
  scripts/world/          query.ts (where the world runs), index.ts (scroll story), world.html (the boxes)
  lib/diagram.ts          diagram layout and edge routing, wide and narrow
  lib/content.ts          collection queries, reading time, dates
  lib/rich.ts             ==highlight==, **metric** and [[term]] markup for short texts
  pages/                  index, projects/[slug], notes/[slug], 404, sitemap.xml, robots.txt
public/
  favicon.svg
  og-image.png            1200 × 630 social preview
  _headers                security headers and long-term caching for /_astro/*
.github/
  workflows/ci.yml        verification pipeline
  dependabot.yml          weekly dependency updates
lighthouserc.json         Lighthouse CI thresholds
wrangler.jsonc            Cloudflare Workers config: static assets, branch previews
.nvmrc                    Node version, read by CI and Cloudflare
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

## Launch checklist (Phase 6)

1. **Address.** Free option: in Cloudflare → Workers & Pages → *Your subdomain* → **Change**, pick a short account subdomain (e.g. `mabrouki`), and optionally rename the Worker (e.g. `aziz`), giving `aziz.mabrouki.workers.dev`. A renamed Worker must match `name` in `wrangler.jsonc`. With a domain instead (e.g. the free first year of `.me` from the GitHub Student Developer Pack): add it to Cloudflare, then Worker → Settings → Domains & Routes → **Add custom domain**.
2. Put the new address in `site` in `astro.config.mjs` and in the link-check exclusion in `.github/workflows/ci.yml`.
3. **Analytics.** Cloudflare → Analytics & Logs → Web Analytics → **Add a site** → copy the token into `analytics.cloudflareToken` in `src/config/site.ts`. Cookie-free, so no consent banner.
4. **CV.** Save it as `public/cv.pdf` and set `links.cv` to `/cv.pdf` in `src/config/site.ts`: the hero's "Download CV" button appears.
5. **Links.** LinkedIn → Contact info → Website, and a Featured link to the site; the GitHub profile's website field.

## Roadmap

| Phase | Scope | Status |
| --- | --- | --- |
| 0. Setup | Repo, Astro + TypeScript, CI, Cloudflare Workers | Done |
| 1. Design system | Tokens, fonts, grid, type scale, drawing components | Done |
| 2. Hero | The building draws itself, tilts into an exploded axonometric, floors open one by one and are clickable; still version for phones and reduced motion | Done |
| 3. Content and pages | Home sections, three case studies, first note, 404, Open Graph image, sitemap, robots.txt (CV PDF when ready) | Done |
| 4. Signature motion | Blueprint cards, View Transitions from card to case study, diagrams that assemble with decision markers | In review |
| 5. Polish | Dark mode with a switch, drawn link underlines, counting markers, coordinate readout, copy-email button, smooth in-page links | In review |
| 5.5 UI refinement | Blueprint blue, umber and orange with one job each; highlighted key words and metrics; glossary, 30-second briefs, sheet index, decisions linked to drawings, stack filter, compact header | In review |
| 6. Launch | Address, analytics, links from LinkedIn, CV and GitHub | Address done: aziz-mabrouki.mabrouki.workers.dev; analytics, CV and links to come |
| v3. Redesign | Design in a Claude Design canvas, then port: 3D home page, case study template, note page, 404, still page for phones | Port in review on branch `v3` |
