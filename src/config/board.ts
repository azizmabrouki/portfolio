/**
 * The board on the home page: where every frame lies on the mat (world pixels), and the
 * stops of the tour, in reading order. The page's HTML follows the same order, so the List
 * view, phones and screen readers read the frames top to bottom; on wide screens the board
 * script lays them out at these positions and flies a camera between the stops.
 *
 * Moving a frame means editing its rectangle here and, if it is a stop, the stop's
 * rectangle too. Frames are 'paper' (white sheet), 'ghost' (dashed, not laid yet) or
 * 'loose' (nothing under it: the sticky notes).
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Stop extends Rect {
  /** Anchor of the frame or group: /#studiolabcloud flies straight there. */
  id: string;
  name: string;
}

export const stops: Stop[] = [
  { id: 'intro', name: 'Intro', x: 0, y: 0, w: 1280, h: 800 },
  { id: 'studiolabcloud', name: 'StudioLabCloud', x: 0, y: 1080, w: 1280, h: 880 },
  { id: 'clients-path', name: 'StudioLabCloud: the client’s path', x: 1440, y: 1080, w: 1960, h: 1380 },
  { id: 'hma4tech', name: 'HMA4Tech', x: 0, y: 2660, w: 1120, h: 720 },
  { id: 'sofinrec', name: 'Sofinrec', x: 1280, y: 2660, w: 760, h: 720 },
  { id: 'side-projects', name: 'This board and Orbit', x: 2200, y: 2660, w: 1480, h: 720 },
  { id: 'how-i-work', name: 'How I work', x: 0, y: 3600, w: 1360, h: 560 },
  { id: 'experience', name: 'Experience', x: 1520, y: 3600, w: 1360, h: 1240 },
  { id: 'contact', name: 'Contact', x: 0, y: 5060, w: 1440, h: 760 },
];

export interface Frame extends Rect {
  /** Name strip above the frame. */
  label: string;
  /** Index of the stop this frame belongs to. */
  stop: number;
}

export const frames = {
  intro: { label: 'Intro', stop: 0, x: 0, y: 0, w: 1280, h: 800 },
  studiolabcloud: { label: 'StudioLabCloud / Overview', stop: 1, x: 0, y: 1080, w: 1280, h: 880 },
  catalogue: { label: 'StudioLabCloud / Catalogue', stop: 2, x: 1440, y: 1080, w: 800, h: 500 },
  cart: { label: 'StudioLabCloud / Cart and checkout', stop: 2, x: 2440, y: 1080, w: 960, h: 600 },
  support: { label: 'StudioLabCloud / Support desk', stop: 2, x: 1900, y: 1860, w: 960, h: 600 },
  hma4tech: { label: 'HMA4Tech', stop: 3, x: 0, y: 2660, w: 1120, h: 720 },
  sofinrec: { label: 'Sofinrec', stop: 4, x: 1280, y: 2660, w: 760, h: 720 },
  thisBoard: { label: 'This board', stop: 5, x: 2200, y: 2660, w: 760, h: 720 },
  orbit: { label: 'Orbit (in progress)', stop: 5, x: 3120, y: 2660, w: 560, h: 720 },
  how: { label: 'How I work', stop: 6, x: 0, y: 3600, w: 1360, h: 560 },
  experience: { label: 'Experience', stop: 7, x: 1520, y: 3600, w: 1360, h: 1240 },
  contact: { label: 'Contact', stop: 8, x: 0, y: 5060, w: 1440, h: 760 },
} satisfies Record<string, Frame>;

/** Everything on the board, with a margin: what "Whole board" fits on screen. */
export const bounds: Rect = { x: -160, y: -160, w: 4000, h: 6140 };

/**
 * Comment pins: a note from me, pinned where it applies. Board only; on phones and in the
 * List view the same facts are in the frames' text.
 */
export const pins = [
  { x: 1166, y: 1620, stop: 1, note: 'Modules talk only through contracts. One becomes a service only when it has to.' },
  { x: 799, y: 1701, stop: 1, note: 'A replayed Stripe event is applied once. Replay tests cover it.' },
  { x: 3300, y: 1556, stop: 2, note: 'Prices before and after VAT, paid through Stripe.' },
  { x: 2680, y: 2092, stop: 2, note: 'The assistant hands over to a person, so a wrong answer is never the last word.' },
  { x: 1066, y: 3082, stop: 3, note: 'Every service ships in the same container, so what runs on one machine runs on the next.' },
  { x: 2880, y: 2700, stop: 5, note: 'This board is the site you’re reading. The code is public.' },
];

/** Inline style that places an element at a rectangle on the board. */
export const place = (rect: Rect): string => `--x:${rect.x}px;--y:${rect.y}px;--w:${rect.w}px;--h:${rect.h}px`;

/** "1280 × 800", the size shown next to a frame's name. */
export const size = (rect: Rect): string => `${rect.w} × ${rect.h}`;
