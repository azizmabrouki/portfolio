/**
 * Terms a recruiter may not know, each with a one-line definition. Marked in content as
 * [[RAG]] or [[shown words|term-id]] (see src/lib/rich.ts), or in Markdown bodies with
 * <button type="button" class="term" popovertarget="term-<id>">words</button>.
 * PageLayout renders one popover per term; the buttons open them.
 */

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
}

export const glossary: GlossaryTerm[] = [
  {
    id: 'adr',
    term: 'Architecture decision record (ADR)',
    definition: 'A short document that records one decision: the context, the options considered and the trade-off accepted.',
  },
  {
    id: 'ci-cd',
    term: 'CI/CD',
    definition: 'Continuous integration and delivery: every change is built, tested and deployed by an automated pipeline.',
  },
  {
    id: 'dto',
    term: 'Data transfer object (DTO)',
    definition: 'A plain object that carries data across a boundary, with no behaviour of its own.',
  },
  {
    id: 'idempotent',
    term: 'Idempotent',
    definition: 'Safe to repeat: handling the same request or event twice has the same effect as handling it once.',
  },
  {
    id: 'jwt',
    term: 'JWT',
    definition: 'JSON Web Token: a signed token sent with each request, so the server can check who is calling without keeping a session.',
  },
  {
    id: 'modular-monolith',
    term: 'Modular monolith',
    definition: 'One deployable application split into modules with strict boundaries, which talk to each other only through defined contracts.',
  },
  {
    id: 'openapi',
    term: 'OpenAPI',
    definition: 'A standard, machine-readable description of an HTTP API: its endpoints, inputs and responses.',
  },
  {
    id: 'rag',
    term: 'RAG',
    definition: 'Retrieval-augmented generation: a language model answers from documents it looks up first, instead of from memory alone.',
  },
  {
    id: 'rbac',
    term: 'Role-based access control (RBAC)',
    definition: 'What a user may see and change depends on their role, not on who they are.',
  },
];

const byId = new Map(glossary.map((entry) => [entry.id, entry]));

/** The entry for "RAG", "rag" or "modular monolith": ids are the words, lowercased and dashed. */
export function findTerm(key: string): GlossaryTerm | undefined {
  const id = key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return byId.get(id);
}
