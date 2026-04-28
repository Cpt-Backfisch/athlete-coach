import { SPORT_COLORS } from './theme';

// Gradient-Farben pro Sportart (dunkel unten → hell oben für aufsteigende Balken)
export const SPORT_GRADIENTS = {
  run: { from: '#6B4FC8', to: '#B49FF0', id: 'gradient-run' },
  bike: { from: '#CC5500', to: '#FFB066', id: 'gradient-bike' },
  swim: { from: '#1A3FA0', to: '#6685E0', id: 'gradient-swim' },
  misc: { from: '#8A3520', to: '#D4724A', id: 'gradient-misc' },
  triathlon: { from: '#0A7A76', to: '#40C8C3', id: 'gradient-triathlon' },
} as const;

export const TRIATHLON_COLOR = '#0EA5A0' as const;

export function getSportColor(sport: string): string {
  const key = sport as keyof typeof SPORT_COLORS;
  return SPORT_COLORS[key]?.dark ?? '#888888';
}

export function getSportGradientId(sport: string): string {
  const key = sport as keyof typeof SPORT_GRADIENTS;
  return SPORT_GRADIENTS[key]?.id ?? 'gradient-run';
}

// Einheitliche Farbauflösung für Events (inkl. Triathlon Türkis)
export function getEventColor(sport: string): string {
  if (sport === 'triathlon') return TRIATHLON_COLOR;
  const key = sport as keyof typeof SPORT_COLORS;
  return SPORT_COLORS[key]?.dark ?? '#888888';
}
