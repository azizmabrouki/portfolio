/**
 * The 3D world of the home page, in plain DOM and CSS 3D: no WebGL, no animation library.
 * Ported from the design canvas (Motion-v3). Loaded by scripts/home.ts only where the world
 * runs (see query.ts).
 *
 * The scroll story, in scenes (s = 0…6, blended by scroll position):
 *   0 hero: the five plates lie stacked, flat     1 noise: plates and loose tickets fly apart
 *   2 system: plates lock into a tall stack; each principle lights the plates it holds up
 *   3 break it: the plates sink away and the live model (front door, servers, data) rises
 *   4 work: the stack again, the active slot's screen lands on top
 *   5 route: plates turn into blades in a rack; each stop pulls one out
 *   6 contact: a flat stack with an empty, glowing layer on top: "your team"
 * Every pose is a target; springs move the plates there, so scrolling back and forth is
 * always smooth. One requestAnimationFrame loop reads the layout and writes transforms.
 */
import worldMarkup from './world.html?raw';
import { breakServer, chaosState, onChaos } from '@/scripts/chaos';
import { work } from '@/config/work';
import { system } from '@/config/home';

type Vec = number[];
interface Spring {
  x: Vec | null;
  v: Vec;
}

const SECTIONS = ['hero', 'sys', 'brk', 'work', 'route', 'contact'] as const;
type Section = (typeof SECTIONS)[number];

/** Plates each work slot lights (index = slot number, 1-based). */
const LIT: Record<number, number[]> = Object.fromEntries(work.map((slot, index) => [index + 1, slot.lights]));
/** Plates each principle lights: 0 runs, 1 scales, 2 ships, 3 users touch, 4 stays up. */
const PRIN = system.principles.map((principle) => principle.lights);

const cl = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const seg = (x: number, a: number, b: number) => cl((x - a) / (b - a));
const sm = (x: number) => {
  const c = cl(x);
  return c * c * (3 - 2 * c);
};
const bump = (s: number, k: number, w = 0.6) => cl(1 - Math.abs(s - k) / w);
const tf = (v: Vec) =>
  `translate3d(${v[0].toFixed(1)}px,${v[1].toFixed(1)}px,${v[2].toFixed(1)}px) rotateX(${v[3].toFixed(2)}deg) rotateY(${v[4].toFixed(2)}deg) rotateZ(${v[5].toFixed(2)}deg)`;
const toggle = (el: Element | null | undefined, name: string, on: boolean) => {
  if (el && el.hasAttribute(name) !== on) el.toggleAttribute(name, on);
};
const setAttr = (el: Element | null | undefined, name: string, value: string) => {
  if (el && el.getAttribute(name) !== value) el.setAttribute(name, value);
};

