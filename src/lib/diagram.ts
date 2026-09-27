/**
 * Layout for the architecture diagrams on case study pages.
 *
 * A diagram is described in a project's frontmatter on a coarse grid: each box sits in a
 * cell (x = column, y = row, w = columns wide) and edges name the boxes they join. This
 * module turns that into SVG coordinates and orthogonal edge routes, so the drawing
 * component only has to paint. Pure functions, no Astro: easy to test and to animate later.
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

export interface DiagramSpec {
  title: string;
  description: string;
  columns: number;
  rows: number;
  nodes: DiagramNode[];
  groups?: DiagramGroup[] | undefined;
  edges: DiagramEdge[];
}

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

/** One grid cell. Boxes sit inside their cells with room around them for edges and labels. */
export const CELL_W = 200;
export const CELL_H = 124;
const NODE_INSET_X = 16;
const NODE_TOP = 36;
const NODE_H = 60;
const GROUP_INSET = 6;
/** Edges joining the same two boxes in both directions are drawn side by side. */
const PARALLEL_GAP = 8;
/** Minimum overlap (px) for a straight edge between two boxes. */
const MIN_OVERLAP = 24;

const nodeRect = (node: DiagramNode): Rect => ({
  x: node.x * CELL_W + NODE_INSET_X,
  y: node.y * CELL_H + NODE_TOP,
  w: (node.w ?? 1) * CELL_W - NODE_INSET_X * 2,
  h: NODE_H,
});

const groupRect = (group: DiagramGroup): Rect => ({
  x: group.x * CELL_W + GROUP_INSET,
  y: group.y * CELL_H + GROUP_INSET,
  w: group.w * CELL_W - GROUP_INSET * 2,
  h: group.h * CELL_H - GROUP_INSET * 2,
});

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

export function layoutDiagram(spec: DiagramSpec): DiagramLayout {
  const nodes: PlacedNode[] = spec.nodes.map((node) => ({
    ...nodeRect(node),
    id: node.id,
    label: node.label,
    note: node.note,
    kind: node.kind ?? 'module',
    accent: node.accent ?? false,
  }));
  const groups: PlacedGroup[] = (spec.groups ?? []).map((group) => ({
    ...groupRect(group),
    id: group.id,
    label: group.label,
  }));

  const boxes = new Map<string, Rect>();
  for (const box of [...groups, ...nodes]) boxes.set(box.id, box);

  const edges: PlacedEdge[] = spec.edges.map((edge, index) => {
    const a = boxes.get(edge.from);
    const b = boxes.get(edge.to);
    if (!a || !b) throw new Error(`Diagram "${spec.title}": edge ${edge.from} → ${edge.to} names an unknown box.`);

    let points = route(a, b);
    let side: 1 | -1 = -1;
    const hasReverse = spec.edges.some((other) => other.from === edge.to && other.to === edge.from);
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

  return { width: spec.columns * CELL_W, height: spec.rows * CELL_H, nodes, groups, edges };
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
