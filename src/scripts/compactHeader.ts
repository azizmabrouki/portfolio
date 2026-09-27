/**
 * The compact header on the home page: slides in once the building (the hero) has been
 * scrolled past, and marks the section being read. While hidden it is inert, so keyboard
 * and screen-reader users never land in it.
 */
export function initCompactHeader(): void {
  const bar = document.querySelector<HTMLElement>('[data-compact-header]');
  if (!bar) return;
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const links = [...bar.querySelectorAll<HTMLAnchorElement>('a[data-section]')];
  const sections = links
    .map((link) => document.getElementById(link.dataset.section ?? ''))
    .filter((section): section is HTMLElement => section !== null);

  bar.hidden = false;
  bar.inert = true;
  let shown = false;
  let current = '';
  let frame = 0;

  const update = () => {
    frame = 0;
    const threshold = hero ? hero.offsetTop + hero.offsetHeight - 80 : 480;
    const show = window.scrollY > threshold;
    if (show !== shown) {
      shown = show;
      bar.classList.toggle('is-shown', show);
      bar.inert = !show;
    }

    let reading = '';
    for (const section of sections) {
      if (section.getBoundingClientRect().top < window.innerHeight * 0.33) reading = section.id;
    }
    if (reading === current) return;
    current = reading;
    for (const link of links) {
      if (link.dataset.section === reading) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };

  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
}
