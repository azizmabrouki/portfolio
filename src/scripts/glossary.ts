/**
 * Glossary popovers: the Popover API opens and closes them (click, tap, Enter, Escape,
 * click outside). This adds a hover preview for mouse users and places each popover
 * under the term that opened it; without it the browser centres the popover.
 */
type Toggle = Event & { newState?: string };

export function initGlossary(): void {
  if (!('popover' in HTMLElement.prototype)) return;
  const triggers = [...document.querySelectorAll<HTMLButtonElement>('button.term[popovertarget]')];
  if (triggers.length === 0) return;

  let owner: HTMLElement | null = null;
  let openedByHover = false;
  const margin = 8;

  const place = (trigger: HTMLElement, popover: HTMLElement) => {
    const box = trigger.getBoundingClientRect();
    const width = popover.offsetWidth;
    const height = popover.offsetHeight;
    const left = Math.min(Math.max(margin, box.left), window.innerWidth - width - margin);
    let top = box.bottom + margin;
    if (top + height > window.innerHeight - margin) top = Math.max(margin, box.top - height - margin);
    Object.assign(popover.style, { inset: 'auto', margin: '0', left: `${left}px`, top: `${top}px` });
  };

  for (const trigger of triggers) {
    const popover = document.getElementById(trigger.getAttribute('popovertarget') ?? '');
    if (!popover) continue;
    const isOpen = () => popover.matches(':popover-open');
    let timer = 0;

    trigger.addEventListener('click', (event) => {
      // Opened by hovering: a click keeps it open instead of toggling it shut.
      if (isOpen() && openedByHover && owner === trigger) {
        event.preventDefault();
        openedByHover = false;
        return;
      }
      owner = trigger;
      openedByHover = false;
    });

    trigger.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse') return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (isOpen()) return;
        owner = trigger;
        openedByHover = true;
        popover.showPopover();
      }, 150);
    });

    trigger.addEventListener('pointerleave', (event) => {
      if (event.pointerType !== 'mouse') return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (openedByHover && owner === trigger && isOpen()) popover.hidePopover();
      }, 200);
    });

    popover.addEventListener('toggle', (event: Toggle) => {
      if (event.newState === 'open' && owner) place(owner, popover);
      if (event.newState === 'closed') openedByHover = false;
    });
  }

  // Popovers sit above the page and don't scroll with it: close them when it scrolls.
  window.addEventListener(
    'scroll',
    () => {
      for (const open of document.querySelectorAll<HTMLElement>('.term-pop:popover-open')) open.hidePopover();
    },
    { passive: true },
  );
}
