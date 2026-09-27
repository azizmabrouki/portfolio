/**
 * Where the signature motion runs: desktops (768px and wider) whose owner has not asked
 * for reduced motion. Everywhere else the site shows the finished drawings, still.
 *
 * BaseLayout mirrors this on <html> as the `motion-ok` class before first paint, so the
 * CSS can switch layouts without a flash; the animation modules use it with gsap.matchMedia.
 */
export const MOTION_QUERY = '(prefers-reduced-motion: no-preference) and (min-width: 768px)';
