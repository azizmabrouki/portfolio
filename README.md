# portfolio

Source of the portfolio of **Mohamed Aziz Mabrouki**, full-stack engineer in Tunis.

The site has two jobs: show how I think about systems, and be a working example of how I ship them. This README is part of that second job, so it records the decisions behind the site, not just how to run it.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [Astro](https://astro.build) 7, TypeScript (strict) |
| Styling | CSS custom properties as design tokens (`src/styles/tokens.css`), container queries |
| Fonts | Funnel Display, Funnel Sans (variable) and Martian Mono (one weight) via Astro's fonts API: self-hosted, metric-matched fallbacks |
| Motion | One vanilla camera module for the board (`src/scripts/board`), CSS for everything else; no animation library |
| Content | Markdown content collections with typed (Zod) frontmatter: case studies and notes |
| CI | GitHub Actions: type-check, build, link check, Lighthouse CI |
| Hosting | Cloudflare Workers (static assets), deployed on every push to `main` |

## Decisions

**Static site, JavaScript only where it earns its place.** A portfolio is read far more than it is used, so pages are pre-rendered HTML. Scripts are added per component (islands) for animation and nothing else. Budget: under 120 KB of gzipped JS on the home page.

**Astro over Next.js.** Content collections, View Transitions and zero-JS-by-default cover everything this site needs. Next.js would only be worth it if the site became app-like (shared state or persistent 3D across pages).

**Design tokens as the only source of style.** Colours, type, layout, depth and motion timings live in one file; components read custom properties and never hard-code values. The board's frame positions are content, not style: they live in `src/config/board.ts`.

**The portfolio is a board.** The home page is a designer's working file: a green cutting mat with every project laid on it as a paper frame, each with its name strip, like artboards in a design tool. A camera flies between the frames in reading order (the tour: Next, the arrow keys, the intro's index, any `/#anchor`), and the visitor can also drag, scroll and pinch to look around. Rulers follow the camera and mark the frame being read, a minimap shows where you are, comment pins hold my notes on decisions, and my cursor wanders over the intro. The idea fits the work: I design and build whole products, so the site is shown the way I work on one.

**One document, three readings.** The frames are written once, in reading order. An inline script picks the reading before first paint: `html.board` on screens 1024 × 600 and up (frames placed at their rectangles from `src/config/board.ts`, camera loaded), `html.tour` on smaller screens (frames as a scrolling column, with a tour bar that steps through them and zooms the column out into the whole board), and neither for the List view or without JavaScript (the same column, nothing else). The Board / List switch in the top bar keeps the visitor on the frame they were reading. Screen readers, search engines and phones always get the column, in order.

**Frames are size containers.** Every frame is a CSS container and sizes its type and layout in `cqi`, so the same markup reads at 342 px on a phone and at 1280 px on the board, and the camera's zoom never changes layout.

**The board is DOM, not canvas.** Frames are ordinary HTML moved by one transform, so links, focus, text selection in the List view and lazy images all work as usual. Only the rulers are a `<canvas>`, redrawn with the camera. Labels, pins and the selection keep their size on screen at any zoom (`calc(… / var(--z))`). The camera module is downloaded only for the board (dynamic import, under 4 KB gzipped), so phones never load it.

**Motion is the camera, and nothing hides content.** Flights ease in and out and zoom out on long trips, like a map; with reduced motion the camera cuts instead. Everything is in the page from the first paint: no entrance animations, no content waiting for a script.

**The design was finished before the code.** v4 was designed in a Claude Design canvas (the desktop board, the phone tour, the List view and the case study), then built here and checked frame by frame at 1440 × 900 and 390 × 844.

**Fonts through Astro's fonts API, not font packages.** Files are fetched from Fontsource at build time and served from the site itself, like `@fontsource` would, and Astro generates metric-matched fallbacks, so text does not jump when the real font arrives. No extra dependencies.

**Font bytes are the performance budget.** Lighthouse CI measured the font setups (mobile, simulated slow 4G); the first three are v2:

| Setup | Font bytes | LCP | Performance |
| --- | --- | --- | --- |
| Three families + Fraunces italic, preloaded | ~377 KB | 3.2 s | 0.94 |
| Same, not preloaded (fonts found in CSS get "VeryHigh" priority, which Lighthouse treats as render-blocking) | ~377 KB | 3.0 s, first paint 3.0 s | 0.89 |
| Upright Fraunces only, preloaded, CSS inlined | ~230–260 KB | measured in CI | ≥ 0.95 gate |
| v3: Archivo, one variable file, preloaded | ~90 KB | ~1.5 s (local run) | 1.00 |
| v4: Funnel Display + Funnel Sans preloaded, Martian Mono (one weight) not | ~46 KB | ~1.4 s (local run) | 1.00 |

