/**
 * The colour tokens as data, for the /style page (swatches and contrast ratios).
 * Mirrors src/styles/tokens.css: when a colour changes there, change it here too.
 */
export interface Swatch {
  token: `--color-${string}`;
  name: string;
  light: string;
  dark: string;
  use: string;
  /** Shown with its contrast ratio against paper. */
  text: boolean;
}

export const palette: Swatch[] = [
  { token: '--color-paper', name: 'Paper', light: '#efeae1', dark: '#262420', use: 'Page background', text: false },
  { token: '--color-paper-raised', name: 'Paper, raised', light: '#f6f2eb', dark: '#302d29', use: 'Sheets and cards', text: false },
  { token: '--color-paper-sunk', name: 'Paper, sunk', light: '#e6e0d5', dark: '#1e1c19', use: 'Wells and code', text: false },
  { token: '--color-ink', name: 'Ink', light: '#262420', dark: '#efeae1', use: 'Text and lines', text: true },
  { token: '--color-ink-muted', name: 'Ink, muted', light: '#5c574f', dark: '#b0aba3', use: 'Secondary text', text: true },
  { token: '--color-accent', name: 'Vermilion', light: '#c2532b', dark: '#c2532b', use: 'Lines, fills, text 24px+', text: true },
  { token: '--color-accent-text', name: 'Vermilion, text', light: '#a34624', dark: '#db7d5b', use: 'Vermilion at body size', text: true },
];

export const paper = { light: '#efeae1', dark: '#262420' } as const;
