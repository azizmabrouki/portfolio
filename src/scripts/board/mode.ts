/**
 * Keeps the home page in the right reading as the window changes and when the visitor
 * flips the Board / List switch: html.board loads the camera (only then, so phones never
 * download it), html.tour loads the phone tour, and the List view runs neither. Switching
 * keeps the visitor on the same frame.
 */
import { stops } from '@/config/board';

const html = document.documentElement;
const wide = window.matchMedia('(min-width: 1024px) and (min-height: 600px)');
const buttons = [...document.querySelectorAll<HTMLButtonElement>('.view [data-view]')];

let stopBoard: (() => string | null) | null = null;
let stopTour: (() => void) | null = null;
let busy = false;

const chosen = (): string | null => {
  try {
    return localStorage.getItem('view');
  } catch {
    return null;
  }
};

const choose = (view: 'board' | 'list') => {
  try {
    localStorage.setItem('view', view);
  } catch {
    /* Private mode: the choice lasts for this page only. */
  }
};

/** The frame at the top of the column, to open the board on it. */
const frameInView = (): string | null => {
  let found: string | null = null;
  for (const stop of stops) {
    const el = document.getElementById(stop.id);
    if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) found = stop.id;
  }
  return found;
};

async function apply(at?: string | null) {
  if (busy) return;
  busy = true;
  const board = wide.matches && chosen() !== 'list';
  html.classList.toggle('tour', !wide.matches);

  if (board && !stopBoard) {
    html.classList.add('board');
    const { startBoard } = await import('./camera');
    stopBoard = startBoard({ at });
  } else if (!board && stopBoard) {
    const id = stopBoard();
    stopBoard = null;
    html.classList.remove('board');
    html.style.removeProperty('--cam');
    html.style.removeProperty('--z');
    const el = id ? document.getElementById(id) : null;
    if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  } else if (!board) {
    html.classList.remove('board', 'far');
  }

  if (!wide.matches && !stopTour) {
    const { startTour } = await import('./tour');
    stopTour = startTour();
  } else if (wide.matches && stopTour) {
    stopTour();
    stopTour = null;
  }

  buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.view === (board ? 'board' : 'list'))));
  busy = false;
}

buttons.forEach((button) =>
  button.addEventListener('click', () => {
    const view = button.dataset.view === 'list' ? 'list' : 'board';
    if (view === (html.classList.contains('board') ? 'board' : 'list')) return;
    const at = view === 'board' ? frameInView() : null;
    choose(view);
    void apply(at);
  }),
);

wide.addEventListener('change', () => void apply());
void apply();
