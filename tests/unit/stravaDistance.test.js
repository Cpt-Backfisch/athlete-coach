import { describe, it, expect } from 'vitest';
import { convertStravaDistance } from '../../src/utils/stravaDistance.js';

describe('convertStravaDistance', () => {
  // --- Schwimmen: Strava liefert Meter, keine Konversion ---
  it('Schwimm-Distanz 1500m bleibt 1500m', () => {
    expect(convertStravaDistance(1500, 'swim')).toBe(1500);
  });

  it('Schwimm-Distanz 750m bleibt 750m', () => {
    expect(convertStravaDistance(750, 'swim')).toBe(750);
  });

  it('Schwimm-Distanz 400m (Kurzdistanz-Warmup) bleibt 400m', () => {
    expect(convertStravaDistance(400, 'swim')).toBe(400);
  });

  // --- Laufen / Radfahren: Strava liefert km → Meter ---
  it('Lauf 10km → 10000m', () => {
    expect(convertStravaDistance(10, 'run')).toBe(10000);
  });

  it('Marathon 42.195km → 42195m', () => {
    expect(convertStravaDistance(42.195, 'bike')).toBe(42195);
  });

  it('Halbmarathon 21.0975km → 21097.5m', () => {
    expect(convertStravaDistance(21.0975, 'run')).toBe(21097.5);
  });

  // --- Meilen-Spalte: distance_mi → Meter ---
  it('6.21371 Meilen (≈ 10km) aus distance_mi-Spalte → ~10000m', () => {
    const result = convertStravaDistance(6.21371, 'run', 'distance_mi');
    expect(result).toBeCloseTo(10000, 0);
  });

  // --- Edge Cases ---
  it('Distanz 0 → 0m', () => {
    expect(convertStravaDistance(0, 'run')).toBe(0);
  });

  it('Falsy-Wert (undefined) → 0m', () => {
    expect(convertStravaDistance(undefined, 'swim')).toBe(0);
  });

  it('Spalte "minimum" gilt nicht als Meilen-Spalte', () => {
    // 'minimum' enthält 'mi' aber auch 'min' → kein Miles-Modus
    expect(convertStravaDistance(10, 'run', 'minimum')).toBe(10000);
  });
});
