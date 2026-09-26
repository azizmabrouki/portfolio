// @ts-check
import { defineConfig } from 'astro/config';

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
});
