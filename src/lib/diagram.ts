/**
 * Layout for the architecture diagrams on case study pages.
 *
 * A diagram is described in a project's frontmatter on a coarse grid: each box sits in a
 * cell (x = column, y = row, w = columns wide) and edges name the boxes they join. This
 * module turns that into SVG coordinates and orthogonal edge routes, so the drawing
 * component only has to paint. Pure functions, no Astro: easy to test and to animate later.
 *
 * The same spec can also be laid out narrow, for phones: `narrowSpec` moves every box to
 * its place on the narrow grid, and edges listed in `lanes` run down the side of the
 * drawing instead of straight through the boxes below them.
 */

export type NodeKind = 'module' | 'service' | 'store' | 'external' | 'client';

export interface DiagramNode {
  id: string;
  label: string;
  note?: string | undefined;
  x: number;
  y: number;
  w?: number | undefined;
  kind?: NodeKind | undefined;
  accent?: boolean | undefined;
}

export interface DiagramGroup {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string | undefined;
  dashed?: boolean | undefined;
}

export type Lane = 'left' | 'right';

export interface DiagramSpec {
  title: string;
  description: string;
  columns: number;
  rows: number;
  nodes: DiagramNode[];
  groups?: DiagramGroup[] | undefined;
  edges: DiagramEdge[];
  /** Edges (by target id) that run down the left or right side of the drawing. */
  lanes?: Record<string, Lane> | undefined;
}

export interface NarrowPlacement {
  columns: number;
  rows: number;
  nodes: Record<string, { x: number; y: number; w?: number | undefined }>;
  groups?: Record<string, { x: number; y: number; w?: number | undefined; h: number }> | undefined;
  lanes?: Record<string, Lane> | undefined;
}

/** The spec with every box moved to its place on the narrow grid. */
export function narrowSpec(spec: DiagramSpec, narrow: NarrowPlacement): DiagramSpec {
  return {
    ...spec,
    columns: narrow.columns,
    rows: narrow.rows,
    nodes: spec.nodes.map((node) => {
      const place = narrow.nodes[node.id];
      return place ? { ...node, ...place, w: place.w ?? 1 } : node;
    }),
    groups: spec.groups?.map((group) => {
      const place = narrow.groups?.[group.id];
      return place ? { ...group, ...place, w: place.w ?? group.w } : group;
    }),
    lanes: narrow.lanes,
  };
}

/** Grid and box sizes, in px. The defaults draw the wide (desktop) version. */
export interface LayoutOptions {
  cellW: number;
  cellH: number;
  nodeH: number;
  /** Space between a box and the sides of its cell. */
  insetX: number;
  /** Space between the top of a cell and its box. */
  nodeTop: number;
  groupInset: number;
  /**
   * Labels of an edge pair (A → B and B → A) drawn as straight vertical lines: 'sides'
   * puts each on its own outer side; 'stacked' puts both left of the pair, one above the
   * other, as a narrow drawing has no room on both sides.
   */
  pairLabels: 'sides' | 'stacked';
}

export const WIDE: LayoutOptions = {
  cellW: 200,
  cellH: 140,
  nodeH: 72,
  insetX: 24,
  nodeTop: 44,
  groupInset: 6,
  pairLabels: 'sides',
};
export const NARROW: LayoutOptions = {
  cellW: 171,
  cellH: 68,
  nodeH: 56,
  insetX: 12,
  nodeTop: 0,
  groupInset: 0,
  pairLabels: 'stacked',
};

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface PlacedNode extends Rect {
  id: string;
  label: string;
  note?: string | undefined;
  kind: NodeKind;
  accent: boolean;
}

export interface PlacedGroup extends Rect {
  id: string;
  label: string;
}

export interface PlacedEdge {
  id: string;
  from: string;
  to: string;
  points: Point[];
  label?: string | undefined;
  labelAt: Point & { anchor: 'start' | 'middle' | 'end' };
  dashed: boolean;
}

export interface DiagramLayout {
  width: number;
  height: number;
  nodes: PlacedNode[];
  groups: PlacedGroup[];
  edges: PlacedEdge[];
}

/** Edges joining the same two boxes in both directions are drawn side by side. */
const PARALLEL_GAP = 8;
/** Minimum overlap (px) for a straight edge between two boxes. */
const MIN_OVERLAP = 24;

const nodeRect = (node: DiagramNode, o: LayoutOptions): Rect => ({
  x: node.x * o.cellW + o.insetX,
  y: node.y * o.cellH + o.nodeTop,
  w: (node.w ?? 1) * o.cellW - o.insetX * 2,
  h: o.nodeH,
});

