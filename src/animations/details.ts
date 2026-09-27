/**
 * Small details that make the site feel like a drawing board. No GSAP: a few hundred bytes.
 * Loaded only when the visitor has not asked for reduced motion.
 *
 * - Section markers count up (A / 00 → A / 03) the first time they scroll into view.
 * - In-page links (the header's sections) scroll smoothly and move keyboard focus.
 * - Drawing surfaces show the pointer's coordinates, like a CAD readout (desktop only).
 */

const pad = (value: number, width: number) => String(Math.max(0, Math.round(value))).padStart(width, '0');

function countUpMarkers(): void {
  const counters = [...document.querySelectorAll<HTMLElement>('[data-count]')].filter((counter) => {
    const text = counter.textContent?.trim() ?? '';
    // Only plain numbers, and only markers still below the fold: never rewrite what is on screen.
    return /^\d+$/.test(text) && counter.getBoundingClientRect().top > window.innerHeight;
  });
  if (counters.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const counter = entry.target as HTMLElement;
        const final = counter.textContent?.trim() ?? '';
        const target = Number.parseInt(final, 10);
        const steps = Math.min(target, 12);
        let step = 0;
        counter.textContent = pad(0, final.length);
        const timer = window.setInterval(() => {
          step += 1;
          counter.textContent = step >= steps ? final : pad((target * step) / steps, final.length);
          if (step >= steps) window.clearInterval(timer);
        }, 55);
      }
    },
    { threshold: 1 },
  );
  counters.forEach((counter) => observer.observe(counter));
}

function smoothInPageLinks(): void {
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="#"]');
    if (!link) return;

    const url = new URL(link.href);
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
    // The hero's floors and rail have their own scroll handling.
    if (!url.hash || url.hash.startsWith('#layer-')) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.pushState(null, '', url.hash);
    // Keyboard and screen-reader users continue from the section they jumped to.
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}

function coordinates(): void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const surfaces = document.querySelectorAll<HTMLElement>('[data-coords]');
  if (surfaces.length === 0) return;

  const readout = document.createElement('div');
  readout.className = 'coords';
  readout.setAttribute('aria-hidden', 'true');
  document.body.append(readout);
  document.documentElement.classList.add('coords-on');

  let frame = 0;
  let x = 0;
  let y = 0;
  let text = '';
  const render = () => {
    frame = 0;
    readout.textContent = text;
    readout.style.transform = `translate(${x + 16}px, ${y + 18}px)`;
  };

  for (const surface of surfaces) {
    surface.addEventListener('pointermove', (event) => {
      const box = surface.getBoundingClientRect();
      x = event.clientX;
      y = event.clientY;
      text = `X ${pad(event.clientX - box.left, 4)} · Y ${pad(event.clientY - box.top, 4)}`;
      readout.classList.add('is-visible');
      if (!frame) frame = window.requestAnimationFrame(render);
    });
    surface.addEventListener('pointerleave', () => readout.classList.remove('is-visible'));
  }
}

export function initDetails(): void {
  countUpMarkers();
  smoothInPageLinks();
  coordinates();
}
