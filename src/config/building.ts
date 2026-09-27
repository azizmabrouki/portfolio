/**
 * The building on the home page: one floor per architecture layer, top to bottom,
 * each opening into a section. Edit the words here; the drawing and the scroll
 * sequence follow automatically. Each floor summarises a full section further down.
 * Leads and item texts take the ==highlight==, **metric** and [[term]] markup (lib/rich.ts).
 */

export interface FloorItem {
  title: string;
  text?: string;
}

export interface Floor {
  /** Anchor of the floor's section: #layer-<id> */
  id: 'presentation' | 'application' | 'domain' | 'infrastructure';
  number: string;
  layer: string;
  title: string;
  lead?: string;
  items?: FloorItem[];
  meta?: string;
  /** The full section further down the home page. */
  more: { href: string; label: string };
  /** Drawn in vermilion at all times: the domain layer is the heart of the drawing. */
  accent?: boolean;
}

export const floors: Floor[] = [
  {
    id: 'presentation',
    number: '04',
    layer: 'Presentation layer',
    title: 'Who I am',
    lead: 'I like systems that are ==easy to run at 3 a.m.== I graduate from ESPRIT’s software architecture track in 2026 and I’m looking for a junior engineer role where I can grow toward architecture.',
    meta: 'Tunis · open to Tunisia, Europe and remote',
    more: { href: '#contact', label: 'Get in touch' },
  },
  {
    id: 'application',
    number: '03',
    layer: 'Application layer',
    title: 'Selected work',
    items: [
      {
        title: 'StudioLabCloud.',
        text: 'SaaS for selling and managing cloud services: ==modular monolith==, multi-currency billing, [[RAG]] assistant.',
      },
      {
        title: 'HMA4Tech.',
        text: 'The ==secured, containerized== Spring Boot back end of a plant-anomaly AI platform.',
      },
      { title: 'This portfolio.', text: 'Static, fast, and shipped through CI with **95+** quality gates.' },
    ],
    more: { href: '#work', label: 'Read the case studies' },
  },
  {
    id: 'domain',
    number: '02',
    layer: 'Domain layer',
    title: 'How I work',
    accent: true,
    items: [
      { title: 'Boundaries first.', text: 'Modules before microservices.' },
      { title: 'Write down the why.', text: 'Big decisions get a decision record.' },
      { title: 'Test what matters.', text: '**609 tests** on StudioLabCloud.' },
      { title: 'Ship through CI/CD.', text: 'Including this site.' },
    ],
    more: { href: '#how-i-work', label: 'The four principles in detail' },
  },
  {
    id: 'infrastructure',
    number: '01',
    layer: 'Infrastructure layer',
    title: 'Experience',
    items: [
      { title: 'StudioLab, 2026.', text: 'StudioLabCloud, from billing to Kubernetes and Grafana.' },
      { title: 'HMA4Tech, 2024–25.', text: 'Spring Boot API, JWT and RBAC, Docker, PostgreSQL tuning.' },
      { title: 'Sofinrec, 2023.', text: 'Meeting planner for **20+ staff**, Spring Boot and Angular.' },
    ],
    more: { href: '#experience', label: 'The full timeline' },
  },
];
