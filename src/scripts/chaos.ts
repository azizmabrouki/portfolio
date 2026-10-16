/**
 * The "Try to break it" model's state, shared by the still page and the 3D world:
 * idle → down (a server is taken down, traffic is rerouted) → healed (a replacement is up).
 * The state is written on the page root as data-chaos; CSS shows the matching words, and the
 * readout is a live region, so each change is announced.
 */
export type Chaos = 'idle' | 'down' | 'healed';

let root: HTMLElement | null = null;
let button: HTMLElement | null = null;
let healAfter = 3200;
let timer = 0;
const listeners = new Set<(state: Chaos) => void>();

export const chaosState = (): Chaos => (root?.dataset.chaos as Chaos | undefined) ?? 'idle';

function set(state: Chaos): void {
  if (!root || chaosState() === state) return;
  root.dataset.chaos = state;
  // The button can't act while servers are rerouting, but keeps focus (aria-disabled).
  button?.setAttribute('aria-disabled', state === 'down' ? 'true' : 'false');
  listeners.forEach((listener) => listener(state));
}

/** Take a server down; the replacement comes up on its own after `healAfter` ms. */
export function breakServer(): void {
  if (chaosState() !== 'idle') return;
  set('down');
  window.clearTimeout(timer);
  timer = window.setTimeout(() => set('healed'), healAfter);
}

/** The button: break it, or after a heal, reset and break it again. */
function press(): void {
  const state = chaosState();
  if (state === 'idle') breakServer();
  else if (state === 'healed') {
    set('idle');
    window.clearTimeout(timer);
    timer = window.setTimeout(breakServer, 900);
  }
}

export function onChaos(listener: (state: Chaos) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initChaos(page: HTMLElement, delay: number): void {
  root = page;
  healAfter = delay;
  root.dataset.chaos = 'idle';
  button = root.querySelector<HTMLElement>('[data-chaos-btn]');
  button?.setAttribute('aria-disabled', 'false');
  button?.addEventListener('click', press);
}
