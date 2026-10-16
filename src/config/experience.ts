/**
 * The career, as the departures board on the home page ("The route so far"): one stop
 * per row, oldest first. Roles add a detail panel that opens from their row.
 * Highlights take the **metric** markup (lib/rich.ts). Mirrors the LinkedIn profile;
 * edit both together.
 */

export interface Role {
  company: string;
  /** Shown in the panel's first line, before the period. */
  role: string;
  period: string;
  mode?: string;
  /** Extra words at the end of the panel's first line. */
  note?: string;
  stack: string[];
  highlights: string[];
  /** Id of the matching case study in src/content/projects, if there is one. */
  caseStudy?: string;
}

export type StopStatus = 'departed' | 'arrived' | 'on-time';

export interface Stop {
  when: string;
  stop: string;
  detail: string;
  status: StopStatus;
  /** Company of the role whose panel opens from this row. */
  role?: string;
  /** A credential's proof link; without `href` it shows as a visible placeholder. */
  proof?: { label: string; href?: string };
}

export const roles: Role[] = [
  {
    company: 'Sofinrec',
    role: 'Full-stack engineer intern',
    period: 'Jul – Sep 2023',
    mode: 'On-site',
    stack: ['Java', 'Spring Boot', 'Angular'],
    highlights: [
      'Back-end business logic in Spring Boot, exposed as REST APIs to an Angular front end',
      'Automated meeting scheduling and email notifications: **about 30% less** manual coordination',
      'Email services that generate and send meeting invitations and summaries',
    ],
  },
  {
    company: 'HMA4Tech',
    role: 'Full-stack engineer, internship',
    period: 'Dec 2024 – Dec 2025',
    stack: ['Java', 'Spring Boot', 'Spring Security', 'PostgreSQL', 'Docker'],
    highlights: [
      'Designed and built **10+** Spring Boot REST endpoints for the platform’s back end',
      'Secured the API with JWT authentication and role-based access control',
      'Containerized the back-end services with Docker: **about 40% fewer** environment-related deployment issues',
      'Tuned PostgreSQL queries: average API response time down **20–30%**',
    ],
    caseStudy: 'hma4tech',
  },
  {
    company: 'StudioLab',
    // Placeholder wording: the exact internship title is still to be confirmed.
    role: 'Intern, final-year project',
    period: 'Feb – Aug 2026',
    mode: 'Hybrid',
    note: 'built solo with the product owner',
    stack: ['Laravel', 'PHP', 'Stripe', 'Python', 'Docker', 'Kubernetes', 'Grafana', 'CI/CD'],
    highlights: [
      'A modular monolith in Laravel, with explicit module contracts, DTOs and architecture decision records',
      'Recurring Stripe billing in several currencies, with idempotent webhooks: a replayed event is applied once, covered by replay tests',
      'Support ticketing, client messaging and video calls, plus a Python RAG assistant that hands over to a person',
      '**609** automated tests, **25** OpenAPI specs, CI/CD, Kubernetes and Grafana; **3 releases** over 6 sprints',
    ],
    caseStudy: 'studiolabcloud',
  },
];

export const route: Stop[] = [
  { when: '2021', stop: 'ESPRIT, Tunis', detail: 'Engineering studies begin.', status: 'departed' },
  { when: '2023', stop: 'Sofinrec', detail: 'Meeting planner for 20+ staff.', status: 'arrived', role: 'Sofinrec' },
  {
    when: '2024',
    stop: 'Cisco CCNA (SRWE)',
    detail: 'Cisco Networking Academy',
    status: 'arrived',
    proof: { label: 'Credly badge', href: 'https://www.credly.com/badges/2ad1de0f-d4fe-4e52-863b-0f301715123d' },
  },
  {
    when: '2024',
    stop: 'HMA4Tech',
    detail: 'Back end of a plant-anomaly AI platform.',
    status: 'arrived',
    role: 'HMA4Tech',
  },
  {
    when: '2026',
    stop: 'AWS Cloud Foundations',
    detail: 'AWS Academy Graduate',
    status: 'arrived',
    // Placeholder: the proof link is still to be added.
    proof: { label: '[Proof link]' },
  },
  {
    when: '2026',
    stop: 'StudioLab',
    detail: 'Final-year project: StudioLabCloud.',
    status: 'arrived',
    role: 'StudioLab',
  },
  { when: '2026', stop: 'Graduation, ESPRIT', detail: 'Engineer’s degree, architecture track.', status: 'arrived' },
  // Freelance highlights are still to be written; the row has no panel until then.
  { when: '2026', stop: 'Freelance, StudioLabCloud', detail: 'CI/CD, Kubernetes and Grafana.', status: 'on-time' },
];

/** The last row of the board: the visitor's team, linking to Contact. */
export const nextStop = {
  when: 'Next',
  stop: 'Your team',
  detail: 'Junior engineer, Tunisia or abroad.',
  cta: { label: 'Book a seat', href: '#contact' },
};

export const statusLabel: Record<StopStatus, string> = {
  departed: 'Departed',
  arrived: 'Arrived',
  'on-time': 'On time',
};

export const roleOf = (company: string | undefined): Role | undefined =>
  company ? roles.find((role) => role.company === company) : undefined;
