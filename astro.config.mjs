// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Production URL, used for canonical links, Open Graph and the sitemap.
  // Switch to the custom domain in Phase 6.
  site: 'https://aziz-mabrouki.mohamedaziz-mabrouki.workers.dev',

  output: 'static',
  build: {
    // /notes/foo/index.html style URLs, served by Cloudflare without redirects.
    format: 'directory',
  },

  // Downloaded from Fontsource at build time and self-hosted from /_astro/fonts.
  // Astro generates a metric-matched fallback per family, so text does not jump when
  // the real font arrives. Each family becomes a CSS variable that tokens.css reads.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Fraunces',
      cssVariable: '--font-fraunces',
      weights: ['100 900'],
      styles: ['normal', 'italic'],
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

    // Heading candidates compared on /style. Remove the two that are not chosen.
    {
      provider: fontProviders.fontsource(),
      name: 'Lora',
      cssVariable: '--font-lora',
      weights: ['400 700'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      weights: ['200 800'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['serif'],
    },
  ],
});
