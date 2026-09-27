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
  { token: '--color-structure', name: 'Blueprint blue', light: '#1c3559', dark: '#a9c0e0', use: 'Links, navigation, sheet codes', text: true },
  { token: '--color-accent', name: 'Vermilion', light: '#c2532b', dark: '#c2532b', use: 'Emphasis lines and fills, text 24px+', text: true },
  { token: '--color-accent-text', name: 'Orange', light: '#9a4214', dark: '#e0875c', use: 'Emphasis at body size: key numbers, trade-offs', text: true },
  { token: '--color-annotation', name: 'Umber', light: '#6b4a2f', dark: '#d1b08c', use: 'Labels, dates, captions', text: true },
  { token: '--color-mark', name: 'Sand', light: '#ead9c6', dark: '#4a2a1c', use: 'Highlight band behind key phrases', text: false },
];

export const paper = { light: '#efeae1', dark: '#262420' } as const;
