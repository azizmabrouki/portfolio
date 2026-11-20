/**
 * The tour on phones (html.tour). The frames stay one scrolling column, read with the
 * page's own scrolling; the tour bar names the frame being read and steps to the previous
 * or next one. "Board" zooms the whole column out until every frame fits on the screen,
 * labelled; tapping one zooms back in to it. With reduced motion the zoom is a cut.
 */
import { stops } from '@/config/board';

const BAR = 56;

export function startTour(): () => void {
  const html = document.documentElement;
  const bar = document.querySelector<HTMLElement>('[data-tour]');
  const column = document.querySelector<HTMLElement>('[data-world]');
  if (!bar || !column) return () => {};
  const num = bar.querySelector<HTMLElement>('[data-num]');
  const name = bar.querySelector<HTMLElement>('[data-name]');
  const map = bar.querySelector<HTMLButtonElement>('[data-act="map"]');
  const prev = bar.querySelector<HTMLButtonElement>('[data-act="prev"]');
  const next = bar.querySelector<HTMLButtonElement>('[data-act="next"]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const frames = stops
    .map((stop) => ({ stop, el: document.getElementById(stop.id) }))
    .filter((item): item is { stop: (typeof stops)[number]; el: HTMLElement } => !!item.el);

  // The map labels: the frame's name next to it while zoomed out.
  const labels = frames.map(({ stop, el }) => {
    const label = document.createElement('span');
    label.className = 'maplab';
    label.setAttribute('aria-hidden', 'true');
    label.textContent = stop.name;
    el.append(label);
    return label;
  });

  let current = 0;
  let mapOn = false;
  let columnTop = 0;
  let pageHeight = 0;
  /** Where each frame starts on the page, measured before zooming out (the column reflows
   * when the scrollbar goes away). */
  let tops: number[] = [];
  let ticking = 0;

  const show = () => {
    if (num) num.textContent = mapOn ? 'Board' : `${current + 1} / ${frames.length}`;
    if (name) name.textContent = mapOn ? 'Tap a frame to open it' : (frames[current]?.stop.name ?? '');
    if (prev) prev.disabled = mapOn || current <= 0;
    if (next) next.disabled = mapOn || current >= frames.length - 1;
    map?.setAttribute('aria-pressed', String(mapOn));
  };

  const onScroll = () => {
    if (mapOn || ticking) return;
    ticking = requestAnimationFrame(() => {
      ticking = 0;
      const line = window.innerHeight * 0.4;
      let found = 0;
      frames.forEach(({ el }, index) => {
        if (el.getBoundingClientRect().top <= line) found = index;
      });
      if (found !== current) {
        current = found;
        show();
      }
    });
  };

  const go = (index: number) => {
    const target = frames[Math.max(0, Math.min(frames.length - 1, index))];
    if (!target) return;
    current = frames.indexOf(target);
    show();
    target.el.scrollIntoView({ behavior: motion.matches ? 'auto' : 'smooth', block: 'start' });
  };

  const transition = (value: string) => {
    column.style.transition = motion.matches ? 'none' : value;
  };

  const openMap = () => {
    const y = window.scrollY;
    columnTop = column.getBoundingClientRect().top + y;
    pageHeight = document.documentElement.scrollHeight;
    tops = frames.map(({ el }) => el.getBoundingClientRect().top + y);
    const avail = window.innerHeight - BAR - 24 - 100;
    const s = Math.min(0.2, avail / column.offsetHeight);
    mapOn = true;
    html.classList.add('map');
    column.style.transition = 'none';
    column.style.transform = `translate(0px, ${columnTop - y}px)`;
    void column.offsetWidth;
    transition('transform 700ms cubic-bezier(0.16, 1, 0.3, 1)');
    column.style.setProperty('--s', String(s));
    column.style.transform = `translate(16px, ${BAR + 12}px) scale(${s})`;
    show();
  };

  const closeMap = (index = current) => {
    const target = frames[index];
    if (!target) return;
    // Measured before zooming out: while zoomed, the column is fixed and the page has no height.
    const maxScroll = Math.max(0, pageHeight - window.innerHeight);
    const offset = Math.min(maxScroll, Math.max(0, (tops[index] ?? 0) - (BAR + 24)));
    const done = () => {
      column.removeEventListener('transitionend', done);
      html.classList.remove('map');
      column.style.removeProperty('transform');
      column.style.removeProperty('transition');
      column.style.removeProperty('--s');
      window.scrollTo({ top: offset, behavior: 'instant' });
      mapOn = false;
      current = index;
      show();
    };
    transition('transform 600ms cubic-bezier(0.16, 1, 0.3, 1)');
    column.style.transform = `translate(0px, ${columnTop - offset}px) scale(1)`;
    if (motion.matches) done();
    else column.addEventListener('transitionend', done);
  };

  const onBar = (e: MouseEvent) => {
    const act = (e.target as Element).closest<HTMLButtonElement>('button')?.dataset.act;
    if (act === 'map') (mapOn ? closeMap() : openMap());
    else if (act === 'prev') go(current - 1);
    else if (act === 'next') go(current + 1);
  };

  // While zoomed out, a tap on a frame opens it instead of following its links.
  const onPick = (e: MouseEvent) => {
    if (!mapOn) return;
    e.preventDefault();
    e.stopPropagation();
    const index = frames.findIndex(({ el }) => el.contains(e.target as Node));
    closeMap(index >= 0 ? index : current);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && mapOn) closeMap();
  };

  bar.addEventListener('click', onBar);
  column.addEventListener('click', onPick, true);
  document.addEventListener('keydown', onKey);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  show();

  return () => {
    if (mapOn) {
      html.classList.remove('map');
      column.removeAttribute('style');
    }
    bar.removeEventListener('click', onBar);
    column.removeEventListener('click', onPick, true);
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('scroll', onScroll);
    labels.forEach((label) => label.remove());
  };
}
