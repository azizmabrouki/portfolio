/**
 * The building on the home page: one floor per architecture layer, top to bottom,
 * each opening into a section. Edit the words here; the drawing and the scroll
 * sequence follow automatically. Phase 3 moves the longer content into collections.
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
  /** Drawn in vermilion at all times: the domain layer is the heart of the drawing. */
  accent?: boolean;
}

export const floors: Floor[] = [
  {
    id: 'presentation',
    number: '04',
    layer: 'Presentation layer',
    title: 'Who I am',
    lead: 'A junior software engineer who designs systems with clear boundaries, writes down the why, and ships through CI/CD.',
    meta: 'Tunisia · Europe · Remote',
  },
  {
    id: 'application',
    number: '03',
    layer: 'Application layer',
    title: 'Selected work',
    items: [
      {
        title: 'StudioLabCloud',
        text: 'SaaS for selling and managing cloud services. Modular Laravel monolith, multi-currency Stripe billing, RAG assistant.',
      },
      {
        title: 'HMA4Tech',
        text: 'Plant-anomaly platform. Spring Boot API, JWT and RBAC, tuned PostgreSQL.',
      },
    ],
  },
  {
    id: 'domain',
    number: '02',
    layer: 'Domain layer',
    title: 'How I work',
    accent: true,
    items: [
      { title: 'Boundaries first.', text: 'Modules before microservices.' },
      { title: 'Write down the why.', text: 'Every big decision has an ADR.' },
      { title: 'Test what matters.', text: '609 tests on StudioLabCloud.' },
      { title: 'Ship through CI/CD.', text: 'Including this site.' },
    ],
  },
  {
    id: 'infrastructure',
    number: '01',
    layer: 'Infrastructure layer',
    title: 'Experience',
    items: [
      { title: 'StudioLab', text: 'StudioLabCloud, from billing to Kubernetes and Grafana.' },
      { title: 'HMA4Tech', text: 'Plant-anomaly platform, Docker and PostgreSQL tuning.' },
      { title: 'Sofinrec' },
    ],
  },
];