const groupRect = (group: DiagramGroup, o: LayoutOptions): Rect => ({
  x: group.x * o.cellW + o.groupInset,
  y: group.y * o.cellH + o.groupInset,
  w: group.w * o.cellW - o.groupInset * 2,
  h: group.h * o.cellH - o.groupInset * 2,
});

/** Down the side of the drawing, then across into the side of the target box. */
function laneRoute(a: Rect, b: Rect, lane: Lane): Point[] {
  const x = lane === 'left' ? Math.min(a.x, b.x) + 4 : Math.max(right(a), right(b)) - 4;
  const y = b.y + b.h / 2;
  return [
    { x, y: bottom(a) },
    { x, y },
    { x: lane === 'left' ? b.x : right(b), y },
  ];
}

const right = (r: Rect) => r.x + r.w;
const bottom = (r: Rect) => r.y + r.h;

/** Orthogonal route from box a to box b: straight when they face each other, else one elbow. */
export function route(a: Rect, b: Rect): Point[] {
  const overlapX1 = Math.max(a.x, b.x);
  const overlapX2 = Math.min(right(a), right(b));
  if (overlapX2 - overlapX1 >= MIN_OVERLAP) {
    const x = (overlapX1 + overlapX2) / 2;
    if (b.y >= bottom(a)) return [{ x, y: bottom(a) }, { x, y: b.y }];
    if (a.y >= bottom(b)) return [{ x, y: a.y }, { x, y: bottom(b) }];
  }

  const overlapY1 = Math.max(a.y, b.y);
  const overlapY2 = Math.min(bottom(a), bottom(b));
  if (overlapY2 - overlapY1 >= MIN_OVERLAP) {
    const y = (overlapY1 + overlapY2) / 2;
    if (b.x >= right(a)) return [{ x: right(a), y }, { x: b.x, y }];
    if (a.x >= right(b)) return [{ x: a.x, y }, { x: right(b), y }];
  }

  const ax = a.x + a.w / 2;
  const bx = b.x + b.w / 2;
  if (b.y >= bottom(a)) {
    const mid = (bottom(a) + b.y) / 2;
    return [
      { x: ax, y: bottom(a) },
      { x: ax, y: mid },
      { x: bx, y: mid },
      { x: bx, y: b.y },
    ];
  }
  if (a.y >= bottom(b)) {
    const mid = (a.y + bottom(b)) / 2;
    return [
      { x: ax, y: a.y },
      { x: ax, y: mid },
      { x: bx, y: mid },
      { x: bx, y: bottom(b) },
    ];
  }

  // Side by side without enough vertical overlap: leave sideways, turn once in the gap.
  const ay = a.y + a.h / 2;
  const by = b.y + b.h / 2;
  const goingRight = b.x >= right(a);
  const startX = goingRight ? right(a) : a.x;
  const endX = goingRight ? b.x : right(b);
  const mid = (startX + endX) / 2;
  return [
    { x: startX, y: ay },
    { x: mid, y: ay },
    { x: mid, y: by },
    { x: endX, y: by },
  ];
}

/** Shift a straight two-point route sideways, for the second of two opposite edges. */
function offset(points: Point[], by: number): Point[] {
  if (points.length !== 2) return points;
  const [p, q] = points as [Point, Point];
  const vertical = p.x === q.x;
  return points.map((point) => (vertical ? { x: point.x + by, y: point.y } : { x: point.x, y: point.y + by }));
}

/**
 * The label sits beside the middle of the longest segment: above a horizontal line and
 * right of a vertical one, or below / left for the second edge of an opposite pair.
 */
function labelPosition(points: Point[], side: 1 | -1 = -1): PlacedEdge['labelAt'] {
  let best: [Point, Point] = [points[0] as Point, points[1] as Point];
  let bestLength = -1;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p = points[i] as Point;
    const q = points[i + 1] as Point;
    const length = Math.abs(q.x - p.x) + Math.abs(q.y - p.y);
    if (length > bestLength) {
      best = [p, q];
      bestLength = length;
    }
  }
  const [p, q] = best;
  const x = (p.x + q.x) / 2;
  const y = (p.y + q.y) / 2;
  if (p.x === q.x) {
    return side < 0 ? { x: x + 8, y: y + 4, anchor: 'start' } : { x: x - 8, y: y + 4, anchor: 'end' };
  }
  return side < 0 ? { x, y: y - 8, anchor: 'middle' } : { x, y: y + 16, anchor: 'middle' };
}

