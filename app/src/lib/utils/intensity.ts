export const INTENSITY_LABELS: Record<number, string> = {
  1: 'Sehr locker',
  2: 'Locker',
  3: 'Moderat',
  4: 'Hart',
  5: 'Maximal',
};

export function getIntensityLabel(intensity: number): string {
  return INTENSITY_LABELS[intensity] ?? '';
}
