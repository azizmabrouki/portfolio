# portfolio

Source of the portfolio of **Mohamed Aziz Mabrouki**, software engineer growing into software architecture.

The site has two jobs: show how I think about systems, and be a working example of how I ship them. This README is part of that second job, so it records the decisions behind the site, not just how to run it.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [Astro](https://astro.build) 7, TypeScript (strict) |
| Styling | CSS custom properties as design tokens (`src/styles/tokens.css`), shown on `/style` |
| Fonts | Fraunces, Inter, JetBrains Mono via Astro's fonts API: self-hosted, metric-matched fallbacks |
| Motion | GSAP + ScrollTrigger + CustomEase, cross-document View Transitions (CSS only), native scrolling |
| Content | Markdown content collections with typed (Zod) frontmatter: case studies and notes |
| CI | GitHub Actions: type-check, build, link check, Lighthouse CI |
| Hosting | Cloudflare Workers (static assets), deployed on every push to `main` |

## Decisions

**Static site, JavaScript only where it earns its place.** A portfolio is read far more than it is used, so pages are pre-rendered HTML. Scripts are added per component (islands) for animation and nothing else. Budget: under 120 KB of gzipped JS on the home page.

**Astro over Next.js.** Content collections, View Transitions and zero-JS-by-default cover everything this site needs. Next.js would only be worth it if the site became app-like (shared state or persistent 3D across pages).

**Design tokens as the only source of style.** Colours, type, spacing, lines and motion timings live in one file; components read custom properties and never hard-code values. Re-theming the site means editing `tokens.css`, and `/style` shows every token and component in light and dark.

**Motion is an enhancement, never a requirement.** Every drawing is written into the page finished (the building as an exploded axonometric), and that is what phones, reduced motion and no-JS visitors get. On desktops with motion allowed, an inline script marks `<html>` with `motion-ok` before first paint, so the CSS switches to the pinned layout without a flash, and GSAP is downloaded only then (dynamic import): mobile Lighthouse never loads it. Durations and easings come from the motion tokens, so the whole site can be toned up or down from `tokens.css`. The floors are real links to their sections; with motion they scroll to their step instead.

**The exploded view was prototyped first.** The scroll sequence (front elevation → axonometric → floors pulled out one by one) was built as a throwaway prototype and validated before any site code, because motion is hard to judge from a description.

**Fonts through Astro's fonts API, not font packages.** Files are fetched from Fontsource at build time and served from the site itself, like `@fontsource` would, and Astro generates metric-matched fallbacks, so text does not jump when the real font arrives. No extra dependencies.

**Font bytes are the performance budget.** Lighthouse CI measured three versions of the font setup (mobile, simulated slow 4G):

| Setup | Font bytes | LCP | Performance |
| --- | --- | --- | --- |
| Three families + Fraunces italic, preloaded | ~377 KB | 3.2 s | 0.94 |
| Same, not preloaded (fonts found in CSS get "VeryHigh" priority, which Lighthouse treats as render-blocking) | ~377 KB | 3.0 s, first paint 3.0 s | 0.89 |
| Upright Fraunces only, preloaded, CSS inlined | ~230–260 KB | measured in CI | ≥ 0.95 gate |

So the italic face went (it served one line of text), fonts stay preloaded, and the few KB of CSS are inlined so no stylesheet request blocks the first paint.

**Contrast is designed, not checked afterwards.** Every text colour passes WCAG AA (4.5:1) in both themes. Vermilion at 3.8:1 is kept for lines, fills and large text; body-size vermilion uses a darker text shade (5.1:1).

**Quality gates in CI, not in good intentions.** Every pull request and every push to `main` must type-check, build, have no broken links, and score 95+ on all four Lighthouse categories. A regression fails the build.

**One Markdown file per case study, diagram included.** A case study's context and problem are Markdown; its architecture diagram, key decisions, numbers and stack are typed frontmatter. The diagram is described on a coarse grid (boxes, groups, edges) and `src/lib/diagram.ts` lays it out and routes the arrows, so adding a project never means hand-drawing SVG. The same data renders a plain-text version of every drawing, for screen readers and small screens.

**Page transitions without a router.** Cards and case-study headers share a `view-transition-name`, and `@view-transition { navigation: auto }` lets the browser morph the sheet into the page it opens. No client-side router and no JavaScript: browsers without support, and visitors who prefer reduced motion, simply navigate.

**Diagrams assemble, but are always complete.** On motion-capable desktops a case study's diagram draws itself when it scrolls into view: boundaries, boxes in reading order, arrows from source to target, labels, then the numbered markers of the key decisions. The HTML holds the finished drawing, and a drawing already on screen at load is left alone.

**No smooth-scroll library.** The plan listed Lenis. It was left out on purpose: it takes over the browser's scrolling (wheel, trackpad, keyboard, assistive tech) for a feel that ScrollTrigger's scrubbing already gives the one pinned sequence, and it would be one more dependency. In-page links scroll smoothly with the native `scrollIntoView` and move keyboard focus to the section.

**Dark mode follows the system.** The theme is chosen before first paint (the visitor's choice from the header switch if they made one, else `prefers-color-scheme`), so a dark page never flashes light. Every colour is a token, so the drawings, diagrams and code blocks switch with it.

**Details that stay out of the way.** Section markers count up the first time they appear, links draw a stronger underline from the left on hover, and drawing surfaces show the pointer's coordinates like a CAD readout (desktop, fine pointer only). All of it is skipped with reduced motion.

**Only what can be shown.** The StudioLabCloud case study stays at the level StudioLab agreed to: architecture and decisions, no code, screens or client data.

**Hosting decoupled from CI.** Cloudflare builds and deploys from Git on its own; GitHub Actions verifies. Every branch gets its own preview URL, `main` is production.

**Workers over Pages.** The plan started on Cloudflare Pages, but Cloudflare now presents Pages as its legacy workflow. Workers static assets serves the same pre-built files, honours the same `_headers` file and a real 404 page, and is where new platform features land. The cost is one config file, `wrangler.jsonc`.

## Project structure

```text
src/
  config/site.ts          name, role, links, navigation
  config/building.ts      the building's floors and the summary each floor opens
  config/experience.ts    roles, education, certifications for the timeline
  content/projects/*.md   case studies: body in Markdown, diagram and decisions in frontmatter
  content/notes/*.md      architecture notes
  content.config.ts       collection schemas
  config/palette.ts       colour tokens as data, for swatches and contrast ratios on /style
  styles/tokens.css       colour (light and dark), type scale, space, lines, radii, motion
  styles/global.css       base styles, typography, links, buttons, layout utilities
  layouts/                BaseLayout (<head>, meta, fonts, motion-ok), PageLayout (header, main, footer)
  components/hero/        BuildingDrawing (CSS 3D building), HeroSequence (pinned scroll section)
  components/home/        Work, How I work, Experience, Notes and Contact sections
  components/diagram/     ArchitectureDiagram (SVG from a case study's frontmatter)
  components/drawing/     Rule, DimensionLine, SectionMarker, Hatch, TitleBlock
  components/             SiteHeader, SiteFooter, Button, BuildingSketch
  animations/             query.ts (where motion runs), motion.ts (GSAP + tokens), timing.ts,
                          heroSequence.ts, diagramAssemble.ts, details.ts (markers, links, coordinates)
  lib/contrast.ts         WCAG contrast ratios, computed at build
  lib/diagram.ts          diagram layout and edge routing
  lib/content.ts          collection queries, reading time, dates
  pages/                  index, projects/[slug], notes/[slug], style (design system), 404,
                          sitemap.xml, robots.txt
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
4. **CV.** Save it as `public/cv.pdf` and set `links.cv` to `/cv.pdf` in `src/config/site.ts`: the hero, the contact section and the footer pick it up.
5. **Links.** LinkedIn → Contact info → Website, and a Featured link to the site; the GitHub profile's website field.

## Roadmap

| Phase | Scope | Status |
| --- | --- | --- |
| 0. Setup | Repo, Astro + TypeScript, CI, Cloudflare Workers | Done |
| 1. Design system | Tokens, fonts, grid, type scale, drawing components | Done |
| 2. Hero | The building draws itself, tilts into an exploded axonometric, floors open one by one and are clickable; still version for phones and reduced motion | Done |
| 3. Content and pages | Home sections, three case studies, first note, 404, Open Graph image, sitemap, robots.txt (CV PDF when ready) | In review |
| 4. Signature motion | Blueprint cards, View Transitions from card to case study, diagrams that assemble with decision markers | In review |
| 5. Polish | Dark mode with a switch, drawn link underlines, counting markers, coordinate readout, copy-email button, smooth in-page links | In review |
| 6. Launch | Address, analytics, links from LinkedIn, CV and GitHub | Prepared; needs the Cloudflare dashboard (below) |
