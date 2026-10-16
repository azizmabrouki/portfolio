/**
 * Where the 3D world runs: wide, landscape screens whose owner has not asked for reduced
 * motion. Everywhere else (phones, tablets held upright, reduced motion, no JavaScript)
 * the home page is the still page: the same content, flat drawings, nothing pinned.
 *
 * BaseLayout mirrors this on <html> as the `w3d` class before first paint, so the CSS
 * picks the layout without a flash. `w3d-off` is set if the 3D module fails to load,
 * and keeps the still page for the rest of the visit.
 */
export const WORLD_QUERY = '(min-width: 1024px) and (min-aspect-ratio: 23/20) and (prefers-reduced-motion: no-preference)';
