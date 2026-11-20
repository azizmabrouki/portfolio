/**
 * The career, drawn as one timeline in the Experience frame and listed as a table under it.
 * Newest first. Mirrors the LinkedIn profile; edit both together.
 * Months are ISO "YYYY-MM"; `end: 'now'` draws the bar up to the build date.
 */

export interface Role {
  company: string;
  role: string;
  period: string;
  start: string;
  end: string | 'now';
  /** One line for the table: what I did there. */
  summary: string;
  /** Anchor of the frame on the board that shows this work. */
  frame?: string;
}

export interface Credential {
  title: string;
  short: string;
  issuer: string;
  date: string;
  month: string;
  href?: string;
}

export const roles: Role[] = [
  {
    company: 'StudioLab',
    role: 'Freelance engineer',
    period: 'Since 2026',
    start: '2026-08',
    end: 'now',
    summary: 'I keep StudioLabCloud running and extend it.',
    frame: 'studiolabcloud',
  },
  {
    company: 'StudioLab',
    // Placeholder wording: the exact internship title is still to be confirmed.
    role: 'Final-year project intern',
    period: 'Feb – Aug 2026',
    start: '2026-02',
    end: '2026-08',
    summary:
      'Designed and built StudioLabCloud alone: Stripe billing, support desk, RAG assistant, 609 tests, Kubernetes and Grafana.',
    frame: 'studiolabcloud',
  },
  {
    company: 'HMA4Tech',
    role: 'Full-stack engineer, internship',
    period: 'Dec 2024 – Dec 2025',
    start: '2024-12',
    end: '2025-12',
    summary: 'A Spring Boot API secured with JWT and roles, Docker everywhere, queries 20–30% faster.',
    frame: 'hma4tech',
  },
  {
    company: 'Sofinrec',
    role: 'Full-stack engineer intern',
    period: 'Jul – Sep 2023',
    start: '2023-07',
    end: '2023-09',
    summary: 'A meeting planner for 20+ staff, in Spring Boot and Angular.',
    frame: 'sofinrec',
  },
];

export const education = {
  school: 'ESPRIT',
  degree: 'Engineer’s degree in software engineering, software architecture track',
  period: '2021 – 2026',
  start: '2021-09',
  end: '2026-07',
};

export const credentials: Credential[] = [
  {
    title: 'AWS Academy Graduate: Cloud Foundations',
    short: 'AWS',
    issuer: 'Amazon Web Services',
    date: 'Feb 2026',
    month: '2026-02',
  },
  {
    title: 'CCNA: Switching, Routing, and Wireless Essentials',
    short: 'CCNA',
    issuer: 'Cisco Networking Academy',
    date: 'Sep 2024',
    month: '2024-09',
    href: 'https://www.credly.com/badges/2ad1de0f-d4fe-4e52-863b-0f301715123d',
  },
];

export const languages = ['French', 'English'];

export const tools = 'Laravel, PHP, Spring Boot, Java, Angular, Python, PostgreSQL, Stripe, Docker, Kubernetes, GitHub Actions, Grafana';

/** The years the timeline spans, left edge to right edge. */
export const span = { from: 2021, to: 2027 };

/** Position of a month on the timeline, 0–100 (%). */
export function onTimeline(month: string | 'now'): number {
  const date = month === 'now' ? new Date() : new Date(`${month}-01T00:00:00Z`);
  const years = date.getUTCFullYear() + date.getUTCMonth() / 12;
  return Math.min(100, Math.max(0, ((years - span.from) / (span.to - span.from)) * 100));
}
