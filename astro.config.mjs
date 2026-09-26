// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Production URL, used for canonical links, Open Graph and the sitemap.
  // Set it once the Cloudflare URL is known (https://aziz-mabrouki.<account>.workers.dev),
  // then switch it to the custom domain in Phase 6.
  // site: 'https://aziz-mabrouki.example.workers.dev',

  output: 'static',
  build: {
    // /notes/foo/index.html style URLs, served by Cloudflare without redirects.
    format: 'directory',
  },
});
