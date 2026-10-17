/**
 * The home page's small interactions, for every visitor with JavaScript: the clock, the
 * phone menu, the pipeline in the top bar, the departures board's detail panels, the
 * principles on the still page and the break-it model. Where the 3D world runs
 * (html.w3d), its module is loaded on top (dynamic import, so phones never fetch it).
 */
import { initChaos } from '@/scripts/chaos';
import { WORLD_QUERY } from '@/scripts/world/query';
import { startStillMotion, stopStillMotion } from '@/scripts/still-motion';
import { initOliveCard } from '@/scripts/olive-card';

const html = document.documentElement;
const page = document.querySelector<HTMLElement>('[data-home]');

/* ---- Clock: the time in Tunis, in the top bar and on the board ---- */

function startClock(timeZone: string): void {
  const clocks = document.querySelectorAll<HTMLElement>('[data-clock]');
  let format: () => string;
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false });
    format = () => formatter.format(new Date());
  } catch {
    format = () => new Date().toTimeString().slice(0, 5);
  }
  const tick = () => {
    const time = format();
    clocks.forEach((clock) => {
      if (clock.textContent !== time) clock.textContent = time;
    });
  };
  tick();
  window.setInterval(tick, 5000);
}

/* ---- Phone menu ---- */

function initMenu(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-menu]');
  const sheet = document.getElementById('sheet');
  if (!button || !sheet) return;
  const setOpen = (open: boolean) => {
    button.setAttribute('aria-expanded', String(open));
    sheet.hidden = !open;
  };
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  sheet.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !sheet.hidden) {
      setOpen(false);
      button.focus();
    }
  });
}

/* ---- Pipeline: each stage fills as its section is read ---- */

function initPipeline(): void {
  const stages = [...document.querySelectorAll<HTMLElement>('[data-pipe]')];
  const sections = stages.map((stage) => document.querySelector<HTMLElement>(stage.getAttribute('href') ?? ''));
  let queued = false;
  const update = () => {
    queued = false;
    const middle = window.innerHeight * 0.5;
    stages.forEach((stage, index) => {
      const section = sections[index];
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const length = rect.height * (index === stages.length - 1 ? 0.5 : 1);
      const progress = Math.min(1, Math.max(0, (middle - rect.top) / Math.max(1, length)));
      const state = progress <= 0.002 ? 'todo' : progress >= 0.998 ? 'done' : 'run';
      if (stage.dataset.st !== state) stage.dataset.st = state;
      const fill = stage.querySelector<HTMLElement>('[data-fill]');
      if (fill) fill.style.transform = `scaleX(${progress.toFixed(3)})`;
    });
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  update();
}

/* ---- Departures board: one detail panel open at a time ---- */

function initBoard(): void {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-xbtn]')];
  const panelOf = (button: HTMLButtonElement) => document.getElementById(button.getAttribute('aria-controls') ?? '');
  const setOpen = (button: HTMLButtonElement, open: boolean) => {
    button.setAttribute('aria-expanded', String(open));
    const panel = panelOf(button);
    if (panel) panel.hidden = !open;
  };
  // Without JavaScript every panel is open; with it they start closed.
  buttons.forEach((button) => setOpen(button, false));
  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      buttons.forEach((other) => setOpen(other, other === button && open));
    }),
  );
}

/* ---- Principles on the still page: a rule lights the plates it holds up ---- */

function initPrinciples(): { stillPage: () => void; pick: (index: number) => void; count: number } {
  const items = [...document.querySelectorAll<HTMLElement>('[data-pr]')];
  const figure = document.querySelector<HTMLElement>('[data-layers]');
  const plates = figure ? [...figure.querySelectorAll<HTMLElement>('[data-layer]')] : [];
  const names = [...(figure?.querySelectorAll<HTMLElement>('.ll') ?? [])].map((label) => label.textContent?.trim() ?? '');

  const pick = (index: number) => {
    items.forEach((item, n) => {
      item.toggleAttribute('data-on', n === index);
      item.querySelector('[data-prb]')?.setAttribute('aria-pressed', String(n === index));
    });
    const item = items[index];
    const lights = (item?.dataset.lights ?? '').split(' ').map(Number);
    plates.forEach((plate) => plate.toggleAttribute('data-on', lights.includes(Number(plate.dataset.layer))));
    const title = item?.querySelector('[data-prb]')?.textContent?.trim();
    figure?.setAttribute(
      'aria-label',
      `The five layers of the system as stacked plates. ${title} lights up: ${lights.map((n) => names[n]).join(', ')}.`,
    );
  };

  const onClick = (event: Event) => {
    if (html.classList.contains('w3d')) return;
    const button = (event.target as Element).closest<HTMLElement>('[data-prb]');
    if (button) pick(Number(button.dataset.prb));
  };
  document.addEventListener('click', onClick);

  // stillPage is called whenever the layout switches to the still page.
  return {
    stillPage: () => {
      items.forEach((item) => item.querySelector('[data-prb]')?.removeAttribute('aria-expanded'));
      pick(Math.max(0, items.findIndex((item) => item.hasAttribute('data-on'))));
    },
    pick,
    count: items.length,
  };
}

/* ---- The 3D world, where it runs ---- */

type World = { start: () => void; stop: () => void };
let world: World | null = null;
let loading: Promise<World | null> | null = null;

function loadWorld(): Promise<World | null> {
  loading ??= import('@/scripts/world')
    .then((module) => module.createWorld(page as HTMLElement))
    .catch((error: unknown) => {
      // Keep the still page for the rest of the visit.
      console.warn('[portfolio] 3D world failed to load:', error);
      html.classList.add('w3d-off');
      html.classList.remove('w3d');
      return null;
    });
  return loading;
}

function initWorld(principles: ReturnType<typeof initPrinciples>): void {
  const query = window.matchMedia(WORLD_QUERY);
  const still = () => {
    principles.stillPage();
    startStillMotion(principles.pick, principles.count);
    initOliveCard(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  const apply = async () => {
    if (query.matches && !html.classList.contains('w3d-off')) {
      stopStillMotion();
      world = await loadWorld();
      if (world) world.start();
      else still();
    } else {
      world?.stop();
      still();
    }
  };
  query.addEventListener('change', () => void apply());
  void apply();
}

if (page) {
  const timeZone = page.dataset.tz ?? 'Africa/Tunis';
  startClock(timeZone);
  initMenu();
  initPipeline();
  initBoard();
  initChaos(page, Number(page.dataset.heal ?? 3200));
  const principles = initPrinciples();
  if (!html.classList.contains('w3d')) principles.stillPage();
  initWorld(principles);
}