export function layoutDiagram(spec: DiagramSpec, o: LayoutOptions = WIDE): DiagramLayout {
  const nodes: PlacedNode[] = spec.nodes.map((node) => ({
    ...nodeRect(node, o),
    id: node.id,
    label: node.label,
    note: node.note,
    kind: node.kind ?? 'module',
    accent: node.accent ?? false,
  }));
  const groups: PlacedGroup[] = (spec.groups ?? []).map((group) => ({
    ...groupRect(group, o),
    id: group.id,
    label: group.label,
  }));

  const boxes = new Map<string, Rect>();
  for (const box of [...groups, ...nodes]) boxes.set(box.id, box);

  const edges: PlacedEdge[] = spec.edges.map((edge, index) => {
    const a = boxes.get(edge.from);
    const b = boxes.get(edge.to);
    if (!a || !b) throw new Error(`Diagram "${spec.title}": edge ${edge.from} → ${edge.to} names an unknown box.`);

    const lane = spec.lanes?.[edge.to];
    if (lane) {
      const points = laneRoute(a, b, lane);
      const corner = points[1] as Point;
      return {
        id: `e${index}`,
        from: edge.from,
        to: edge.to,
        points,
        label: edge.label,
        // Above the turn, on the inside of the lane.
        labelAt: { x: corner.x + (lane === 'left' ? 10 : -10), y: corner.y - b.h / 2 - 8, anchor: lane === 'left' ? 'start' : 'end' },
        dashed: edge.dashed ?? false,
      };
    }

    let points = route(a, b);
    let side: 1 | -1 = -1;
    const hasReverse = spec.edges.some((other) => other.from === edge.to && other.to === edge.from);
    const vertical = points.length === 2 && points[0]?.x === points[1]?.x;
    if (hasReverse && vertical && o.pairLabels === 'stacked') {
      const first = edge.from < edge.to;
      points = offset(points, (first ? -1 : 1) * PARALLEL_GAP);
      const [p, q] = points as [Point, Point];
      // Left of the pair, where a narrow drawing has room: the outer margin for the left
      // column, the middle for the right one. The first edge's label sits above the second's.
      const pairLeft = Math.min(p.x, q.x) - (first ? 0 : PARALLEL_GAP * 2);
      return {
        id: `e${index}`,
        from: edge.from,
        to: edge.to,
        points,
        label: edge.label,
        labelAt: { x: pairLeft - 10, y: (p.y + q.y) / 2 + (first ? -6 : 12), anchor: 'end' },
        dashed: edge.dashed ?? false,
      };
    }
    if (hasReverse && points.length === 2) {
      // Keep the pair apart: the edge whose source id sorts first goes up (or right), the
      // other down (or left), each with its label on its own outer side.
      const first = edge.from < edge.to;
      const vertical = points[0]?.x === points[1]?.x;
      points = offset(points, (first ? -1 : 1) * (vertical ? -1 : 1) * PARALLEL_GAP);
      side = first ? -1 : 1;
    }

    return {
      id: `e${index}`,
      from: edge.from,
      to: edge.to,
      points,
      label: edge.label,
      labelAt: labelPosition(points, side),
      dashed: edge.dashed ?? false,
    };
  });

  return { width: spec.columns * o.cellW, height: spec.rows * o.cellH, nodes, groups, edges };
}

export const toPath = (points: Point[]): string =>
  points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');

/** "A → B: label" lines for the text version of the drawing. */
export function describeEdges(spec: DiagramSpec): string[] {
  const names = new Map<string, string>();
  for (const box of [...(spec.groups ?? []), ...spec.nodes]) names.set(box.id, box.label);
  return spec.edges.map((edge) => {
    const line = `${names.get(edge.from) ?? edge.from} → ${names.get(edge.to) ?? edge.to}`;
    return edge.label ? `${line}: ${edge.label}` : line;
  });
}

export interface Callout {
  /** Shown in the bubble, e.g. "01": the number of the decision it points to. */
  label: string;
  /** Id of the box (node or group) the decision is about. */
  target: string;
}

export interface PlacedCallout {
  label: string;
  target: string;
  /** Centre of the bubble: the top-right corner of the box. */
  x: number;
  y: number;
  r: number;
}

const CALLOUT_R = 12;

/** Decision markers on the drawing: a numbered bubble on the top-right corner of the box a decision is about. */
export function placeCallouts(layout: DiagramLayout, callouts: Callout[]): PlacedCallout[] {
  const boxes = new Map<string, Rect>();
  for (const box of [...layout.groups, ...layout.nodes]) boxes.set(box.id, box);

  return callouts.map((callout) => {
    const box = boxes.get(callout.target);
    if (!box) throw new Error(`Decision callout ${callout.label} points at an unknown box: ${callout.target}.`);
    return { ...callout, x: right(box), y: box.y, r: CALLOUT_R };
  });
}
