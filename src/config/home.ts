/**
 * The words of the home page, section by section, in reading order.
 * Short texts take the **metric** markup (lib/rich.ts); headings are given as the lines
 * they break into, because each line is revealed on its own.
 */

/** The five layers of the system, bottom to top. Plates in the 3D world use the same order. */
export const layers = [
  { name: 'Where it runs', text: 'Cloud, servers, storage' },
  { name: 'How it scales', text: 'More capacity when traffic grows' },
  { name: 'How it ships', text: 'Every change tested and delivered' },
  { name: 'What users touch', text: 'The product itself' },
  { name: 'How it stays up', text: 'Watching, alerting, recovering' },
] as const;

export const hero = {
  /** Who I am and what I'm after, said before the headline. */
  kicker: 'Software engineer · heading for platform engineering',
  headline: ['I design systems', 'that stay up.'],
  intro:
    'Mohamed Aziz Mabrouki, in Tunis. I build backend and product systems, like a cloud-services platform with billing, support and an AI handover, and I care how they are structured, tested, shipped and run.',
  cta: { label: 'Get in touch', href: '#contact' },
  cue: 'Scroll into the system',
};

/** The sections the top bar's pipeline tracks, and the phone menu lists. Plain names, so a visitor can jump straight to the work or to contact. */
export const stages = [
  { label: 'Approach', href: '#system', menu: 'How I build' },
  { label: 'Work', href: '#work', menu: 'The work' },
  { label: 'Experience', href: '#route', menu: 'Experience' },
  { label: 'Contact', href: '#contact', menu: 'Contact' },
];

/** The compact work preview right under the hero: the strongest proof first. */
export const selected = { heading: 'Selected work', all: 'All work and details' };

/**
 * What the 3D world shows at each scene, said in words in a caption that follows the
 * scroll, so the animation always explains itself (index = scene, see scripts/world).
 */
export const scenes = [
  'The product people use, on top of the system underneath',
  'Noise: tickets, alerts and servers, all at once',
  'The system underneath, one layer per concern',
  'Live model: take a server down',
  'The work, landing on the stack',
  'The route so far, one stop at a time',
  'The next layer: your team',
];

/** The caption while HMA4Tech's olive hologram plays (it replaces scene 4's words). */
export const hologramCaption = 'HMA4Tech: a plant, scanned for anomalies';

export interface Principle {
  title: string;
  body: string;
  link?: { label: string; href: string };
  /** Indexes into `layers` of the plates this rule lights up. */
  lights: number[];
}

export const system = {
  statements: [
    {
      lines: ['Every product', 'starts as noise.'],
      body: 'Tickets, deadlines, servers, alerts, a hundred moving parts flying at you at once.',
    },
    {
      lines: ['My job is the', 'system underneath.'],
      body: 'The architecture, the pipelines and the monitoring that turn the noise into something that ships, and keeps shipping.',
    },
  ],
  rules: {
    lines: ['Four rules', 'hold it up.'],
    /** Shown only on the still page, where the rules are picked by hand. */
    hint: 'Tap a rule to see which layers of the system it holds up.',
  },
  principles: [
    {
      title: 'Boundaries first',
      body: 'One deployable with strict modules that talk through contracts, so a change in one stays in one. A module becomes a service only when a team, a scaling need or a runtime asks for it.',
      link: { label: 'Why I start with a modular monolith', href: '/notes/modular-monolith-first/' },
      lights: [1, 3],
    },
    {
      title: 'Write down the why',
      body: "Every significant decision gets an architecture decision record: the context, the options and the trade-off accepted. The next developer shouldn't have to guess, and neither should I in six months.",
      lights: [0, 1, 2, 3, 4],
    },
    {
      title: 'Test what matters',
      body: 'Tests go where a bug would hurt most. StudioLabCloud shipped with **609 automated tests** and **25** OpenAPI specs describing its API.',
      lights: [2],
    },
    {
      title: 'Ship through CI/CD',
      body: "Every change goes through a pipeline before anyone depends on it. StudioLabCloud ran on CI/CD, Kubernetes and Grafana; this site can't merge a change that scores **under 95** on Lighthouse.",
      lights: [0, 2, 4],
    },
  ] satisfies Principle[],
};

export const breakIt = {
  heading: 'Try to break it.',
  body: 'A small live model of how I build. Requests come in and servers answer them. Take one down: the others pick up the work and a replacement starts on its own.',
  caption: 'Live model, running in your browser',
  readout: {
    idle: '3 servers up · every request answered',
    down: '1 server down · every request still answered',
    healed: 'Replaced in seconds · every request answered',
  },
  button: { idle: 'Take a server down', down: 'Rerouting…', healed: 'Run it again' },
  /** How long the replacement takes to start, in milliseconds. */
  healAfter: 3200,
};

export const workIntro = { heading: "What I've built." };

export const routeIntro = { heading: 'The route so far.', board: 'Departures' };

export const notesIntro = { heading: 'Notes' };

export const contact = {
  lines: ['Last stop.', "Let's build yours."],
  lede: "I'm looking for a junior engineer role where system design matters. Tell me what you are building and I'll reply within 48 hours.",
  fields: [
    { label: 'Looking for', value: 'Junior engineer, architecture track' },
    { label: 'Based in', value: 'Tunis, open to abroad' },
    { label: 'Reply', value: 'Within 48 hours' },
    { label: 'Languages', value: 'French, English' },
  ],
  worksWith: ['Laravel', 'Spring Boot', 'Python', 'PostgreSQL', 'Docker', 'Kubernetes', 'CI/CD', 'Angular'],
};

/** "Lights up How it scales, What users touch", or "Every layer". */
export function lightsLabel(lights: number[]): string[] {
  if (lights.length === layers.length) return ['Every layer'];
  return lights.map((index) => layers[index]?.name ?? '');
}
