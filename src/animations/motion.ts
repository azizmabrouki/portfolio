/**
 * Shared GSAP setup. Every animation imports gsap from here, so plugins are registered
 * once, and durations and easings come from the motion tokens in tokens.css: editing a
 * token tones the whole site up or down.
 */
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, CustomEase);

export { gsap, ScrollTrigger };
export { MOTION_QUERY } from './query';

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** A duration token (e.g. --duration-slow: 700ms) in seconds. */
export function seconds(name: string, fallback: number): number {
  const value = token(name);
  const number = Number.parseFloat(value);
  if (Number.isNaN(number)) return fallback;
  return value.endsWith('ms') ? number / 1000 : number;
}

const easeCache = new Map<string, string>();

/** An easing token (e.g. --ease-out: cubic-bezier(…)) as a registered GSAP ease name. */
export function ease(name: string, fallback = 'power3.out'): string {
  const cached = easeCache.get(name);
  if (cached) return cached;

  const match = /cubic-bezier\(([^)]+)\)/.exec(token(name));
  const points = match?.[1]?.split(',').map((part) => Number.parseFloat(part)) ?? [];
  if (points.length !== 4 || points.some((point) => Number.isNaN(point))) return fallback;

  const [x1, y1, x2, y2] = points as [number, number, number, number];
  const id = `token${name.replace(/^-+/, '-')}`;
  CustomEase.create(id, `M0,0 C${x1},${y1} ${x2},${y2} 1,1`);
  easeCache.set(name, id);
  return id;
}
