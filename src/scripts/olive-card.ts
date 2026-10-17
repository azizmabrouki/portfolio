/**
 * The HMA4Tech olive tree on the still page (phones, tablets held upright): the same
 * drawing as the 3D hologram, flat, above the project's text. Its symbols (16 KB gzipped)
 * load only when the card comes near the screen. With motion it plays once, as in the
 * design canvas: the ring draws, the tree draws bottom to top, a scan line sweeps, one
 * clump flags red, then "flagged · handled". With reduced motion it shows the end state.
 */
const SVG = `<svg class="ptree" width="300" height="290" viewBox="0 0 300 290" aria-hidden="true">
<defs><clipPath id="phclip"><rect x="0" y="254" width="300" height="2" data-p="clip"></rect></clipPath></defs>
<polygon points="74,268 226,268 290,14 10,14" fill="#FFB547" fill-opacity="0.05"></polygon>
<ellipse cx="150" cy="268" rx="92" ry="15" fill="none" stroke="#FFB547" stroke-width="5" stroke-opacity="0.25"></ellipse>
<ellipse cx="150" cy="268" rx="92" ry="15" fill="none" stroke="#FFB547" stroke-width="1.3" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" data-p="ring"></ellipse>
<ellipse cx="150" cy="268" rx="76" ry="11" fill="none" stroke="#FFB547" stroke-width="0.7" stroke-opacity="0.7"></ellipse>
<g clip-path="url(#phclip)" class="pglow"><use href="#olA" x="5" y="20" width="290" height="232"></use><use href="#olA-x" x="5" y="20" width="290" height="232" data-p="anom" style="color:#FFB547"></use></g>
<line x1="20" y1="254" x2="280" y2="254" stroke="#FFB547" stroke-width="1.5" opacity="0" data-p="edge"></line>
<line x1="14" y1="170" x2="286" y2="170" stroke="#FFB547" stroke-width="7" opacity="0" data-p="scanglow"></line>
<line x1="14" y1="170" x2="286" y2="170" stroke="#FFB547" stroke-width="2" opacity="0" data-p="scan"></line>
</svg>
<p class="pstate"><span class="p-idle">projecting…</span><span class="p-bad"><b></b>anomaly found</span><span class="p-ok"><b></b>flagged · handled</span></p>`;

const c = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function render(card: HTMLElement, T: number): void {
  const get = (name: string) => card.querySelector<SVGElement>(`[data-p="${name}"]`);
  const pr = c((T - 0.1) / 0.45);
  const ps = c((T - 0.6) / 0.25);
  const flag = T >= 0.73 && T < 0.86;
  const pulse = flag ? 0.5 - 0.5 * Math.cos((Math.PI * 4 * (T - 0.73)) / 0.13) : 0;
  const scanO = T > 0.6 && T < 0.85 ? Math.min(1, Math.min(ps, 1 - ps) * 10) : 0;
  const y = 170 - 110 * ps;
  get('ring')?.setAttribute('stroke-dashoffset', (1 - c(T / 0.12)).toFixed(3));
  get('clip')?.setAttribute('y', (254 - 234 * pr).toFixed(1));
  get('clip')?.setAttribute('height', (234 * pr + 2).toFixed(1));
  const edge = get('edge');
  edge?.setAttribute('y1', (254 - 234 * pr).toFixed(1));
  edge?.setAttribute('y2', (254 - 234 * pr).toFixed(1));
  edge?.setAttribute('opacity', pr > 0.01 && pr < 0.99 ? '1' : '0');
  for (const [name, o] of [
    ['scan', scanO],
    ['scanglow', scanO * 0.25],
  ] as const) {
    const line = get(name);
    line?.setAttribute('y1', y.toFixed(1));
    line?.setAttribute('y2', y.toFixed(1));
    line?.setAttribute('opacity', o.toFixed(2));
  }
  const anom = get('anom');
  if (anom) {
    anom.style.color = flag ? '#F2826A' : '#FFB547';
    anom.setAttribute('stroke-width', (0.8 + 1.4 * pulse).toFixed(2));
  }
  card.dataset.state = flag ? 'bad' : T >= 0.86 ? 'ok' : 'idle';
}

let started = false;

export function initOliveCard(animate: boolean): void {
  const card = document.querySelector<HTMLElement>('[data-holo-card]');
  if (!card || started || !('IntersectionObserver' in window)) return;
  started = true;
  let played = false;
  const play = () => {
    if (played) return;
    played = true;
    if (!animate) return render(card, 1);
    const t0 = performance.now();
    const step = (now: number) => {
      const T = Math.min(1, (now - t0) / 3600);
      render(card, T);
      if (T < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const near = new IntersectionObserver(
    async (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      near.disconnect();
      const { default: symbols } = await import('./world/olive.svg?raw');
      if (!document.getElementById('olA')) document.body.insertAdjacentHTML('beforeend', symbols.replace(/<!--[\s\S]*?-->/, ''));
      card.innerHTML = SVG;
      render(card, animate ? 0 : 1);
      seen.observe(card);
    },
    { rootMargin: '600px 0px' },
  );
  const seen = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.intersectionRatio >= 0.5)) {
        seen.disconnect();
        play();
      }
    },
    { threshold: 0.5 },
  );
  near.observe(card);
}
