---
title: This portfolio
summary: A static site that behaves like a set of technical drawings, shipped through CI with performance and accessibility gates. The code is public.
sheet: '03'
period: '2026'
role: Design, code and deployment
stack:
  - Astro
  - TypeScript
  - CSS custom properties
  - GSAP ScrollTrigger
  - GitHub Actions
  - Lighthouse CI
  - Cloudflare Workers
numbers:
  - value: 95+
    label: Lighthouse score required in all four categories
  - value: '4'
    label: CI gates on every pull request
  - value: 147 KB
    label: of font cut to pass the performance gate
decisions:
  - title: Static first
    chose: Astro’s static output, with JavaScript added per component.
    over: A single-page app in Next.js or React.
    why: A portfolio is read far more than it is used. Pre-rendered HTML is the fastest thing to load and the simplest thing to host.
    tradeoff: Anything dynamic, like a contact form, will need a small Worker later.
    node: assets
  - title: Motion is an enhancement
    chose: The finished drawing is written into the page; the pinned, animated version switches on only where motion is welcome and the script loads.
    over: An animation-first page that needs JavaScript to show its content.
    why: Phones, reduced-motion settings, no-JS visitors and failed downloads all get a complete page. GSAP never even loads on a phone.
    tradeoff: Two layouts of the hero to build and to test.
    node: gsap
  - title: Quality gates in CI
    chose: Every pull request must type-check, build, have no broken links and score 95+ on performance, accessibility, best practices and SEO.
    over: Checking by hand before launch.
    why: A regression fails the build instead of reaching visitors, and the rules hold when I’m tired or in a hurry.
    tradeoff: Slower pull requests, and some wishes lose. The italic serif went to pass the performance gate.
    node: ci
differently: I would put a number on font weight from the first commit. Lighthouse failed twice on fonts before it was clear that total font bytes, not preloading tricks, were the lever.
links:
  - label: Source on GitHub
    href: https://github.com/azizmabrouki/portfolio
diagram:
  title: From a push to a visitor
  description: Every push to GitHub goes two ways. GitHub Actions verifies it with four gates, while Cloudflare builds it and deploys static files to the edge, as production for main and as a preview for other branches. Browsers get HTML first; motion-capable desktops also load GSAP.
  columns: 5.5
  rows: 2
  nodes:
    - id: repo
      label: GitHub repo
      note: main + branches
      kind: client
      x: 0
      y: 0
    - id: build
      label: Workers Builds
      note: preview per branch
      x: 1.5
      y: 0
    - id: assets
      label: Static files
      note: Cloudflare edge
      kind: store
      x: 3
      y: 0
    - id: browser
      label: Visitor
      note: HTML first
      kind: client
      x: 4.5
      y: 0
    - id: ci
      label: GitHub Actions
      note: check · build · links · Lighthouse
      accent: true
      x: 0
      y: 1
      w: 1.5
    - id: gsap
      label: GSAP
      note: motion desktops only
      kind: service
      x: 4.5
      y: 1
  edges:
    - from: repo
      to: build
      label: push
    - from: build
      to: assets
      label: deploy
    - from: assets
      to: browser
      label: HTTPS
    - from: repo
      to: ci
      label: every pull request
    - from: browser
      to: gsap
      label: dynamic import
      dashed: true
---

## Context

This site has two jobs: show how I think about systems, and be a working example of how I ship them. The concept is an architect’s drawing set. The home page is a building whose floors are the layers of a software architecture, and each case study is a sheet.

## The problem

Portfolios with ambitious motion tend to be slow, inaccessible, or both. I wanted the motion without paying for it: fast on a mid-range phone, complete with reduced motion or a keyboard only, and protected against getting quietly worse over time.

## What I built

An Astro site that ships pre-rendered HTML. Every colour, size, line weight and animation timing comes from one file of design tokens. The building is drawn in CSS 3D and animated with GSAP on desktops that allow motion; everyone else gets the finished drawing. Case studies and notes are Markdown files with typed frontmatter, so this page, its numbers and its diagram come from one file.

Every pull request runs through GitHub Actions, and Cloudflare deploys each branch to its own preview URL. The [README](https://github.com/azizmabrouki/portfolio#readme) records the decisions, including the three rounds it took to get the fonts under the performance budget.