So the italic face went (it served one line of text), fonts stay preloaded, and the few KB of CSS are inlined so no stylesheet request blocks the first paint.

**Contrast is designed, not checked afterwards.** Every text colour passes WCAG AA (4.5:1) on every surface it is used on; the lowest pair is the label grey on a lit plate (4.9:1). Secondary text on the mat is a tint of the mat's green, never a grey.

**Quality gates in CI, not in good intentions.** Every pull request and every push to `main` must type-check, build, have no broken links, and score 95+ on all four Lighthouse categories. A regression fails the build.

**One Markdown file per case study, diagram included.** A case study's context and problem are Markdown; its architecture diagram, key decisions, numbers and stack are typed frontmatter. The diagram is described on a coarse grid (boxes, groups, edges) and `src/lib/diagram.ts` lays it out and routes the arrows, so adding a project never means hand-drawing SVG. The same data renders a plain-text version of every drawing, for screen readers and small screens.

**No smooth-scroll or animation library.** In the column the browser keeps its own scrolling. On the board, the wheel and trackpad pan the camera and Tab brings the focused frame into view, so the board works from the keyboard too.

**One world, one theme.** The page is a desk in daylight: the mat, white paper, ink. There is no dark mode to switch to; the mat is already the dark half of the page.

**Colour has jobs.** Green is the mat: the ground and the bars. White is paper: everything to read. Yellow, taken from the mat's markings, is what is selected, current or pressed: the selection, the Next button, my cursor and pins, the Contact sheet, the sticky notes. Ink is the text.

**Key words are marked in the content, not in components.** Short texts in frontmatter and config take a tiny markup, turned into HTML by `src/lib/rich.ts` after escaping: `==key phrase==` for the highlight band, `**609 tests**` for a metric, `[[RAG]]` or `[[shown words|term-id]]` for a glossary term. Markdown bodies use `<mark>`, `**bold**` and the term button directly.

**Reading aids for people who skim.** The intro frame is the board's table of contents; the List view is one click away; case studies open with the problem and result in two sentences; yellow tiles in a case study's system drawing mark what its decisions are about; jargon in notes opens a one-line definition in place (a popover without JavaScript). All of it works by keyboard and touch, and with reduced motion.

**Only what can be shown.** StudioLabCloud's screens may be shown; its code and client data stay out.

**Hosting decoupled from CI.** Cloudflare builds and deploys from Git on its own; GitHub Actions verifies. Every branch gets its own preview URL, `main` is production.

**Workers over Pages.** The plan started on Cloudflare Pages, but Cloudflare now presents Pages as its legacy workflow. Workers static assets serves the same pre-built files, honours the same `_headers` file and a real 404 page, and is where new platform features land. The cost is one config file, `wrangler.jsonc`.

## Project structure

```text
src/
  config/site.ts          name, role, links, the top bar's links
  config/board.ts         where every frame lies on the mat, the tour's stops, the comment pins
  config/experience.ts    roles, education, certifications, and their place on the timeline
  config/glossary.ts      terms and one-line definitions for notes
  content/projects/*.md   case studies: body in Markdown, screens, decisions and diagram in frontmatter
  content/notes/*.md      notes
  content.config.ts       collection schemas
  styles/tokens.css       colours, type, layout, depth and motion tokens
  styles/global.css       base styles, paper, buttons, prose, glossary terms
  layouts/                BaseLayout (<head>, meta, fonts), PageLayout (top bar, column, contact sheet)
  components/board/       Frame and the frames of the board, the system tiles, BoardMarks (selection,
                          pins, cursor), BoardTools (rulers, tour bar, minimap), TourBar (phones)
  components/site/        TopBar, ContactBlock, Glossary, Icon
  scripts/board/          mode.ts (board, tour or list), camera.ts (the board), tour.ts (phones)
  lib/content.ts          collection queries, reading time, dates
  lib/rich.ts             ==highlight==, **metric** and [[term]] markup for short texts
  pages/                  index (the board), projects/[slug], notes/[slug], 404, sitemap.xml, robots.txt
public/
  favicon.svg
  og-image.png            1200 × 630 social preview
  shots/                  real product screens
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
4. **CV.** Save it as `public/cv.pdf` and set `links.cv` to `/cv.pdf` in `src/config/site.ts`: every "Download CV" link appears.
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
| v3. Redesign | Design in a Claude Design canvas, then port: 3D home page, case study template, note page, 404, still page for phones | Done |
| v4. The board | Repositioned as a full-stack engineer: the home page as a board of frames with a camera tour, phone tour and List view; case study, note and 404 in the same world | In review on branch `v4-board` |
