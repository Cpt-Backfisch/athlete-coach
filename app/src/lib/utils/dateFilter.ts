import type { Activity } from '../activities';

export type TimeRange = '1W' | '4W' | '12W' | '6M' | '1J' | '2024' | '2025' | '2026' | 'all';

// Gibt den frühesten Datumspunkt für den gewählten Zeitraum zurück.
export function getTimeRangeStart(range: TimeRange): Date | null {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);

  switch (range) {
    case '1W':
      return new Date(heute.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '4W':
      return new Date(heute.getTime() - 28 * 24 * 60 * 60 * 1000);
    case '12W':
      return new Date(heute.getTime() - 84 * 24 * 60 * 60 * 1000);
    case '6M':
      return new Date(heute.getTime() - 183 * 24 * 60 * 60 * 1000);
    case '1J':
      return new Date(heute.getTime() - 365 * 24 * 60 * 60 * 1000);
    case '2024':
      return new Date('2024-01-01');
    case '2025':
      return new Date('2025-01-01');
    case '2026':
      return new Date('2026-01-01');
    case 'all':
      return null;
  }
}

export function filterByTimeRangeEnd(range: TimeRange): Date | null {
  switch (range) {
    case '2024':
      return new Date('2024-12-31T23:59:59');
    case '2025':
      return new Date('2025-12-31T23:59:59');
    default:
      return null;
  }
}

export function filterByTimeRange(activities: Activity[], range: TimeRange): Activity[] {
  if (range === 'all') return activities;
  const start = getTimeRangeStart(range);
  const end = filterByTimeRangeEnd(range);
  if (!start) return activities;
  return activities.filter((a) => {
    const d = new Date(a.date);
    return d >= start && (end === null || d <= end);
  });
}

export function filterBySport(activities: Activity[], sport: string): Activity[] {
  if (sport === 'all') return activities;
  return activities.filter((a) => a.sport_type === sport);
}
