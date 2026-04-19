import type { SportType } from '../activities';

// ── Hilfsfunktion: Sekunden in mm:ss oder h:mm:ss ─────────────────────────

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Distanz-Formatierung ───────────────────────────────────────────────────

export function formatDistance(distance: number, sport: SportType): string {
  if (sport === 'swim') {
    return `${Math.round(distance)} m`;
  }
  return `${(distance / 1000).toFixed(2)} km`;
}

// ── Pace-Formatierung (sportartspezifisch) ────────────────────────────────

export function formatPace(distance: number, duration: number, sport: SportType): string {
  if (distance <= 0 || duration <= 0) return '—';

  if (sport === 'run' || sport === 'misc') {
    // min/km
    const sekundenProKm = duration / (distance / 1000);
    const min = Math.floor(sekundenProKm / 60);
    const sec = Math.round(sekundenProKm % 60);
    return `${min}:${String(sec).padStart(2, '0')} /km`;
  }

  if (sport === 'swim') {
    // min:sec / 100m
    const sekundenPro100m = duration / (distance / 100);
    const min = Math.floor(sekundenPro100m / 60);
    const sec = Math.round(sekundenPro100m % 60);
    return `${min}:${String(sec).padStart(2, '0')} /100m`;
  }

  if (sport === 'bike') {
    // km/h
    const kmh = distance / 1000 / (duration / 3600);
    return `${kmh.toFixed(1)} km/h`;
  }

  return '—';
}
