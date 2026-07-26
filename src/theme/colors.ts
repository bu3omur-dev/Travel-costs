export interface Palette {
  bg: string;
  surface: string;
  text: string;
  divider: string;
  neutral200: string;
  neutral600: string;
  neutral700: string;
  accent: string;
  accentTint: string; // accent-100
  accentStrong: string; // accent-600, hover/pressed
  accentText: string; // accent-700, text-on-ground accent
  positive: string;
  backdrop: string;
}

// Ported from `palette(dark)` in Trip Expense Tracker.dc.html — the
// modernist design system's light ramp, plus its hand-tuned dark override.
export const lightPalette: Palette = {
  bg: '#f3f2f2',
  surface: '#eae9e9',
  text: '#201e1d',
  divider: 'rgba(32,30,29,0.4)',
  neutral200: '#eae7e7',
  neutral600: '#7d7979',
  neutral700: '#605d5d',
  accent: '#ec3013',
  accentTint: '#fff2ef',
  accentStrong: '#dd2b0f',
  accentText: '#ae1800',
  positive: '#1a7a3d',
  backdrop: 'rgba(32,30,29,0.5)',
};

export const darkPalette: Palette = {
  bg: '#1b1a1a',
  surface: '#262424',
  text: '#f5f3f3',
  divider: 'rgba(245,243,243,0.22)',
  neutral200: '#302e2e',
  neutral600: '#c5c1c1',
  neutral700: '#b0acac',
  accent: '#ff5a3d',
  accentTint: '#3a1d17',
  accentStrong: '#ff7a5f',
  accentText: '#ff9783',
  positive: '#5fce8a',
  backdrop: 'rgba(0,0,0,0.6)',
};

export function paletteFor(darkMode: boolean): Palette {
  return darkMode ? darkPalette : lightPalette;
}
