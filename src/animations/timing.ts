/**
 * Timing of the hero scroll sequence, in abstract units that ScrollTrigger maps onto the
 * section's scroll length. Shared by the animation and by the markup (progress rail ticks),
 * so both always agree.
 *
 * Every stretch of scroll moves something on both sides: the tilt starts with the first
 * pixel, sections hand over quickly from one to the next, the visible section drifts
 * slowly while it holds, and the rail fills. Stopping between two steps snaps to the nearest.
 */
export const TILT_AT = 0;
export const TILT_FOR = 1.0;
export const EXPLODE_AT = 0.6;
export const EXPLODE_FOR = 0.8;
export const FIRST_FLOOR_AT = 1.1;
export const FLOOR_EVERY = 1.0;
export const HOLD_AT_END = 0.4;

/** A floor's section starts fading in this long before the floor's moment… */
export const PANEL_LEAD = 0.2;
/** …takes this long to fade in… */
export const PANEL_IN = 0.3;
/** …and this long to fade out, just before the next one arrives, so two never overlap much. */
export const PANEL_OUT = 0.2;
/** Where a floor's section is fully open: clicks, the rail and snapping aim here. */
export const PANEL_REST = 0.35;

export const floorAt = (index: number): number => FIRST_FLOOR_AT + index * FLOOR_EVERY;

export const sequenceLength = (floorCount: number): number =>
  floorAt(floorCount - 1) + FLOOR_EVERY + HOLD_AT_END;

/** Positions (0–1) of the rail's steps: the intro, then each floor at rest. */
export const stepPositions = (floorCount: number): number[] => [
  0,
  ...Array.from({ length: floorCount }, (_, index) => (floorAt(index) + PANEL_REST) / sequenceLength(floorCount)),
];

/**
 * Resting states, as scroll progress (0–1): the intro, each floor's section fully open,
 * and the end. When scrolling stops between two of them, the page settles on the nearest.
 */
export const restPositions = (floorCount: number): number[] => [
  ...stepPositions(floorCount),
  1,
];
