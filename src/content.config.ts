/**
 * Content collections: one Markdown file per case study and per note.
 * Frontmatter is validated at build time, so a missing field fails CI, not the page.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const diagramNode = z.object({
  id: z.string(),
  label: z.string(),
  /** Small monospace annotation under the label. */
  note: z.string().optional(),
  /** Grid column and row; boxes can span several columns with `w`. */
  x: z.number(),
  y: z.number(),
  w: z.number().optional(),
  kind: z.enum(['module', 'service', 'store', 'external', 'client']).optional(),
  accent: z.boolean().optional(),
});

const diagram = z.object({
  title: z.string(),
  /** One or two sentences read by screen readers and shown under the drawing. */
  description: z.string(),
  columns: z.number(),
  rows: z.number(),
  nodes: z.array(diagramNode),
  /** Dashed boundaries around boxes, e.g. one deployable. */
  groups: z
    .array(z.object({ id: z.string(), label: z.string(), x: z.number(), y: z.number(), w: z.number(), h: z.number() }))
    .optional(),
  edges: z.array(
    z.object({ from: z.string(), to: z.string(), label: z.string().optional(), dashed: z.boolean().optional() }),
  ),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    /** One sentence: cards, meta description, social previews. Takes the lib/rich.ts markup. */
    summary: z.string(),
    /** Sheet number in the drawing set, e.g. "01". Also the display order. */
    sheet: z.string(),
    period: z.string(),
    role: z.string(),
    company: z.string().optional(),
    stack: z.array(z.string()),
    numbers: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    decisions: z
      .array(
        z.object({
          title: z.string(),
          chose: z.string(),
          over: z.string(),
          why: z.string(),
          tradeoff: z.string(),
          /** Id of the diagram box this decision is about: it gets a numbered callout. */
          node: z.string().optional(),
        }),
      )
      .min(1),
    diagram,
    /** The 30-second version at the top of the page; takes the lib/rich.ts markup. */
    brief: z.object({ problem: z.string(), result: z.string() }).optional(),
    /** Optional "what I would do differently" paragraph. */
    differently: z.string().optional(),
    /** Shown above the case study when what can be shown is limited. */
    disclosure: z.string().optional(),
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
  }),
});

const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { projects, notes };
