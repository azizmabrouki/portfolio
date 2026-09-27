/**
 * The sheet index (ContentsBar): marks the section being read and fills the progress line.
 * One passive scroll listener, work done once per animation frame.
 */
export function initContents(): void {
  const nav = document.querySelector<HTMLElement>('[data-contents]');
  if (!nav) return;
  const list = nav.querySelector('ol');
  const fill = nav.querySelector<HTMLElement>('[data-contents-fill]');
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('[data-contents-link]')];
  const sections = links
    .map((link) => document.getElementById(link.dataset.contentsLink ?? ''))
    .filter((section): section is HTMLElement => section !== null);
  const article = nav.closest('article') ?? document.body;
  let current = '';
  let frame = 0;

  const update = () => {
    frame = 0;
    const box = article.getBoundingClientRect();
    const travel = box.height - window.innerHeight;
    const progress = travel > 0 ? Math.min(1, Math.max(0, -box.top / travel)) : 1;
    fill?.style.setProperty('transform', `scaleX(${progress.toFixed(4)})`);

    // The section being read: the last one whose heading has passed a third of the screen.
    let reading = sections[0]?.id ?? '';
    for (const section of sections) {
      if (section.getBoundingClientRect().top < window.innerHeight * 0.33) reading = section.id;
    }
    if (reading === current) return;
    current = reading;
    for (const link of links) {
      if (link.dataset.contentsLink === reading) {
        link.setAttribute('aria-current', 'location');
        // On phones the list scrolls sideways: keep the current section in view.
        if (list && list.scrollWidth > list.clientWidth) {
          list.scrollTo({ left: Math.max(0, link.offsetLeft - 16) });
        }
      } else {
        link.removeAttribute('aria-current');
      }
    }
  };

  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
}
