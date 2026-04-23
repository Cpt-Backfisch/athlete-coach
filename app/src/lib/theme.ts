// Design-Token für das gesamte Design-System — hier zentral, nirgendwo sonst hardcoden

export const SPORT_COLORS = {
  run: { dark: '#8E6FE0', light: '#5B3DB8' },
  swim: { dark: '#3359C4', light: '#2A47A0' },
  bike: { dark: '#FF7A1A', light: '#D25F0F' },
  misc: { dark: '#B54A2E', light: '#8A3721' },
} as const;

export const STATUS_COLORS = {
  good: { dark: '#66d9a8', light: '#0F6E56' },
  warning: { dark: '#F5B800', light: '#A37300' },
  overload: { dark: '#E24B4A', light: '#A32D2D' },
} as const;

export const RADIUS = {
  card: '12px',
  pill: '999px',
} as const;

export const BG = {
  dark: '#000000',
  light: '#FAFAF8',
} as const;

// Primary-Akzent (Purple Dark) — für Active-States, Wordmark-Punkt und Buttons
export const ACCENT = '#8E6FE0' as const;
