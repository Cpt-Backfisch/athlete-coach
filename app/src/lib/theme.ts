// Design-Token für das gesamte Design-System — hier zentral, nirgendwo sonst hardcoden

export const SPORT_COLORS = {
  run: { dark: '#8E6FE0', light: '#5B3DB8' },
  swim: { dark: '#3359C4', light: '#2A47A0' },
  bike: { dark: '#FF7A1A', light: '#D25F0F' },
  misc: { dark: '#B54A2E', light: '#8A3721' },
} as const;

export const STATUS_COLORS = {
  good: { dark: '#22c55e', light: '#16a34a' },
  warning: { dark: '#eab308', light: '#ca8a04' },
  overload: { dark: '#ef4444', light: '#dc2626' },
} as const;

export const RADIUS = {
  card: '12px',
  pill: '999px',
} as const;

export const BG = {
  dark: '#141416',
  light: '#FAFAF8',
} as const;

// Akzent-Farbe (Laufen-Purple) — wird für Active-States und Wordmark-Punkt verwendet
export const ACCENT = '#8E6FE0' as const;
