/**
 * /sitemap.xml, generated at build from the pages and the content collections.
 * The design-system page and the 404 are left out on purpose.
 */
import type { APIRoute } from 'astro';
import { getNotes, getProjects } from '@/lib/content';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('http://localhost:4321/');
  const projects = await getProjects();
  const notes = await getNotes();

  const entries: { path: string; lastmod?: string }[] = [
    { path: '/' },
    ...projects.map((project) => ({ path: `/projects/${project.id}/` })),
    ...notes.map((note) => ({ path: `/notes/${note.id}/`, lastmod: note.data.date.toISOString().slice(0, 10) })),
  ];

  const urls = entries
    .map(({ path, lastmod }) => {
      const loc = `<loc>${new URL(path, base).href}</loc>`;
      return `  <url>${loc}${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
