/**
 * Single source of truth for identity, links and navigation.
 * Components read from here; nothing personal is hard-coded elsewhere.
 * An empty string hides that link everywhere.
 */

export interface SiteLink {
  label: string;
  href: string;
}

export interface SiteConfig {
  name: string;
  shortName: string;
  role: string;
  description: string;
  locale: string;
  availability: string;
  /** Public repository of this site. */
  repo: string;
  links: {
    github: string;
    linkedin: string;
    /** Plain address; rendered as a mailto: link. */
    email: string;
    /** Path under public/, e.g. /cv.pdf */
    cv: string;
  };
  nav: SiteLink[];
}

export const site: SiteConfig = {
  name: 'Mohamed Aziz Mabrouki',
  shortName: 'Aziz Mabrouki',
  role: 'Software engineer, growing into software architecture',
  description:
    'Portfolio of Mohamed Aziz Mabrouki — a software engineer who designs systems with clear boundaries, written-down decisions and CI/CD from day one.',
  locale: 'en',
  availability: 'Tunisia · Europe · Remote',
  repo: 'https://github.com/azizmabrouki/portfolio',

  links: {
    github: 'https://github.com/azizmabrouki',
    linkedin: '', // e.g. https://www.linkedin.com/in/<handle>
    email: '',
    cv: '', // set to /cv.pdf once public/cv.pdf exists (Phase 3)
  },

  nav: [], // filled in Phase 3: Work, How I work, Experience, Notes, Contact
};

/** Links that are actually set, in display order. */
export function contactLinks(): SiteLink[] {
  const { github, linkedin, email, cv } = site.links;
  const links: SiteLink[] = [];
  if (cv) links.push({ label: 'CV', href: cv });
  if (linkedin) links.push({ label: 'LinkedIn', href: linkedin });
  if (github) links.push({ label: 'GitHub', href: github });
  if (email) links.push({ label: 'Email', href: `mailto:${email}` });
  return links;
}
