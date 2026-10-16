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
  /** IANA time zone of the clock in the top bar and on the departures board. */
  timeZone: string;
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
  /** The top bar of every page but the home page: brand · All work · Contact. */
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
  role: 'Software engineer, heading for platform engineering',
  degree: 'Software architecture engineer',
  description:
    'Mohamed Aziz Mabrouki, software engineer in Tunis, heading for platform engineering. I build backend and product systems, with clear boundaries, tested delivery and cloud services.',
  locale: 'en',
  city: 'Tunis',
  timeZone: 'Africa/Tunis',
  repo: 'https://github.com/azizmabrouki/portfolio',

  links: {
    github: 'https://github.com/azizmabrouki',
    linkedin: 'https://www.linkedin.com/in/mohamed-aziz-mabrouki/',
    email: 'mouhamed.aziz.mabrouki@outlook.com',
    cv: '', // set to /cv.pdf once public/cv.pdf exists
  },
  emailSubject: "Let's talk",

  nav: [
    { label: 'All work', href: '/#work' },
    { label: 'Contact', href: '/#contact' },
  ],

  analytics: { cloudflareToken: '' },
};

/** mailto: link with an optional subject, e.g. for "Report a broken link". */
export function mailto(subject: string = site.emailSubject): string {
  return `mailto:${site.links.email}?subject=${encodeURIComponent(subject).replace(/'/g, '%27')}`;
}

/** "© 2026 Mohamed Aziz Mabrouki · Software architecture engineer · Tunis": the degree title. */
export const footerLine = `© ${new Date().getFullYear()} ${site.name} · ${site.degree} · ${site.city}`;
