/**
 * The four work slots on the home page, A to D. A slot links to its case study when the
 * matching entry in src/content/projects is published (not a draft); until then it says
 * "Case study soon". Texts in [brackets] are placeholders still to be written.
 */

export interface WorkSlot {
  slot: 'A' | 'B' | 'C' | 'D';
  name: string;
  /** Shown in the index next to the name; omitted when `status` is set. */
  years?: string;
  /** A badge such as "In progress" instead of the years. */
  status?: string;
  pitch: string;
  /** A different pitch for the still page (phones, reduced motion, no JavaScript). */
  pitchStill?: string;
  facts: { label: string; text: string }[];
  builtWith: string;
  /** Id of the case study in src/content/projects. */
  project?: string;
  links?: { label: string; href: string }[];
  /** Indexes of the layers (config/home.ts) lit in the 3D world while this slot is read. */
  lights: number[];
  /** Placeholder shown on the slot's screen in the 3D world until a screenshot exists. */
  screen: string;
  /** The screenshot on that screen, under public/ (16:10); without it the placeholder shows. */
  screenImage?: string;
  /**
   * Instead of a screen landing on the stack, the top plate projects a gold hologram of an
   * olive tree (scripts/world/hologram.html), and the phone card shows it flat.
   */
  hologram?: boolean;
  /** Shown in "Selected work" under the hero: my role and the strongest result, one line each. */
  glance?: { role: string; result: string };
}

export const work: WorkSlot[] = [
  {
    slot: 'A',
    name: 'StudioLabCloud',
    years: '2026',
    pitch:
      "A modular SaaS platform where StudioLab's French-speaking clients order cloud services, pay for them every month and get help.",
    facts: [
      {
        label: 'My part',
        text: 'Final-year project. I owned the whole chain, from architecture to deployment, alone with the product owner, and I keep it running as a freelancer.',
      },
      {
        label: 'What it changed',
        text: 'Shipped in 3 releases over 6 sprints: billing in several currencies where a replayed payment event is applied once, a support desk whose AI assistant hands over to a person, 609 automated tests and 25 OpenAPI specs.',
      },
    ],
    builtWith: 'Laravel, Stripe, Python (RAG), Docker, Kubernetes, Grafana, CI/CD',
    project: 'studiolabcloud',
    lights: [0, 1, 2, 3, 4],
    screen: 'Screenshot: StudioLabCloud',
    screenImage: '/shots/studiolabcloud/catalogue.webp',
    glance: {
      role: 'Sole engineer, from architecture to deployment, with the product owner',
      result: '3 releases over 6 sprints, 609 automated tests, and I still run it',
    },
  },
  {
    slot: 'B',
    name: 'HMA4Tech',
    years: '2024–25',
    pitch: 'The back end of an AI platform that detects anomalies in plants: a secured Spring Boot API, containerized and tuned.',
    facts: [
      {
        label: 'My part',
        text: 'Full-stack engineer for a year, Dec 2024 to Dec 2025, in an agile startup team of AI engineers and developers. 10+ REST endpoints, JWT and role-based access.',
      },
      {
        label: 'What it changed',
        text: 'About 40% fewer environment-related deployment issues once everything ran in containers, and average API responses 20–30% faster after query tuning.',
      },
    ],
    builtWith: 'Java, Spring Boot, Spring Security, JWT, PostgreSQL, Docker',
    project: 'hma4tech',
    lights: [0, 3],
    hologram: true,
    glance: {
      role: 'Full-stack engineer in an agile startup team, for a year',
      result: 'A Spring Boot API secured with JWT and roles, containerized with Docker',
    },
    screen: 'Screenshot: HMA4Tech',
  },
  {
    slot: 'C',
    name: 'This portfolio',
    years: '2026',
    pitch:
      'The page you are scrolling: a 3D model of how I build, that still loads fast and reads completely without motion or JavaScript.',
    pitchStill:
      'The page you are reading: a model of how I build that loads fast and reads completely without motion or JavaScript. On a phone it trades the 3D world for this lighter page.',
    facts: [
      { label: 'My part', text: 'Design, code and deployment, alone. The code is public.' },
      {
        label: 'What it changed',
        text: 'A regression fails the build instead of reaching you: every pull request must pass four CI gates, including 95+ in all four Lighthouse categories, before Cloudflare deploys it.',
      },
    ],
    builtWith: 'Astro, TypeScript, CSS 3D, GitHub Actions, Lighthouse CI, Cloudflare Workers',
    project: 'this-portfolio',
    links: [{ label: 'Source on GitHub', href: 'https://github.com/azizmabrouki/portfolio' }],
    lights: [0, 2],
    screen: 'Screenshot: this portfolio',
  },
  {
    slot: 'D',
    name: 'Orbit',
    status: 'In progress',
    // Placeholders: Orbit's description, status, stack and repository are still to be written.
    pitch: 'My own internal developer platform: [one sentence on what it gives a developer].',
    facts: [
      { label: 'Where it stands', text: '[What works today, and what comes next.]' },
      { label: 'My part', text: 'Personal project, built alone.' },
    ],
    builtWith: "[Orbit's stack]",
    links: [{ label: 'See it on GitHub', href: 'https://github.com/azizmabrouki' }],
    lights: [1, 3],
    screen: 'Screenshot: Orbit',
  },
];
