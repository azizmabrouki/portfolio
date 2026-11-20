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
  /** The role sought, said first: titles, the hero, structured data. */
  role: string;
  /** The ESPRIT degree title. Never "software architect": that is a senior title. */
  degree: string;
  description: string;
  locale: string;
  city: string;
  /** Where I work from, as said next to the contact details. */
  workFrom: string;
  /** How fast I answer, said wherever the visitor is about to write. */
  reply: string;
  /** Public repository of this site. */
  repo: string;
  links: {
    github: string;
    linkedin: string;
    /** Plain address; rendered as a mailto: link. */
    email: string;
    /** Path under public/, e.g. /cv.pdf. The "Download CV" button stays hidden while empty. */
    cv: string;
  };
  /** Subject line of every "Email me" link. */
  emailSubject: string;
  /** Links of the top bar, after the Board / List switch. */
  nav: SiteLink[];
  /**
   * Cloudflare Web Analytics: cookie-free, no consent banner needed. Paste the token from
   * the dashboard (Analytics & Logs → Web Analytics → Add a site) to switch it on.
   */
  analytics: { cloudflareToken: string };
}

export const site: SiteConfig = {
  name: 'Mohamed Aziz Mabrouki',
  shortName: 'Aziz Mabrouki',
  role: 'Full-stack engineer',
  degree: 'Software architecture engineer',
  description:
    'Mohamed Aziz Mabrouki, full-stack engineer in Tunis. I design and build whole products, from the interface people click to the servers that keep it running.',
  locale: 'en',
  city: 'Tunis',
  workFrom: 'Tunis, GMT+1 · open to remote work and relocation',
  reply: 'I reply within 48 hours, in French or English.',
  repo: 'https://github.com/azizmabrouki/portfolio',

  links: {
    github: 'https://github.com/azizmabrouki',
    linkedin: 'https://www.linkedin.com/in/mohamed-aziz-mabrouki/',
    email: 'mouhamed.aziz.mabrouki@outlook.com',
    cv: '', // set to /cv.pdf once public/cv.pdf exists
  },
  emailSubject: "Let's talk",

  nav: [{ label: 'Contact', href: '/#contact' }],

  analytics: { cloudflareToken: '' },
};

/** mailto: link with an optional subject, e.g. for "Report a broken link". */
export function mailto(subject: string = site.emailSubject): string {
  return `mailto:${site.links.email}?subject=${encodeURIComponent(subject).replace(/'/g, '%27')}`;
}

/** "© 2026 Mohamed Aziz Mabrouki · Full-stack engineer · Tunis". */
export const footerLine = `© ${new Date().getFullYear()} ${site.name} · ${site.role} · ${site.city}`;
