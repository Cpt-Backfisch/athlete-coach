import { describe, it, expect } from 'vitest';
import { calcVO2maxFromRace } from '../../src/utils/vdot.js';

describe('calcVO2maxFromRace (Jack-Daniels-VDOT)', () => {
  // Erwartungswerte berechnet mit der gleichen Formel (Python-Referenzimplementierung).
  // Reale Rennergebnisse von Sebastian als Ankerpunkte — ändern sich nicht.

  it('Frankfurter Halbmarathon 2025 (1:40:30) → VDOT 44.9', () => {
    // 21.0975 km in 1:40:30 = 6030 Sek
    expect(calcVO2maxFromRace(21.0975, 6030)).toBe(44.9);
  });

  it('HH Triathlon KD 2025 Laufsplit (10km, 46:15) → VDOT 43.8', () => {
    // 10 km in 46:15 = 2775 Sek
    expect(calcVO2maxFromRace(10, 2775)).toBe(43.8);
  });

  it('10km in 40:00 → VDOT 51.9', () => {
    expect(calcVO2maxFromRace(10, 2400)).toBe(51.9);
  });

  it('Marathon 3:30:00 → VDOT 44.6', () => {
    // 42.195 km in 3:30:00 = 12600 Sek
    expect(calcVO2maxFromRace(42.195, 12600)).toBe(44.6);
  });

  it('Ergebnis liegt immer im realistischen Bereich (30–90)', () => {
    // Schwaches Ergebnis
    const slow = calcVO2maxFromRace(10, 3600); // 10km in 60min
    expect(slow).toBeGreaterThan(30);
    expect(slow).toBeLessThan(90);

    // Gutes Ergebnis
    const fast = calcVO2maxFromRace(10, 1800); // 10km in 30min
    expect(fast).toBeGreaterThan(30);
    expect(fast).toBeLessThan(90);
  });

  it('Schnelleres Ergebnis → höherer VDOT', () => {
    const slower = calcVO2maxFromRace(10, 3000); // 10km in 50min
    const faster = calcVO2maxFromRace(10, 2400); // 10km in 40min
    expect(faster).toBeGreaterThan(slower);
  });

  it('Längere Distanz bei gleichem Tempo → höherer VDOT (pctVO2-Korrekturfaktor)', () => {
    // 5km und 10km mit identischem Tempo (5:00/km) — längere Rennen
    // erfordern höheren %-Anteil des VO2max → VDOT-Schätzung steigt
    const vdot5k  = calcVO2maxFromRace(5, 1500);  // 5km, 25:00
    const vdot10k = calcVO2maxFromRace(10, 3000); // 10km, 50:00
    expect(vdot10k).toBeGreaterThan(vdot5k);
  });
});
