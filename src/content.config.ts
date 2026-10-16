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

/** Where a box sits in the narrow (phone) drawing, on its own grid. */
const narrowPlace = z.object({ x: z.number(), y: z.number(), w: z.number().optional() });

const diagram = z.object({
  title: z.string(),
  /** One or two sentences shown above the drawing. */
  description: z.string(),
  /** What the drawing shows, read by screen readers. Defaults to the description. */
  alt: z.string().optional(),
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
  /**
   * The same drawing redrawn top to bottom for phones: a narrower grid and a new place for
   * every box and group. Edges are shared; `lanes` sends an edge down the left or right
   * edge of the drawing instead of straight through the boxes below it.
   */
  narrow: z
    .object({
      columns: z.number(),
      rows: z.number(),
      alt: z.string().optional(),
      nodes: z.record(z.string(), narrowPlace),
      groups: z.record(z.string(), narrowPlace.extend({ h: z.number() })).optional(),
      lanes: z.record(z.string(), z.enum(['left', 'right'])).optional(),
    })
    .optional(),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    /** Not built as a page yet: the home page says "Case study soon" instead of linking. */
    draft: z.boolean().default(false),
    /** One sentence: the page's lede, meta description, social previews. Takes the lib/rich.ts markup. */
    summary: z.string(),
    /** A shorter line for the "keep reading" cards that point to this case study. */
    teaser: z.string().optional(),
    /** Sheet number in the drawing set, e.g. "01". Also the display order. */
    sheet: z.string(),
    period: z.string(),
    role: z.string(),
    company: z.string().optional(),
    stack: z.array(z.string()),
    /** Short facts under the title: My part, Team, Shape, Now. */
    facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    numbers: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    /** Screenshots. Without `src`, the frame shows `placeholder` until the image exists. */
    screens: z
      .array(z.object({ caption: z.string(), placeholder: z.string(), src: z.string().optional(), alt: z.string().optional() }))
      .default([]),
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
    /** Id of the case study behind this note: a "keep reading" card at the end. */
    related: z.string().optional(),
    /** The aside next to the text: where the idea shows up in real work. */
    where: z.object({ text: z.string(), label: z.string(), href: z.string() }).optional(),
  }),
});

export const collections = { projects, notes };
