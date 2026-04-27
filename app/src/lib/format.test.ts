import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  formatHoursMinutes,
  formatDistanceKm,
  formatSwimMeters,
  formatNumberDE,
} from './format';

describe('formatDuration', () => {
  it('0 Stunden → "0,0 Std"', () => {
    expect(formatDuration(0)).toBe('0,0 Std');
  });
  it('1,5 Stunden → "1,5 Std"', () => {
    expect(formatDuration(1.5)).toBe('1,5 Std');
  });
  it('rundet auf eine Nachkommastelle', () => {
    expect(formatDuration(1.25)).toBe('1,3 Std');
  });
  it('große Zahl → "123,4 Std"', () => {
    expect(formatDuration(123.4)).toBe('123,4 Std');
  });
});

describe('formatHoursMinutes', () => {
  it('0 Stunden → "0:00 Std"', () => {
    expect(formatHoursMinutes(0)).toBe('0:00 Std');
  });
  it('1,5 Stunden → "1:30 Std"', () => {
    expect(formatHoursMinutes(1.5)).toBe('1:30 Std');
  });
  it('Minuten werden zweistellig dargestellt', () => {
    expect(formatHoursMinutes(1 + 5 / 60)).toBe('1:05 Std');
  });
  it('10 Stunden exakt → "10:00 Std"', () => {
    expect(formatHoursMinutes(10)).toBe('10:00 Std');
  });
});

describe('formatDistanceKm', () => {
  it('0 km → "0,0 km"', () => {
    expect(formatDistanceKm(0)).toBe('0,0 km');
  });
  it('12,3 km → "12,3 km"', () => {
    expect(formatDistanceKm(12.3)).toBe('12,3 km');
  });
  it('42,195 km → "42,2 km" (1 Nachkommastelle)', () => {
    expect(formatDistanceKm(42.195)).toBe('42,2 km');
  });
  it('2 Nachkommastellen via Parameter', () => {
    expect(formatDistanceKm(12.34, 2)).toBe('12,34 km');
  });
  it('große Distanz → Tausenderpunkt', () => {
    expect(formatDistanceKm(1234.5)).toBe('1.234,5 km');
  });
});

describe('formatSwimMeters', () => {
  it('0 m → "0 m"', () => {
    expect(formatSwimMeters(0)).toBe('0 m');
  });
  it('750 m → "750 m"', () => {
    expect(formatSwimMeters(750)).toBe('750 m');
  });
  it('3525 m → "3.525 m" mit Tausenderpunkt', () => {
    expect(formatSwimMeters(3525)).toBe('3.525 m');
  });
  it('rundet Dezimalstellen', () => {
    expect(formatSwimMeters(3524.7)).toBe('3.525 m');
  });
  it('10000 m → "10.000 m"', () => {
    expect(formatSwimMeters(10000)).toBe('10.000 m');
  });
});

describe('formatNumberDE', () => {
  it('0 → "0"', () => {
    expect(formatNumberDE(0)).toBe('0');
  });
  it('999 → "999"', () => {
    expect(formatNumberDE(999)).toBe('999');
  });
  it('1000 → "1.000" mit Tausenderpunkt', () => {
    expect(formatNumberDE(1000)).toBe('1.000');
  });
  it('1234567 → "1.234.567"', () => {
    expect(formatNumberDE(1234567)).toBe('1.234.567');
  });
});
