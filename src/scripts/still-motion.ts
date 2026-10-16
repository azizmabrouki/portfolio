/**
 * Light motion for the still home page (phones, tablets held upright): the flat drawings
 * move instead of the 3D world, at a fraction of its cost. Blocks rise into view as they
 * scroll in, the plate stack assembles and cycles through the four rules until the visitor
 * picks one, and the break-it model takes a server down once on its own.
 * Off with reduced motion, and while the 3D world runs. Marks <html> with still-anim.
 */
import { breakServer, chaosState, onChaos } from '@/scripts/chaos';

const html = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

let io: IntersectionObserver | null = null;
const timers: number[] = [];
const cleanups: (() => void)[] = [];

const inView = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
};

export function startStillMotion(pick: (index: number) => void, count: number): void {
  if (reduce.matches || html.classList.contains('w3d') || html.classList.contains('still-anim')) return;
  const targets = [...document.querySelectorAll<HTMLElement>('.rv, [data-reveal]')];
  // Anything already on screen stays shown: only what is below the fold waits to rise.
  targets.forEach((el) => {
    if (inView(el)) el.setAttribute('data-in', '');
    else el.removeAttribute('data-in');
  });
  html.classList.add('still-anim');

  let userPicked = false;
  let cycle = 0;
  let current = 0;
  const stopCycle = () => {
    window.clearInterval(cycle);
    cycle = 0;
  };
  const onPick = (event: Event) => {
    if ((event.target as Element).closest('[data-prb]')) {
      userPicked = true;
      stopCycle();
    }
  };
  document.addEventListener('click', onPick);
  cleanups.push(() => document.removeEventListener('click', onPick));
  cleanups.push(stopCycle);

  let autoBroken = false;
  cleanups.push(onChaos(() => (autoBroken = true)));

  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) el.setAttribute('data-in', '');
        // The rules cycle while the plate stack is on screen, until the visitor picks one.
        if (el.matches('[data-layers]')) {
          if (entry.isIntersecting && !userPicked && !cycle) {
            cycle = window.setInterval(() => {
              current = (current + 1) % count;
              pick(current);
            }, 3200);
          } else if (!entry.isIntersecting) stopCycle();
        }
        // The model breaks itself once, the first time it is well in view.
        if (el.matches('[data-model]') && entry.isIntersecting && !autoBroken) {
          autoBroken = true;
          timers.push(window.setTimeout(() => chaosState() === 'idle' && breakServer(), 1200));
        }
      });
    },
    { threshold: [0, 0.15], rootMargin: '0px 0px -10% 0px' },
  );
  targets.forEach((el) => io?.observe(el));
  const model = document.querySelector('[data-model]');
  if (model) io.observe(model);
}

export function stopStillMotion(): void {
  io?.disconnect();
  io = null;
  timers.splice(0).forEach((t) => window.clearTimeout(t));
  cleanups.splice(0).forEach((fn) => fn());
  html.classList.remove('still-anim');
  document.querySelectorAll('.rv, [data-reveal]').forEach((el) => el.setAttribute('data-in', ''));
}