export function createWorld(root: HTMLElement) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s);
  const qa = <T extends Element = HTMLElement>(s: string) => [...root.querySelectorAll<T>(s)];

  // ---- the world's markup, inserted once ----
  const stage = q('.world');
  if (!stage) throw new Error('No .world element on the page.');
  if (!stage.querySelector('[data-cam]')) {
    stage.insertAdjacentHTML('beforeend', worldMarkup.replace(/<!--[\s\S]*?-->/, '').replace(/>\s+</g, '><').trim());
    const screens = JSON.parse(stage.dataset.screens ?? '[]') as string[];
    stage.querySelectorAll<HTMLElement>('[data-screen-text]').forEach((span) => {
      span.textContent = screens[Number(span.dataset.screenText) - 1] ?? '';
    });
  }

  // ---- elements ----
  const E = {
    cam: q('[data-cam]') as HTMLElement,
    spot: q('[data-spot]'),
    plates: qa('[data-plate]'),
    screens: qa('[data-screen]'),
    ghost: q('[data-ghostp]'),
    bits: qa('[data-bit]'),
    rig: q('[data-rig="traffic"]'),
    pk: qa('[data-pk]'),
    leds: qa('[data-led]'),
    beats: qa('[data-beat]'),
    mk: Object.fromEntries(qa('[data-mk]').map((m) => [m.dataset.mk ?? '', m])) as Record<string, HTMLElement>,
    lab: Object.fromEntries(qa('[data-lab]').map((l) => [l.dataset.lab ?? '', l])) as Record<string, HTMLElement>,
    ln: qa<SVGLineElement>('[data-ln]'),
    ld: qa<SVGCircleElement>('[data-ld]'),
    labWrap: q('.labels'),
    sec: Object.fromEntries(SECTIONS.map((k) => [k, q(`[data-sec="${k}"]`)])) as Record<Section, HTMLElement | null>,
    stmts: q('[data-sys]'),
    prins: qa('[data-pr]'),
    prBtns: qa('[data-prb]'),
    projs: qa('[data-proj]'),
    rows: qa('[data-row]'),
    listen: q('[data-listen]'),
  };

  // ---- fixed randomness: the same scatter on every visit ----
  let seed = 20261016;
  const R = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const S = () => R() * 2 - 1;
  // where each plate floats while the system is still noise
  const scat = [
    [-470, -120, 140, 38, -22, 58],
    [380, -200, -60, -32, 28, -40],
    [-220, 230, 260, 24, 40, 112],
    [470, 160, 70, -40, -18, -76],
    [60, -330, 300, 30, 26, 24],
  ];
  const bitsP: Vec[] = [];
  for (let i = 0; i < 14; i++) bitsP.push([S() * 640, S() * 380, S() * 320, S() * 180, S() * 180, S() * 180, R()]);
  // the live model: where each request travels
  const routes: Record<string, Vec[]> = {};
  const Y: Record<string, number> = { a1: 95, a2: 210, a3: 325, a4: 440 };
  for (const k in Y) {
    const y = Y[k];
    routes[k] = [[-20, 270], [190, 270], [250, 270], [250, y], [330, y], [420, y], [520, y], [520, 270], [600, 270]];
  }

  // ---- state ----
  let raf = 0;
  let time = 0;
  let last = 0;
  let s = 0;
  let beat = 0;
  let rate = 1 / 1.6;
  let listen = false;
  let mx = 0;
  let my = 0;
  let tmx = 0;
  let tmy = 0;
  const pl: (Spring & { flashed: boolean })[] = E.plates.map(() => ({ x: null, v: [0, 0, 0, 0, 0, 0, 0], flashed: false }));
  const sc: Spring[] = E.screens.map(() => ({ x: null, v: [0, 0, 0, 0, 0, 0, 0] }));
  const gh: Spring = { x: null, v: [0, 0, 0, 0, 0, 0, 0] };
  let cam: Vec | null = null;
  let rigW = 0;
  let autoDone = false;
  let autoAt = 0;
  const pkRoute: string[] = [];
  const pkCycle: number[] = [];
  let io: IntersectionObserver | null = null;
  const cleanups: (() => void)[] = [];

  function spring(st: Spring, tgt: Vec, dt: number, k: number, c: number): Vec {
    if (!st.x || reduce) {
      st.x = tgt.slice();
      st.v = tgt.map(() => 0);
      return st.x;
    }
    const steps = Math.max(1, Math.ceil(dt / 0.008));
    const h = dt / steps;
    for (let n = 0; n < steps; n++) {
      for (let i = 0; i < tgt.length; i++) {
        st.v[i] += ((tgt[i] - st.x[i]) * k - st.v[i] * c) * h;
        st.x[i] += st.v[i] * h;
      }
    }
    for (let i = 0; i < tgt.length; i++)
      if (!Number.isFinite(st.x[i])) {
        st.x[i] = tgt[i];
        st.v[i] = 0;
      }
    return st.x;
  }

  /** A rule that takes focus or a click scrolls the page to its step, so it opens and lights its plates. */
  function goPrin(i: number): void {
    const sec = E.sec.sys;
    if (!sec) return;
    const r = sec.getBoundingClientRect();
    const pinH = Math.min(window.innerHeight, 1000);
    const span = Math.max(1, r.height - pinH);
    const cur = cl(-r.top / span);
    const curIdx = cur >= 0.5 ? Math.min(3, Math.floor((cur - 0.5) / 0.12)) : -1;
    if (curIdx === i) return;
    window.scrollTo({ top: window.scrollY + r.top + (0.56 + 0.12 * i) * span, behavior: reduce ? 'auto' : 'smooth' });
  }

  function setupReveal(): void {
    const list = qa('.rv');
    if (!('IntersectionObserver' in window)) {
      list.forEach((n) => n.setAttribute('data-in', ''));
      return;
    }
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute('data-in', '');
          io?.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    list.forEach((n) => io?.observe(n));
  }

  function packets(t: number): void {
    const n = E.pk.length;
    const cyc = 3.6;
    const state = chaosState();
    for (let i = 0; i < n; i++) {
      const ph = i / n;
      const u = t / cyc + ph;
      const c = Math.floor(u);
      const f = u - c;
      if (pkCycle[i] !== c) {
        pkCycle[i] = c;
        let baseK = ['a1', 'a2', 'a3'][i % 3];
        if (baseK === 'a2' && state === 'down') baseK = i % 2 ? 'a1' : 'a3';
        if (baseK === 'a2' && state === 'healed') baseK = 'a4';
        pkRoute[i] = baseK;
      }
      const key = pkRoute[i];
      // a request already past the front door when its server dies is retried elsewhere: hide it
      const hide = key === 'a2' && state !== 'idle' && f > 0.25;
      const path = routes[key];
      const segs: [Vec, Vec, number][] = [];
      let total = 0;
      for (let p = 0; p < path.length - 1; p++) {
        const a = path[p];
        const b = path[p + 1];
        const l = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
        segs.push([a, b, l]);
        total += l;
      }
      let d = f * total;
      let x = path[0][0];
      let y = path[0][1];
      let ang = 0;
      for (const [a, b, l] of segs) {
        if (d <= l) {
          const g = l ? d / l : 0;
          x = a[0] + (b[0] - a[0]) * g;
          y = a[1] + (b[1] - a[1]) * g;
          ang = b[1] !== a[1] ? 90 : 0;
          break;
        }
        d -= l;
      }
      const el = E.pk[i];
      el.style.transform = `translate3d(${(x - 11).toFixed(1)}px,${(y - 5).toFixed(1)}px,5px) rotateZ(${ang}deg)`;
      const edge = f < 0.04 ? f / 0.04 : f > 0.96 ? (1 - f) / 0.04 : 1;
      el.style.opacity = hide ? '0' : (edge * Math.min(1, rigW)).toFixed(3);
    }
  }

  function tick(now: number): void {
    if (document.hidden) {
      last = now;
      return;
    }
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    time += dt;
    const t = time;
    const ease = (k: number) => 1 - Math.exp(-dt * k);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const wh = Math.min(vh, 1100);
    const pinH = Math.min(vh, 1000);

    // ---- where we are in the story ----
    const R = {} as Record<Section, DOMRect | null>;
    for (const key of SECTIONS) R[key] = E.sec[key]?.getBoundingClientRect() ?? null;
    const prog = (r: DOMRect | null) => (r ? cl(-r.top / Math.max(1, r.height - pinH)) : 0);
    const enter = (r: DOMRect | null) => (r ? cl((vh - r.top) / vh) : 0);
    const pSys = prog(R.sys);
    const pR = prog(R.route);
    // the system section: noise, then the stack, then one principle per step
    const pIdx = pSys >= 0.5 ? Math.min(3, Math.floor((pSys - 0.5) / 0.12)) : -1;
    const target =
      seg(pSys, 0.03, 0.15) +
      seg(pSys, 0.25, 0.4) +
      seg(enter(R.brk), 0.2, 0.8) +
      seg(enter(R.work), 0.15, 0.75) +
      seg(enter(R.route), 0.25, 0.85) +
      seg(enter(R.contact), 0.2, 0.8);
    s += (Math.min(6, target) - s) * (reduce ? 1 : ease(6));
    const near = Math.round(s);

    setAttr(
      E.stmts,
      'data-sys',
      !(R.sys && R.sys.top < vh * 0.55) ? 'idle' : pSys < 0.36 ? 'noise' : pIdx < 0 ? 'system' : 'prin',
    );
    E.prins.forEach((li, i) => toggle(li, 'data-on', pIdx === i));
    E.prBtns.forEach((b, i) => setAttr(b, 'aria-expanded', pIdx === i ? 'true' : 'false'));

    // active project: the one crossing the middle of the screen
    let actT = 0;
    if (R.work && R.work.top < vh * 0.5 && R.work.bottom > vh * 0.5) {
      E.projs.forEach((proj, i) => {
        const pr = proj.getBoundingClientRect();
        if (pr.top < vh * 0.62 && pr.bottom > vh * 0.38) actT = i + 1;
      });
    }
    E.projs.forEach((proj, i) => toggle(proj, 'data-cur', actT === i + 1));

    // route: one stop at a time; each stop pulls one of the five blades out of the rack
    const nR = Math.max(1, E.rows.length - 1);
    const fR = pR * (nR - 0.4);
    const flo = Math.floor(fR);
    const sf = Math.min(nR - 1, flo + sm((fR - flo - 0.45) / 0.55));
    const eR = enter(R.route);
    const cur = Math.round(sf);
    const endR = pR > 0.92;
    const blade = nR > 1 ? Math.round((cur * 4) / (nR - 1)) : cur;
    E.rows.forEach((row, i) => {
      toggle(row, 'data-on', i < nR ? eR > 0.55 && sf >= i - 0.1 : endR);
      toggle(row, 'data-cur', i < nR ? eR > 0.55 && Math.abs(sf - i) < 0.3 && !endR : endR);
    });

    // heartbeat, quicker while the visitor hovers "Email me"
    rate += ((listen ? 1 / 0.55 : 1 / 1.6) - rate) * ease(4);
    beat = reduce ? 0.6 : (beat + dt * rate) % 1;
    const bk = Math.exp(-beat * 6);
    E.beats.forEach((b) => {
      b.style.transform = `scale(${(1 + 0.6 * bk).toFixed(3)})`;
      b.style.opacity = (0.5 + 0.5 * bk).toFixed(3);
    });
    E.leds.forEach((b) => {
      b.style.transform = `translateZ(3px) scale(${(1 + 0.8 * bk).toFixed(3)})`;
      b.style.opacity = (0.35 + 0.65 * bk).toFixed(3);
    });

    // ---- the plates: pose per scene, blended by scroll, moved by springs ----
    const prinLit = near === 2 && pIdx >= 0 ? PRIN[pIdx] : null;
    const pose = (k: number, i: number): Vec => {
      if (k === 0) return [0, 0, i * 22 - 44, 0, 0, 0, 1];
      if (k === 1) {
        const c = scat[i];
        return [
          c[0] + Math.sin(t * 0.3 + i) * 26,
          c[1] + Math.cos(t * 0.27 + i * 2) * 22,
          c[2] + Math.sin(t * 0.22 + i * 3) * 24,
          c[3] + Math.sin(t * 0.2 + i) * 8,
          c[4] + Math.cos(t * 0.18 + i) * 8,
          c[5] + t * (i % 2 ? 4 : -4),
          1,
        ];
      }
      if (k === 2) return [0, 0, i * 112 - 224, 0, 0, 0, 1];
      if (k === 3) return [0, 0, -640 - i * 50, 0, 0, 0, 0];
      if (k === 4) return [0, 0, i * 100 - 260, 0, 0, 0, 1];
      if (k === 5) return [i === blade ? 300 : 0, (i - 2) * 66, i === blade ? 70 : 20, 90, 0, 0, 1];
      return [0, 0, i * 22 - 74, 0, 0, 0, 1];
    };
    const blendPose = (sv: number, i: number): Vec => {
      const a = Math.max(0, Math.min(6, Math.floor(sv)));
      const b = Math.min(6, a + 1);
      const f = sm(sv - a);
      const A = pose(a, i);
      const B = pose(b, i);
      return A.map((value, q) => value + (B[q] - value) * f);
    };
    const litSet = near === 0 ? [4] : near === 4 ? (LIT[actT] ?? []) : near === 5 ? [blade] : (prinLit ?? []);
    E.plates.forEach((el, i) => {
      const tg = blendPose(Math.max(0, s - i * 0.045), i);
      if (near === 1 || (s > 0.6 && s < 1.4)) tg[6] = 1;
      const v = spring(pl[i], tg, dt, 90, 13.5);
      el.style.transform = tf(v);
      const op = cl(v[6]);
      el.style.setProperty('--o', op.toFixed(3));
      el.style.visibility = op < 0.02 ? 'hidden' : 'visible';
      const below = i > 0 ? pl[i - 1].x : null;
      const gapBelow = below ? v[2] - below[2] : 0;
      const stacked = (s > 1.6 && s < 4.6 && near !== 3) || s < 0.4 || s > 5.5;
      el.style.setProperty('--so', (stacked && i > 0 ? cl(1.2 - gapBelow / 160) * 0.9 : 0).toFixed(2));
      el.style.setProperty('--sg', `${Math.max(4, gapBelow - 18).toFixed(1)}px`);
      toggle(el, 'data-lit', litSet.includes(i));
      // a flash on the edges when a plate locks into the stack
      if (s < 1.4) pl[i].flashed = false;
      if (!pl[i].flashed && Math.abs(s - 2) < 0.2 && Math.abs(v[2] - (i * 112 - 224)) < 6 && Math.abs(pl[i].v[2]) < 60) {
        pl[i].flashed = true;
        el.setAttribute('data-flash', '');
        window.setTimeout(() => el.removeAttribute('data-flash'), 600);
      }
    });

    // the screen of the active project lands on top of its stack
    const topZ = 4 * 100 - 260 + 150;
    const wWork = bump(s, 4, 0.7);
    E.screens.forEach((se, j) => {
      const mine = actT === j + 1 && wWork > 0.5;
      const stg = mine
        ? [0, 0, topZ, 0, 0, 0, 1]
        : [0, actT > j + 1 ? -60 : 60, topZ + 760, 0, 0, actT > j + 1 ? 10 : -10, 0];
      const sv = spring(sc[j], stg, dt, 70, 12);
      se.style.transform = tf(sv);
      const so = cl(sv[6]);
      se.style.setProperty('--o', so.toFixed(3));
      se.style.visibility = so < 0.02 ? 'hidden' : 'visible';
    });

    // the empty slot: the next blade in the rack, then the open layer on the stack
    const w5 = bump(s, 5, 0.7);
    const w6 = bump(s, 6, 0.7);
    const gt = w6 >= w5 ? [0, 0, 4 * 22 - 74 + (listen ? 46 : 120), 0, 0, 0, w6] : [0, -3 * 66, 20, 90, 0, 0, w5];
    const gv = spring(gh, gt, dt, 70, 12);
    if (E.ghost) {
      E.ghost.style.transform = tf(gv);
      const go = cl(gv[6]);
      E.ghost.style.setProperty('--o', go.toFixed(3));
      E.ghost.style.visibility = go < 0.02 ? 'hidden' : 'visible';
    }

    // noise: loose tickets and alerts fly out of the slab, then get pulled into the stack
    const nf = s < 1 ? sm(s) : cl(1 - (s - 1) * 1.4);
    E.bits.forEach((be, i) => {
      if (nf < 0.01) {
        if (be.style.visibility !== 'hidden') be.style.visibility = 'hidden';
        return;
      }
      const bp = bitsP[i];
      be.style.visibility = 'visible';
      const dr = t * (0.25 + bp[6] * 0.4);
      be.style.transform = `translate3d(${(bp[0] * nf + Math.sin(dr + i) * 20).toFixed(1)}px,${(bp[1] * nf + Math.cos(dr * 0.8 + i) * 16).toFixed(1)}px,${(bp[2] * nf + 60).toFixed(1)}px) rotateX(${(bp[3] + dr * 40).toFixed(1)}deg) rotateY(${(bp[4] + dr * 30).toFixed(1)}deg) rotateZ(${bp[5].toFixed(1)}deg) scale(${(0.4 + 0.6 * nf).toFixed(3)})`;
      be.style.setProperty('--o', nf.toFixed(3));
    });

    // ---- the live model: starts on its own once, the first time it is in view ----
    const w3 = bump(s, 3, 0.7);
    rigW += (w3 - rigW) * (reduce ? 1 : ease(5));
    if (E.rig) {
      E.rig.style.transform = `translate3d(0px,0px,${(-40 - 260 * (1 - rigW)).toFixed(1)}px)`;
      E.rig.style.setProperty('--o', cl(rigW).toFixed(3));
      E.rig.style.visibility = rigW < 0.02 ? 'hidden' : 'visible';
    }
    if (w3 > 0.85 && !autoDone && chaosState() === 'idle') {
      if (!autoAt) autoAt = t + 1.6;
      if (t > autoAt) {
        autoDone = true;
        breakServer();
      }
    }
    if (rigW > 0.02) packets(t);

    // ---- camera: one move per scene ----
    const sway = reduce ? 0 : Math.sin(t * 0.25) * 4;
    const camFor = (k: number): Vec => {
      if (k === 0) return [58, -42 + sway, 0.24, 0.02, 0.9];
      if (k === 1) return [52, -32, 0.1, 0.02, 0.84];
      if (k === 2) return [58, -40 + 6 * sm((pSys - 0.4) / 0.58), 0.17, 0.04, 0.74 - 0.05 * sm((pSys - 0.4) / 0.58)];
      if (k === 3) return [56, -38, 0.19, 0.06, 0.8];
      if (k === 4) return [58, -42, -0.26, 0.08, 0.74];
      if (k === 5) return [62, -50, -0.21, 0.08, 0.76];
      return [58, -42, -0.21, 0.1, 0.92];
    };
    const ca = Math.max(0, Math.min(6, Math.floor(s)));
    const cf = sm(s - ca);
    const CA = camFor(ca);
    const CB = camFor(Math.min(6, ca + 1));
    const ct = CA.map((value, i) => value + (CB[i] - value) * cf);
    mx += (tmx - mx) * ease(3);
    my += (tmy - my) * ease(3);
    if (!reduce) {
      ct[0] += my * 2.5;
      ct[1] += mx * 3;
    }
    if (!cam || reduce) cam = ct.slice();
    else for (let i = 0; i < 5; i++) cam[i] += (ct[i] - cam[i]) * ease(4);
    const base = Math.min(vw / 1440, wh / 900);
    E.cam.style.transform = `translate(${(cam[2] * vw).toFixed(1)}px,${(cam[3] * wh).toFixed(1)}px) scale(${(cam[4] * base).toFixed(4)}) rotateX(${cam[0].toFixed(2)}deg) rotateZ(${cam[1].toFixed(2)}deg)`;
    E.spot?.style.setProperty('--sx', `${(50 + cam[2] * 100).toFixed(1)}%`);

    // ---- labels that follow the 3D ----
    const wL = Math.max(bump(s, 2, 0.3), bump(s, 4, 0.3));
    let lx = 0;
    const pts: (DOMRect | null)[] = [];
    setAttr(E.labWrap, 'data-mode', near === 4 ? 'work' : 'sys');
    if (wL > 0.01) {
      for (let i = 0; i < 5; i++) {
        const mr = E.mk[`L${i}`]?.getBoundingClientRect() ?? null;
        pts.push(mr);
        if (mr && mr.left > lx) lx = mr.left;
      }
      lx = Math.min(lx + 56, vw - 250);
      if (near === 4) lx = Math.min(lx, vw - 48 - Math.min(0.4 * vw, 560) - 170);
    }
    for (let i = 0; i < 5; i++) {
      const lab = E.lab[`L${i}`];
      const ln = E.ln[i];
      const ld = E.ld[i];
      const onL = (near === 4 && (LIT[actT] ?? []).includes(i)) || (near === 2 && !!prinLit && prinLit.includes(i));
      const p0 = pts[i];
      if (wL <= 0.01 || !p0) {
        if (lab) lab.style.opacity = '0';
        ln?.setAttribute('x2', ln.getAttribute('x1') ?? '0');
        ld?.setAttribute('cx', '-20');
        continue;
      }
      const y0 = p0.top;
      lab.style.transform = `translate(${lx.toFixed(1)}px,${y0.toFixed(1)}px) translateY(-50%)`;
      lab.style.opacity = wL.toFixed(3);
      toggle(lab, 'data-on', onL);
      ln.setAttribute('x1', (p0.left + 6).toFixed(1));
      ln.setAttribute('y1', y0.toFixed(1));
      ln.setAttribute('x2', (lx - 12).toFixed(1));
      ln.setAttribute('y2', y0.toFixed(1));
      ln.style.opacity = wL.toFixed(3);
      toggle(ln, 'data-on', onL);
      ld.setAttribute('cx', p0.left.toFixed(1));
      ld.setAttribute('cy', y0.toFixed(1));
      ld.style.opacity = wL.toFixed(3);
      toggle(ld, 'data-on', onL);
    }
    for (const tk of ['lb', 'a1', 'a2', 'a3', 'a4', 'db']) {
      const tlab = E.lab[tk];
      const tm = E.mk[tk];
      if (!tlab) continue;
      let tw = rigW > 0.6 ? cl((rigW - 0.6) / 0.4) : 0;
      if (tk === 'a4' && chaosState() === 'idle') tw = 0;
      if (tw < 0.01 || !tm) {
        tlab.style.opacity = '0';
        continue;
      }
      const trc = tm.getBoundingClientRect();
      tlab.style.transform = `translate(${trc.left.toFixed(1)}px,${(trc.top - 16).toFixed(1)}px) translate(-50%,-100%)`;
      tlab.style.opacity = tw.toFixed(3);
    }
    const gl = E.lab.ghost;
    const gm = E.mk.ghost;
    if (gl && gm) {
      const gw = cl(gv[6]) * (w6 > 0.6 ? 1 : 0);
      if (gw > 0.01) {
        const grc = gm.getBoundingClientRect();
        gl.style.transform = `translate(${(grc.left + 30).toFixed(1)}px,${grc.top.toFixed(1)}px) translateY(-50%)`;
      }
      gl.style.opacity = gw.toFixed(3);
      gl.style.alignItems = 'flex-start';
    }
  }

  function frame(now: number): void {
    raf = requestAnimationFrame(frame);
    try {
      tick(now);
    } catch (error) {
      console.warn('[portfolio] 3D frame failed:', error);
    }
  }

  function listenTo<K extends keyof WindowEventMap>(target: Window, type: K, fn: (e: WindowEventMap[K]) => void): void;
  function listenTo(target: EventTarget, type: string, fn: (e: Event) => void): void;
  function listenTo(target: EventTarget, type: string, fn: (e: Event) => void): void {
    target.addEventListener(type, fn, { passive: true });
    cleanups.push(() => target.removeEventListener(type, fn));
  }

  function start(): void {
    if (raf) return;
    last = 0;
    listenTo(window, 'pointermove', (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      tmx = (e.clientX / window.innerWidth) * 2 - 1;
      tmy = (e.clientY / window.innerHeight) * 2 - 1;
    });
    if (E.listen) {
      listenTo(E.listen, 'pointerenter', () => (listen = true));
      listenTo(E.listen, 'pointerleave', () => (listen = false));
      listenTo(E.listen, 'focus', () => (listen = true));
      listenTo(E.listen, 'blur', () => (listen = false));
    }
    // Focus or a click on a rule's title scrolls to that rule's step.
    if (E.stmts) {
      listenTo(E.stmts, 'focusin', (e) => {
        const li = (e.target as Element | null)?.closest<HTMLElement>('[data-pr]');
        if (li) goPrin(Number(li.dataset.pr));
      });
      listenTo(E.stmts, 'click', (e) => {
        const button = (e.target as Element | null)?.closest<HTMLElement>('[data-prb]');
        if (button) goPrin(Number(button.dataset.prb));
      });
    }
    E.prBtns.forEach((b) => b.removeAttribute('aria-pressed'));
    // A visitor who presses the button takes over: no automatic run after that.
    cleanups.push(onChaos(() => (autoDone = true)));
    setupReveal();
    raf = requestAnimationFrame(frame);
  }

  function stop(): void {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    cleanups.splice(0).forEach((fn) => fn());
    io?.disconnect();
    io = null;
    // The still page shows everything: drop the reveal and the scroll states.
    qa('.rv').forEach((n) => n.setAttribute('data-in', ''));
    E.beats.forEach((b) => b.removeAttribute('style'));
    E.projs.forEach((proj) => proj.removeAttribute('data-cur'));
    E.rows.forEach((row) => {
      row.removeAttribute('data-on');
      row.removeAttribute('data-cur');
    });
  }

  return { start, stop };
}
