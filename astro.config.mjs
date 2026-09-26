// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Production URL, used for canonical links, Open Graph and the sitemap.
  // Set it once the Cloudflare Pages URL is known, e.g. 'https://aziz-mabrouki.pages.dev',
  // then switch it to the custom domain in Phase 6.
  // site: 'https://aziz-mabrouki.pages.dev',

  output: 'static',
  build: {
    // /notes/foo/index.html style URLs, served by Cloudflare Pages without redirects.
    format: 'directory',
  },
});
