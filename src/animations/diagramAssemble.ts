/**
 * Signature moment 4: a case study's architecture diagram assembles as it scrolls into view.
 * Boundaries appear, then the boxes in reading order, then the arrows draw from source to
 * target, then their labels, and last the numbered decision markers, one by one.
 *
 * Only loaded on motion-capable desktops. The diagram is in the HTML finished, so if this
 * never runs, or the drawing is already on screen when the page loads, nothing is missing.
 */
import { MOTION_QUERY, ScrollTrigger, ease, gsap, seconds } from './motion';

const part = (svg: SVGSVGElement, name: string) =>
  [...svg.querySelectorAll<SVGGElement>(`[data-diagram-part="${name}"]`)];

export function assembleDiagrams(figures: HTMLElement[]): void {
  gsap.matchMedia().add(MOTION_QUERY, () => {
    const settle = ease('--ease-out');
    const moderate = seconds('--duration-moderate', 0.4);
    const slow = seconds('--duration-slow', 0.7);
    const stagger = seconds('--stagger', 0.12);
    const hiddenMarkers = new Map<SVGPathElement, string>();

    for (const figure of figures) {
      const svg = figure.querySelector('svg');
      // Already in view at load (a reload, a link to #architecture): leave it finished.
      if (!svg || figure.getBoundingClientRect().top < window.innerHeight * 0.8) continue;

      const groups = part(svg, 'group');
      const nodes = part(svg, 'node');
      const edges = part(svg, 'edge');
      const callouts = part(svg, 'callout');

      // Reading order: top to bottom, then left to right.
      const position = new Map(nodes.map((node) => [node, node.getBBox()]));
      nodes.sort((a, b) => {
        const boxA = position.get(a);
        const boxB = position.get(b);
        return boxA && boxB ? boxA.y - boxB.y || boxA.x - boxB.x : 0;
      });

      const timeline = gsap.timeline({ paused: true, defaults: { ease: settle } });
      timeline
        .from(groups, { opacity: 0, duration: moderate })
        .from(nodes, { opacity: 0, y: 10, duration: moderate, stagger: stagger * 0.6 }, '<0.1');

      const labels: SVGTextElement[] = [];
      edges.forEach((edge, index) => {
        const line = edge.querySelector<SVGPathElement>('[data-edge-line]');
        const label = edge.querySelector<SVGTextElement>('[data-edge-label]');
        if (label) labels.push(label);
        if (!line) return;
        const at = index === 0 ? '>-0.15' : `<${stagger * 0.5}`;

        if (edge.classList.contains('diagram__edge--dashed')) {
          // Dashes can't be drawn with a dash offset, so dashed arrows fade in instead.
          timeline.from(line, { opacity: 0, duration: moderate }, at);
          return;
        }

        // The arrowhead would sit at the far end before the line reaches it: hide it
        // while the line draws, put it back when the line arrives.
        const marker = line.getAttribute('marker-end') ?? '';
        hiddenMarkers.set(line, marker);
        line.removeAttribute('marker-end');
        const length = line.getTotalLength();
        timeline.fromTo(
          line,
          { strokeDasharray: length, strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            duration: slow * 0.8,
            ease: 'power1.inOut',
            onComplete: () => {
              line.setAttribute('marker-end', marker);
              hiddenMarkers.delete(line);
              gsap.set(line, { clearProps: 'strokeDasharray,strokeDashoffset' });
            },
          },
          at,
        );
      });

      timeline
        .from(labels, { opacity: 0, duration: moderate, stagger: stagger * 0.4 }, '>-0.2')
        .from(
          callouts,
          { opacity: 0, scale: 0.4, transformOrigin: '50% 50%', duration: moderate, stagger: stagger * 2 },
          '>-0.1',
        );

      ScrollTrigger.create({
        trigger: figure,
        start: 'top 75%',
        once: true,
        onEnter: () => timeline.play(),
      });
    }

    // Leaving the motion query (resize, reduced motion turned on): gsap.matchMedia reverts
    // the tweens; the arrowheads it could not know about go back here.
    return () => {
      for (const [line, marker] of hiddenMarkers) line.setAttribute('marker-end', marker);
      hiddenMarkers.clear();
    };
  });
}
