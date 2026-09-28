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

  // Code blocks in notes take their colours from CSS variables set in global.css.
  markdown: {
    shikiConfig: { theme: 'css-variables' },
  },

  // Downloaded from Fontsource at build time and self-hosted from /_astro/fonts.
  // Astro generates a metric-matched fallback per family, so text paints at once in the
  // fallback and swaps with no layout shift. Each family becomes a CSS variable in tokens.css.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Fraunces',
      cssVariable: '--font-fraunces',
      weights: ['100 900'],
      // Upright only: the italic file alone was ~147 KB for one line of text.
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: ['100 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
    },
  ],
});
