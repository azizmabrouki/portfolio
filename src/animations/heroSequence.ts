/**
 * Signature moments 1 and 2: the building draws itself, then scroll tilts the front
 * elevation into an exploded axonometric and opens it floor by floor, each floor
 * pulling out as its section appears.
 *
 * Only loaded on motion-capable desktops (see query.ts). The markup and CSS already show
 * the finished drawing, so if this never runs, nothing is missing.
 */
import { MOTION_QUERY, ScrollTrigger, ease, gsap, seconds } from './motion';
import {
  EXPLODE_AT,
  EXPLODE_FOR,
  FLOOR_EVERY,
  PANEL_IN,
  PANEL_LEAD,
  PANEL_OUT,
  PANEL_REST,
  TILT_AT,
  TILT_FOR,
  floorAt,
  restPositions,
  sequenceLength,
} from './timing';

function viewName(time: number): string {
  if (time < TILT_AT + 0.25) return 'Front elevation';
  if (time < EXPLODE_AT + EXPLODE_FOR - 0.2) return 'Axonometric';
  return 'Axonometric, exploded';
}

export function initHeroSequence(root: HTMLElement): void {
  const mm = gsap.matchMedia();

  mm.add(MOTION_QUERY, () => {
    const scene = root.querySelector<HTMLElement>('[data-scene]');
    const intro = root.querySelector<HTMLElement>('[data-panel="intro"]');
    const floors = [...root.querySelectorAll<HTMLElement>('[data-floor]')];
    const panels = floors.map((floor) =>
      root.querySelector<HTMLElement>(`[data-panel="${floor.dataset.floor ?? ''}"]`),
    );
    const links = [...root.querySelectorAll<HTMLAnchorElement>('[data-floor-link], [data-rail-step]')];
    const steps = [...root.querySelectorAll<HTMLAnchorElement>('[data-rail-step]')];
    const railFill = root.querySelector<HTMLElement>('[data-rail-fill]');
    const label = root.querySelector<HTMLElement>('[data-view-name]');
    if (!scene || !intro || panels.some((panel) => !panel)) return;

    const allPanels = [intro, ...(panels as HTMLElement[])];
    const settle = ease('--ease-out');
    const draw = ease('--ease-in-out', 'power2.inOut');
    const total = sequenceLength(floors.length);
    // Moment each rail step becomes current: the intro from the start, each floor as its
    // section starts to fade in.
    const stepStarts = [0, ...floors.map((_, index) => floorAt(index) - PANEL_LEAD)];
    let currentStep = -1;

    const markStep = (time: number) => {
      let step = 0;
      stepStarts.forEach((start, index) => {
        if (time >= start) step = index;
      });
      if (step === currentStep) return;
      currentStep = step;
      steps.forEach((link, index) => {
        if (index === step) link.setAttribute('aria-current', 'step');
        else link.removeAttribute('aria-current');
      });
    };

    // Scroll sequence, scrubbed: scrolling forward plays it, scrolling back rewinds it.
    const sequence = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        // Never leave the page between two steps: when scrolling stops, finish the move to
        // the nearest resting state, forward or back.
        snap: {
          snapTo: restPositions(floors.length),
          directional: false,
          delay: 0.12,
          duration: { min: 0.25, max: 0.7 },
          ease: draw,
        },
      },
      onUpdate: () => {
        const time = sequence.time();
        if (label) label.textContent = viewName(time);
        markStep(time);
        // Stacked panels: only the visible one takes pointer input, so it is never covered
        // by an invisible neighbour. Hidden panels stay focusable and readable.
        for (const panel of allPanels) {
          panel.style.pointerEvents = Number(gsap.getProperty(panel, 'opacity')) > 0.5 ? 'auto' : 'none';
        }
      },
    });

    // The building: tilt from the first pixel of scroll, explode while it turns.
    sequence
      .to(scene, { '--rx': '-30deg', '--ry': '-38deg', duration: TILT_FOR, ease: draw }, TILT_AT)
      .to(scene, { '--line': 0, duration: 0.4 }, TILT_AT)
      .to(scene, { '--plane': 1, duration: 0.6 }, TILT_AT + 0.3)
      .to(scene, { '--gap': '46px', duration: EXPLODE_FOR, ease: draw }, EXPLODE_AT);

    // The intro drifts up from the first pixel, then hands over to the first floor's section.
    const firstIn = floorAt(0) - PANEL_LEAD;
    sequence
      .to(intro, { y: -48, duration: firstIn }, 0)
      .to(intro, { opacity: 0, duration: PANEL_OUT }, firstIn - PANEL_OUT + 0.05);

    if (railFill) sequence.fromTo(railFill, { scaleY: 0 }, { scaleY: 1, duration: total }, 0);

    floors.forEach((floor, index) => {
      const panel = panels[index] as HTMLElement;
      const at = floorAt(index);
      const isLast = index === floors.length - 1;
      const fadeIn = at - PANEL_LEAD;
      const visible = fadeIn + PANEL_IN;
      // Hold until just before the next section starts, then hand over quickly.
      const restUntil = isLast ? total : at + FLOOR_EVERY - PANEL_LEAD - PANEL_OUT + 0.05;

      sequence
        // The floor slides out of the building…
        .to(floor, { '--hl': 1, '--pull': '56px', duration: 0.45, ease: settle }, at - 0.2)
        // …its section fades in as the previous one finishes fading out…
        .fromTo(
          panel,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: PANEL_IN, ease: settle, immediateRender: false },
          fadeIn,
        )
        // …and drifts slowly while it holds, so the page always answers the scroll.
        .to(panel, { y: -24, duration: restUntil - visible }, visible);

      if (!isLast) {
        sequence
          .to(floor, { '--hl': 0, '--pull': '0px', duration: 0.35, ease: draw }, restUntil)
          .to(panel, { opacity: 0, y: -48, duration: PANEL_OUT }, restUntil);
      }
    });

    sequence.set({}, {}, total);
    markStep(0);

    // Intro: the front elevation draws itself from the ground up, once, at the top of the page.
    const introDraw = gsap.timeline({ paused: true });
    if (window.scrollY < 10) {
      const fronts = floors
        .map((floor) => floor.querySelector<HTMLElement>('.face--front'))
        .filter((front): front is HTMLElement => front !== null);
      const details = [...root.querySelectorAll<HTMLElement>('[data-floor] .floor__label, [data-floor] .windows')];
      const foundation = root.querySelector<HTMLElement>('[data-foundation] .face--front');
      const groundLine = root.querySelector<HTMLElement>('[data-ground-line]');
      const hidden = 'inset(100% 0% 0% 0%)';
      const shown = 'inset(0% 0% 0% 0%)';

      if (foundation) {
        introDraw.fromTo(
          foundation,
          { clipPath: hidden },
          { clipPath: shown, duration: seconds('--duration-moderate', 0.4), ease: settle },
          0,
        );
      }
      if (groundLine) {
        introDraw.fromTo(
          groundLine,
          { clipPath: 'inset(0% 50% 0% 50%)' },
          { clipPath: shown, duration: seconds('--duration-slow', 0.7), ease: settle },
          0,
        );
      }
      introDraw
        .fromTo(
          fronts,
          { clipPath: hidden },
          {
            clipPath: shown,
            duration: seconds('--duration-slow', 0.7),
            ease: settle,
            stagger: { each: seconds('--stagger', 0.12) * 1.5, from: 'end' },
          },
          0.15,
        )
        .from(details, { opacity: 0, duration: seconds('--duration-moderate', 0.4) }, '>-0.2')
        .set([...fronts, ...details, ...[foundation, groundLine].filter((el) => el !== null)], {
          clearProps: 'clipPath,opacity',
        });
      introDraw.play();
    }

    // Scrolling during the intro finishes it at once instead of fighting it.
    const skipIntro = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      onUpdate: () => {
        if (introDraw.isActive()) introDraw.progress(1);
      },
    });

    // Clickable floors and rail steps, and keyboard focus: go to that step in the sequence.
    const scrollToTime = (time: number) => {
      const trigger = sequence.scrollTrigger;
      if (!trigger) return;
      const top = trigger.start + (trigger.end - trigger.start) * (time / sequence.duration());
      window.scrollTo({ top, behavior: 'smooth' });
    };
    const scrollToFloor = (index: number) => scrollToTime(floorAt(index) + PANEL_REST);

    const onLinkClick = (event: MouseEvent) => {
      const link = event.currentTarget as HTMLAnchorElement;
      const target = link.dataset.floorLink ?? link.dataset.railStep;
      if (target === 'intro') {
        event.preventDefault();
        scrollToTime(0);
        return;
      }
      const index = floors.findIndex((floor) => floor.dataset.floor === target);
      if (index < 0) return;
      event.preventDefault();
      scrollToFloor(index);
    };

    const onPanelFocus = (event: FocusEvent) => {
      const panel = event.currentTarget as HTMLElement;
      const index = panels.indexOf(panel);
      if (index >= 0 && Number(gsap.getProperty(panel, 'opacity')) < 0.5) scrollToFloor(index);
    };

    links.forEach((link) => link.addEventListener('click', onLinkClick));
    panels.forEach((panel) => panel?.addEventListener('focusin', onPanelFocus));

    // Cleanup when the media query stops matching (resize to mobile, reduced motion turned on):
    // gsap.matchMedia reverts every tween and ScrollTrigger made above.
    return () => {
      skipIntro.kill();
      for (const panel of allPanels) panel.style.pointerEvents = '';
      steps.forEach((link) => link.removeAttribute('aria-current'));
      links.forEach((link) => link.removeEventListener('click', onLinkClick));
      panels.forEach((panel) => panel?.removeEventListener('focusin', onPanelFocus));
    };
  });
}
