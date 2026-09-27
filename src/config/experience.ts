/**
 * Experience, education and certifications for the timeline on the home page.
 * Newest first. Mirrors the LinkedIn profile; edit both together.
 * Summaries and highlights take the ==highlight==, **metric** and [[term]] markup (lib/rich.ts).
 */

export interface Role {
  company: string;
  role: string;
  period: string;
  /** ISO year-month, for the <time> element. */
  start: string;
  end: string;
  mode?: string;
  /** Main technologies, shown under the role and used by the stack filter. */
  stack: string[];
  summary: string;
  highlights: string[];
  /** Slug of the matching case study, if there is one. */
  caseStudy?: string;
}

export interface Credential {
  title: string;
  issuer: string;
  date: string;
  href?: string;
}

export const roles: Role[] = [
  {
    company: 'StudioLab',
    role: 'Software architect intern, final-year project',
    period: 'Feb – Aug 2026',
    start: '2026-02',
    end: '2026-08',
    mode: 'Hybrid',
    stack: ['Laravel', 'PHP', 'Stripe', 'Python', 'Docker', 'Kubernetes', 'Grafana', 'CI/CD'],
    summary:
      'Designed and built StudioLabCloud, a SaaS platform for selling and managing cloud services to French-speaking clients. I ==owned the whole chain==: architecture, interface design, implementation, tests and deployment.',
    highlights: [
      'A [[modular monolith]] in Laravel, with explicit module contracts, DTOs and [[architecture decision records|adr]]',
      'Recurring Stripe billing in several currencies, with [[idempotent]] webhook processing: ==a replayed event never charges twice==',
      'Support ticketing, client messaging and video calls, plus a Python [[RAG]] assistant with human handover',
      '**609 automated tests**, **25** [[OpenAPI]] specs, [[CI/CD]], Kubernetes and Grafana; **3 releases** over 6 Scrum sprints',
    ],
    caseStudy: 'studiolabcloud',
  },
  {
    company: 'HMA4Tech',
    role: 'Full-stack engineer, internship',
    period: 'Dec 2024 – Dec 2025',
    start: '2024-12',
    end: '2025-12',
    stack: ['Java', 'Spring Boot', 'Spring Security', 'PostgreSQL', 'Docker'],
    summary:
      'An AI platform that detects anomalies in plants, built by an agile startup team of AI engineers and developers.',
    highlights: [
      'Designed and built **10+** Spring Boot REST endpoints for the platform’s back end',
      'Secured the API with [[JWT]] authentication and [[role-based access control|rbac]]',
      'Containerized the back-end services with Docker: **about 40% fewer** environment-related deployment issues',
      'Tuned PostgreSQL queries: average API response time ==down **20–30%**==',
    ],
    caseStudy: 'hma4tech',
  },
  {
    company: 'Sofinrec',
    role: 'Full-stack engineer intern',
    period: 'Jul – Sep 2023',
    start: '2023-07',
    end: '2023-09',
    mode: 'On-site',
    stack: ['Java', 'Spring Boot', 'Angular'],
    summary: 'An internal web app for planning and coordinating meetings, used by **20+ staff**.',
    highlights: [
      'Back-end business logic in Spring Boot, exposed as REST APIs to an Angular front end',
      'Automated meeting scheduling and email notifications: **about 30% less** manual coordination',
      'Email services that generate and send meeting invitations and summaries',
    ],
  },
];

export const education = {
  school: 'ESPRIT',
  degree: 'Engineer’s degree in software engineering, software architecture track',
  period: '2021 – 2026',
};

export const credentials: Credential[] = [
  {
    title: 'AWS Academy Graduate: Cloud Foundations',
    issuer: 'Amazon Web Services',
    date: 'Feb 2026',
  },
  {
    title: 'CCNA: Switching, Routing, and Wireless Essentials',
    issuer: 'Cisco Networking Academy',
    date: 'Sep 2024',
    href: 'https://www.credly.com/badges/2ad1de0f-d4fe-4e52-863b-0f301715123d',
  },
];

export const languages = ['French', 'English'];
