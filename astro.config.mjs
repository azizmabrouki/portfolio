// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Production URL, used for canonical links, Open Graph and the sitemap.
  // Switch to the custom domain in Phase 6.
  site: 'https://aziz-mabrouki.mabrouki.workers.dev',

  output: 'static',
  build: {
    // /notes/foo/index.html style URLs, served by Cloudflare without redirects.
    format: 'directory',
    // The CSS is a few KB per page: inline it so no stylesheet request blocks first paint.
    inlineStylesheets: 'always',
  },

  // Downloaded from Fontsource at build time and self-hosted from /_astro/fonts.
  // Archivo is one variable file with both axes (weight 100–900, width 62–125%), so every
  // weight and width the design uses costs a single download. Astro generates a
  // metric-matched fallback, so text paints at once in the fallback and swaps with no
  // layout shift. The family becomes the --font-archivo variable in tokens.css.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Archivo',
      cssVariable: '--font-archivo',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
    },
  ],
});
