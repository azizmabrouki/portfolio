/** WCAG 2.x relative luminance of a #rrggbb colour. */
function luminance(hex: string): number {
  const channel = (offset: number): number => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** WCAG 2.x contrast ratio between two #rrggbb colours, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/** The AA level a text colour reaches: body text needs 4.5:1, large text (24px+) 3:1. */
export function aaLevel(ratio: number): 'AA' | 'AA large' | 'Lines only' {
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA large';
  return 'Lines only';
}
