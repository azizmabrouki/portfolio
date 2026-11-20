/**
 * The board's camera (html.board only). The frames are laid out by CSS at their places on
 * the mat; this module moves one transform over them:
 *
 * - The tour: Next / Previous, the arrow keys, the intro's index, any #anchor link and the
 *   minimap fly the camera to a stop. Long flights zoom out on the way, like a map.
 * - Free looking: drag (or one finger) to pan, wheel or trackpad to pan, Ctrl + wheel or
 *   pinch to zoom around the pointer.
 * - Keyboard: Tab into a frame and the camera brings it into view.
 *
 * Every frame of motion redraws the rulers, the minimap's view and the grid of the mat.
 * With reduced motion the camera jumps instead of flying. Returns a function that stops the
 * board and gives back the current stop's id, so the List view can open at the same place.
 */
import { bounds, stops, type Rect } from '@/config/board';

interface Cam {
  x: number;
  y: number;
  z: number;
}

const BAR = 56;
const RULER = 24;
const MIN_Z = 0.05;
const MAX_Z = 2.5;

const $ = <T extends Element>(selector: string, scope: ParentNode = document): T => {
  const element = scope.querySelector<T>(selector);
  if (!element) throw new Error(`Board: missing ${selector}`);
  return element;
};

export function startBoard(options: { at?: string | null } = {}): () => string | null {
  const html = document.documentElement;
  const root = $<HTMLElement>('[data-board]');
  const world = $<HTMLElement>('[data-world]');
  const tools = $<HTMLElement>('[data-tools]');
  const sel = $<HTMLElement>('[data-sel]');
  const dim = $<HTMLElement>('[data-dim]');
  const rulerX = $<HTMLCanvasElement>('[data-ruler="x"]', tools);
  const rulerY = $<HTMLCanvasElement>('[data-ruler="y"]', tools);
  const num = $<HTMLElement>('[data-num]', tools);
  const name = $<HTMLElement>('[data-name]', tools);
  const nextLabel = $<HTMLElement>('[data-next]', tools);
  const zoomLabel = $<HTMLElement>('[data-zoom]', tools);
  const prev = $<HTMLButtonElement>('[data-act="prev"]', tools);
  const next = $<HTMLButtonElement>('[data-act="next"]', tools);
  const miniView = $<HTMLElement>('[data-mini-view]', tools);
  const miniFrames = [...tools.querySelectorAll<HTMLButtonElement>('.mini-f')];
  const ids = new Map(stops.map((stop, index) => [stop.id, index]));
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const css = getComputedStyle(html);
  const color = (name: string) => css.getPropertyValue(name).trim();
  const ink = { bg: color('--mat-deep'), text: color('--on-mat-soft'), mark: color('--yellow') };
  const mono = color('--font-mono') || 'monospace';

  let vw = window.innerWidth;
  let vh = window.innerHeight;
  let step = -1;
  let anim = 0;
  let frame = 0;
  let far: boolean | null = null;

  // ---- Geometry ----

  const area = () => {
    const left = RULER;
    const top = BAR + RULER + 34;
    const aw = Math.max(200, vw - left - 24 - 40);
    const ah = Math.max(200, vh - top - 124);
    return { aw, ah, cx: left + (vw - left - 24) / 2, cy: top + ah / 2 };
  };

  const fit = (rect: Rect): Cam => {
    const a = area();
    const z = Math.min(a.aw / rect.w, a.ah / rect.h, 1.2);
    return { x: a.cx - (rect.x + rect.w / 2) * z, y: a.cy - (rect.y + rect.h / 2) * z, z };
  };

  let cam = fit(bounds);

  // ---- Drawing ----

  const tickStep = (z: number) => [10, 20, 50, 100, 200, 250, 500, 1000, 2000, 5000].find((s) => s * z >= 84) ?? 5000;

  const canvas = (el: HTMLCanvasElement) => {
    const dpr = window.devicePixelRatio || 1;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (el.width !== Math.round(w * dpr) || el.height !== Math.round(h * dpr)) {
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
    }
    const ctx = el.getContext('2d');
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  };

  const drawRuler = (axis: 'x' | 'y') => {
    const { ctx, w, h } = canvas(axis === 'x' ? rulerX : rulerY);
    if (!ctx) return;
    const offset = axis === 'x' ? RULER : BAR + RULER;
    const origin = axis === 'x' ? cam.x : cam.y;
    const length = axis === 'x' ? w : h;
    ctx.fillStyle = ink.bg;
    ctx.fillRect(0, 0, w, h);

    const stop = stops[step];
    if (stop) {
      const from = origin + (axis === 'x' ? stop.x : stop.y) * cam.z - offset;
      const size = (axis === 'x' ? stop.w : stop.h) * cam.z;
      ctx.fillStyle = 'rgb(255 210 63 / 0.22)';
      if (axis === 'x') ctx.fillRect(from, 0, size, h);
      else ctx.fillRect(0, from, w, size);
      ctx.fillStyle = ink.mark;
      if (axis === 'x') {
        ctx.fillRect(Math.round(from), 0, 1, h);
        ctx.fillRect(Math.round(from + size), 0, 1, h);
      } else {
        ctx.fillRect(0, Math.round(from), w, 1);
        ctx.fillRect(0, Math.round(from + size), w, 1);
      }
    }

    const s = tickStep(cam.z);
    ctx.font = `500 10px ${mono}`;
    ctx.textBaseline = 'alphabetic';
    for (let t = Math.ceil((offset - origin) / cam.z / s) * s, n = 0; n < 120; t += s, n++) {
      const p = Math.round(origin + t * cam.z - offset);
      if (p > length) break;
      ctx.fillStyle = 'rgb(207 227 216 / 0.4)';
      if (axis === 'x') ctx.fillRect(p, 0, 1, h);
      else ctx.fillRect(0, p, w, 1);
      ctx.fillStyle = ink.text;
      if (axis === 'x') {
        ctx.fillText(String(t), p + 4, 16);
      } else {
        ctx.save();
        ctx.translate(16, p - 4);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(String(t), 0, 0);
        ctx.restore();
      }
    }
  };

  const render = () => {
    const { x, y, z } = cam;
    world.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${z.toFixed(5)})`;
    world.style.setProperty('--z', z.toFixed(5));
    const g1 = (40 * z).toFixed(2);
    const g2 = (200 * z).toFixed(2);
    root.style.backgroundSize = `${g1}px ${g1}px, ${g1}px ${g1}px, ${g2}px ${g2}px, ${g2}px ${g2}px`;
    root.style.backgroundPosition = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    const minor = z < 0.35 ? 0 : Math.min(1, (z - 0.35) / 0.4) * 0.05;
    root.style.setProperty('--grid-minor', `rgb(255 255 255 / ${minor.toFixed(3)})`);
    const isFar = z < 0.42;
    if (isFar !== far) {
      far = isFar;
      html.classList.toggle('far', isFar);
    }
    drawRuler('x');
    drawRuler('y');
    const s = 150 / bounds.w;
    miniView.style.left = `${(((RULER - x) / z - bounds.x) * s).toFixed(1)}px`;
    miniView.style.top = `${(((BAR + RULER - y) / z - bounds.y) * s).toFixed(1)}px`;
    miniView.style.width = `${(((vw - RULER) / z) * s).toFixed(1)}px`;
    miniView.style.height = `${(((vh - BAR - RULER) / z) * s).toFixed(1)}px`;
    zoomLabel.textContent = `${Math.round(z * 100)}%`;
  };

  const set = (next: Cam, now = false) => {
    cam = next;
    if (now) {
      render();
      return;
    }
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        render();
      });
    }
  };

  // ---- Flying ----

  const flyTo = (target: Cam) => {
    cancelAnimationFrame(anim);
    if (motion.matches) {
      set(target, true);
      return;
    }
    const from = cam;
    const a = area();
    const ca = { x: (a.cx - from.x) / from.z, y: (a.cy - from.y) / from.z };
    const cb = { x: (a.cx - target.x) / target.z, y: (a.cy - target.y) / target.z };
    const dist = Math.hypot(cb.x - ca.x, cb.y - ca.y);
    // Zoom out on the way when the next stop is far, so the visitor sees where they go.
    const zOut = Math.max(0.07, Math.min(from.z, target.z, (a.aw * 0.9) / (dist + 1)));
    const [la, lm, lb] = [Math.log(from.z), Math.log(zOut), Math.log(target.z)];
    const duration = Math.min(1500, 650 + dist * 0.16);
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
      if (t >= 1) {
        set(target, true);
        return;
      }
      const z = Math.exp((1 - e) ** 2 * la + 2 * (1 - e) * e * lm + e * e * lb);
      const wx = ca.x + (cb.x - ca.x) * e;
      const wy = ca.y + (cb.y - ca.y) * e;
      set({ x: a.cx - wx * z, y: a.cy - wy * z, z }, true);
      anim = requestAnimationFrame(tick);
    };
    anim = requestAnimationFrame(tick);
  };

  const showStep = () => {
    const stop = stops[step];
    num.textContent = stop ? `${step + 1} / ${stops.length}` : 'Overview';
    name.textContent = stop ? stop.name : 'The whole board';
    nextLabel.textContent = step < 0 ? 'Start the tour' : 'Next';
    prev.disabled = step <= 0;
    next.disabled = step >= stops.length - 1;
    miniFrames.forEach((button) => button.classList.toggle('on', Number(button.dataset.stop) === step));
    if (!stop) {
      sel.hidden = true;
      return;
    }
    const count = miniFrames.filter((button) => Number(button.dataset.stop) === step).length;
    Object.assign(sel.style, { left: `${stop.x}px`, top: `${stop.y}px`, width: `${stop.w}px`, height: `${stop.h}px` });
    dim.textContent = count > 1 ? `${count} frames` : `${stop.w} × ${stop.h}`;
    sel.hidden = false;
    sel.classList.remove('anim');
    void sel.offsetWidth;
    sel.classList.add('anim');
  };

  const goStep = (index: number) => {
    step = Math.max(0, Math.min(stops.length - 1, index));
    showStep();
    const stop = stops[step];
    if (stop) {
      history.replaceState(null, '', step > 0 ? `#${stop.id}` : `${location.pathname}${location.search}`);
      flyTo(fit(stop));
    }
  };

  const overview = () => {
    step = -1;
    showStep();
    history.replaceState(null, '', `${location.pathname}${location.search}`);
    flyTo(fit(bounds));
  };

  const zoomAt = (px: number, py: number, z: number) => {
    const next = Math.max(MIN_Z, Math.min(MAX_Z, z));
    const k = next / cam.z;
    set({ x: px - (px - cam.x) * k, y: py - (py - cam.y) * k, z: next });
  };

  const zoomBy = (factor: number) => {
    cancelAnimationFrame(anim);
    const a = area();
    zoomAt(a.cx, a.cy, cam.z * factor);
  };

  // ---- Input ----

  const pointers = new Map<number, { x: number; y: number }>();
  let pinch: { d: number; z: number } | null = null;
  let last = { x: 0, y: 0 };
  let moved = 0;
  let dragging = false;
  let downOn: Element | null = null;
  let pointerBusy = false;

  const interactive = 'a, button, input, textarea, select, summary, [tabindex]:not([tabindex="-1"])';

  const onDown = (e: PointerEvent) => {
    pointerBusy = true;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    downOn = e.target as Element;
    if (pointers.size === 2) {
      const [p, q] = [...pointers.values()];
      if (p && q) pinch = { d: Math.hypot(p.x - q.x, p.y - q.y) || 1, z: cam.z };
      dragging = true;
      return;
    }
    if (downOn.closest(interactive)) return;
    cancelAnimationFrame(anim);
    dragging = true;
    moved = 0;
    last = { x: e.clientX, y: e.clientY };
    root.setPointerCapture(e.pointerId);
  };

  const onMove = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size >= 2) {
      const [p, q] = [...pointers.values()];
      if (!p || !q) return;
      moved = 99;
      zoomAt((p.x + q.x) / 2, (p.y + q.y) / 2, pinch.z * (Math.hypot(p.x - q.x, p.y - q.y) / pinch.d));
      return;
    }
    if (!dragging) return;
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    last = { x: e.clientX, y: e.clientY };
    moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 4) {
      root.classList.add('dragging');
      set({ x: cam.x + dx, y: cam.y + dy, z: cam.z });
    }
  };

  const onUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    const clicked = dragging && moved <= 4 && e.type === 'pointerup';
    if (pointers.size === 0) {
      dragging = false;
      root.classList.remove('dragging');
    }
    // A click on a frame (not on a link inside it) flies to that frame.
    if (clicked && downOn) {
      const target = downOn.closest<HTMLElement>('[data-stop]');
      const index = Number(target?.dataset.stop);
      if (target && !Number.isNaN(index) && index !== step) goStep(index);
    }
    moved = 0;
    setTimeout(() => (pointerBusy = false), 0);
  };

  const onWheel = (e: WheelEvent) => {
    if ((e.target as Element).closest('.top')) return;
    e.preventDefault();
    cancelAnimationFrame(anim);
    // Lines (Firefox) to pixels; a mouse notch is ~100 px, a pinch a few px per event.
    const unit = e.deltaMode === 1 ? 16 : 1;
    const dx = e.deltaX * unit;
    const dy = e.deltaY * unit;
    if (e.ctrlKey || e.metaKey) {
      const notch = Math.max(-60, Math.min(60, dy));
      zoomAt(e.clientX, e.clientY, cam.z * Math.exp(-notch * 0.01));
    } else {
      const sideways = e.shiftKey && !dx;
      set({ x: cam.x - (sideways ? dy : dx), y: cam.y - (sideways ? 0 : dy), z: cam.z });
    }
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = (e.target as Element).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const keys: Record<string, () => void> = {
      ArrowRight: () => goStep(step + 1),
      ArrowDown: () => goStep(step + 1),
      PageDown: () => goStep(step + 1),
      ArrowLeft: () => goStep(Math.max(0, step - 1)),
      ArrowUp: () => goStep(Math.max(0, step - 1)),
      PageUp: () => goStep(Math.max(0, step - 1)),
      Home: () => goStep(0),
      End: () => goStep(stops.length - 1),
      '+': () => zoomBy(1.25),
      '=': () => zoomBy(1.25),
      '-': () => zoomBy(0.8),
      '0': overview,
    };
    const action = keys[e.key];
    if (!action) return;
    e.preventDefault();
    action();
  };

  // #anchor links to a stop fly there instead of jumping (the intro's index, the top bar).
  const onClick = (e: MouseEvent) => {
    const link = (e.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
    if (!link || link.origin !== location.origin || link.pathname !== location.pathname) return;
    const index = ids.get(decodeURIComponent(link.hash.slice(1)));
    if (index === undefined) return;
    e.preventDefault();
    goStep(index);
  };

  // Tabbing into a frame brings it on screen.
  const onFocus = (e: FocusEvent) => {
    if (pointerBusy) return;
    const target = (e.target as Element).closest<HTMLElement>('[data-stop]');
    const index = Number(target?.dataset.stop);
    if (target && !Number.isNaN(index) && index !== step) goStep(index);
  };

  // Back / forward, or a #stop typed in the address bar.
  const onHash = () => {
    const index = ids.get(decodeURIComponent(location.hash.slice(1)));
    if (index !== undefined && index !== step) goStep(index);
  };

  const onResize = () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    cancelAnimationFrame(anim);
    const stop = stops[step];
    set(fit(stop ?? bounds), true);
  };

  const actions: Record<string, () => void> = {
    prev: () => goStep(step - 1),
    next: () => goStep(step + 1),
    in: () => zoomBy(1.25),
    out: () => zoomBy(0.8),
    fit: overview,
  };
  const onTool = (e: MouseEvent) => {
    const button = (e.target as Element).closest<HTMLButtonElement>('button');
    if (!button) return;
    const act = button.dataset.act;
    if (act && actions[act]) actions[act]();
    else if (button.classList.contains('mini-f')) goStep(Number(button.dataset.stop));
  };

  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerup', onUp);
  root.addEventListener('pointercancel', onUp);
  window.addEventListener('wheel', onWheel, { passive: false });
  document.addEventListener('keydown', onKey);
  document.addEventListener('click', onClick);
  world.addEventListener('focusin', onFocus);
  window.addEventListener('resize', onResize);
  window.addEventListener('hashchange', onHash);
  tools.addEventListener('click', onTool);

  // ---- Start: from the overview the inline script painted, fly to the first stop ----

  set(cam, true);
  showStep();
  const hash = decodeURIComponent(location.hash.slice(1));
  const start = ids.get(options.at ?? hash) ?? 0;
  const timer = window.setTimeout(() => goStep(start), motion.matches || options.at ? 0 : 700);

  return () => {
    window.clearTimeout(timer);
    cancelAnimationFrame(anim);
    cancelAnimationFrame(frame);
    root.removeEventListener('pointerdown', onDown);
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerup', onUp);
    root.removeEventListener('pointercancel', onUp);
    window.removeEventListener('wheel', onWheel);
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('click', onClick);
    world.removeEventListener('focusin', onFocus);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('hashchange', onHash);
    tools.removeEventListener('click', onTool);
    world.style.removeProperty('transform');
    world.style.removeProperty('--z');
    root.removeAttribute('style');
    root.classList.remove('dragging');
    html.classList.remove('far');
    sel.hidden = true;
    return stops[step]?.id ?? null;
  };
}
