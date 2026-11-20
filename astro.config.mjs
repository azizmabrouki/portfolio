// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Production URL, used for canonical links, Open Graph and the sitemap.
  // Switch to the custom domain in Phase 6.
  site: 'https://aziz-mabrouki.mabrouki.workers.dev',

  output: 'static',
  // Scope component styles with a class, which Astro also passes down through `class`
  // props: a section styling the frame it wraps (e.g. the yellow Contact sheet) works.
  scopedStyleStrategy: 'class',
  build: {
    // /notes/foo/index.html style URLs, served by Cloudflare without redirects.
    format: 'directory',
    // The CSS is a few KB per page: inline it so no stylesheet request blocks first paint.
    inlineStylesheets: 'always',
  },

  // Downloaded from Fontsource at build time and self-hosted from /_astro/fonts. Each family
  // is one variable file; Astro generates metric-matched fallbacks, so text paints at once in
  // the fallback and swaps with no layout shift. Martian Mono is only used for measurements
  // (rulers, frame sizes), so it ships a single weight.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Funnel Display',
      cssVariable: '--font-funnel-display',
      weights: ['300 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Funnel Sans',
      cssVariable: '--font-funnel-sans',
      weights: ['300 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Martian Mono',
      cssVariable: '--font-martian-mono',
      weights: ['500'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'Menlo', 'monospace'],
    },
  ],
});
