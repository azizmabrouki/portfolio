/**
 * Links a case study's key decisions to its drawing:
 * - hovering or focusing a decision lights up its box and numbered marker;
 * - "Show on the drawing" scrolls up to the drawing and flashes them;
 * - clicking a numbered marker on the drawing jumps to its decision.
 */
const FLASH_MS = 1800;

export function initDecisions(): void {
  const figure = document.querySelector<HTMLElement>('[data-diagram]');
  const decisions = [...document.querySelectorAll<HTMLElement>('[data-decision-node]')];
  if (!figure || decisions.length === 0) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const partsFor = (node: string, label: string) => [
    ...figure.querySelectorAll<SVGElement>(`[data-node="${CSS.escape(node)}"]`),
    ...figure.querySelectorAll<SVGElement>(`[data-callout="${CSS.escape(label)}"]`),
  ];
  const mark = (parts: SVGElement[], className: string, on: boolean) =>
    parts.forEach((part) => part.classList.toggle(className, on));

  for (const decision of decisions) {
    const node = decision.dataset.decisionNode ?? '';
    const label = decision.dataset.decisionLabel ?? '';
    const parts = partsFor(node, label);
    if (parts.length === 0) continue;

    const light = () => mark(parts, 'is-linked', true);
    const unlight = () => mark(parts, 'is-linked', false);
    decision.addEventListener('pointerenter', light);
    decision.addEventListener('pointerleave', unlight);
    decision.addEventListener('focusin', light);
    decision.addEventListener('focusout', unlight);

    const show = decision.querySelector<HTMLButtonElement>('[data-show-on-drawing]');
    if (show) {
      show.hidden = false;
      let timer = 0;
      show.addEventListener('click', () => {
        figure.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center' });
        window.clearTimeout(timer);
        mark(parts, 'is-flash', true);
        timer = window.setTimeout(() => mark(parts, 'is-flash', false), FLASH_MS);
      });
    }
  }

  // Numbered markers on the drawing lead back to their decision.
  for (const callout of figure.querySelectorAll<SVGGElement>('[data-callout]')) {
    const target = document.getElementById(`decision-${callout.dataset.callout ?? ''}`);
    if (!target) continue;
    callout.classList.add('is-clickable');
    callout.addEventListener('click', () => {
      target.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }
}
