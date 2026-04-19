import { filterByTimeRange, filterBySport } from './dateFilter';
import type { TimeRange } from './dateFilter';
import type { Activity } from '../activities';
import type { WeekGoals } from '../weekFrame';

// ── Chart-Typ ──────────────────────────────────────────────────────────────

export interface WeekBarData {
  weekLabel: string; // z.B. „KW 15"
  run: number; // Stunden
  bike: number;
  swim: number;
  misc: number;
  total: number;
}

// ── Kalendarwoche berechnen ────────────────────────────────────────────────

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const tag = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - tag);
  const jahresStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - jahresStart.getTime()) / 86400000 + 1) / 7);
}

function wochenKey(date: Date): string {
  return `${date.getFullYear()}-W${String(getISOWeek(date)).padStart(2, '0')}`;
}

// ── Wochenvolumen-Daten für das Balkendiagramm ────────────────────────────

export function getWeeklyVolumeData(activities: Activity[], range: TimeRange): WeekBarData[] {
  const gefiltert = filterByTimeRange(activities, range);

  // Aktivitäten nach Kalendarwoche gruppieren
  const wochenMap = new Map<string, WeekBarData>();

  for (const a of gefiltert) {
    const datum = new Date(a.date);
    const key = wochenKey(datum);
    const kw = getISOWeek(datum);

    if (!wochenMap.has(key)) {
      wochenMap.set(key, { weekLabel: `KW ${kw}`, run: 0, bike: 0, swim: 0, misc: 0, total: 0 });
    }

    const eintrag = wochenMap.get(key)!;
    const stunden = a.duration / 3600;

    if (a.sport_type === 'run') eintrag.run += stunden;
    else if (a.sport_type === 'bike') eintrag.bike += stunden;
    else if (a.sport_type === 'swim') eintrag.swim += stunden;
    else eintrag.misc += stunden;

    eintrag.total += stunden;
  }

  // Chronologisch aufsteigend sortieren (älteste Woche links)
  return Array.from(wochenMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, daten]) => ({
      ...daten,
      run: Math.round(daten.run * 10) / 10,
      bike: Math.round(daten.bike * 10) / 10,
      swim: Math.round(daten.swim * 10) / 10,
      misc: Math.round(daten.misc * 10) / 10,
      total: Math.round(daten.total * 10) / 10,
    }));
}

// ── KPI-Daten pro Sportart ─────────────────────────────────────────────────

export interface KpiData {
  run: { distanceKm: number; durationHours: number; sessions: number };
  bike: { distanceKm: number; durationHours: number; sessions: number };
  swim: { distanceM: number; durationHours: number; sessions: number };
  misc: { durationHours: number; sessions: number };
}

export function getKpiData(activities: Activity[], range: TimeRange): KpiData {
  const gefiltert = filterByTimeRange(activities, range);

  const kpi: KpiData = {
    run: { distanceKm: 0, durationHours: 0, sessions: 0 },
    bike: { distanceKm: 0, durationHours: 0, sessions: 0 },
    swim: { distanceM: 0, durationHours: 0, sessions: 0 },
    misc: { durationHours: 0, sessions: 0 },
  };

  for (const a of gefiltert) {
    const h = a.duration / 3600;
    if (a.sport_type === 'run') {
      kpi.run.distanceKm += a.distance / 1000;
      kpi.run.durationHours += h;
      kpi.run.sessions++;
    } else if (a.sport_type === 'bike') {
      kpi.bike.distanceKm += a.distance / 1000;
      kpi.bike.durationHours += h;
      kpi.bike.sessions++;
    } else if (a.sport_type === 'swim') {
      kpi.swim.distanceM += a.distance;
      kpi.swim.durationHours += h;
      kpi.swim.sessions++;
    } else {
      kpi.misc.durationHours += h;
      kpi.misc.sessions++;
    }
  }

  // Werte runden
  kpi.run.distanceKm = Math.round(kpi.run.distanceKm * 10) / 10;
  kpi.run.durationHours = Math.round(kpi.run.durationHours * 10) / 10;
  kpi.bike.distanceKm = Math.round(kpi.bike.distanceKm * 10) / 10;
  kpi.bike.durationHours = Math.round(kpi.bike.durationHours * 10) / 10;
  kpi.swim.distanceM = Math.round(kpi.swim.distanceM);
  kpi.swim.durationHours = Math.round(kpi.swim.durationHours * 10) / 10;
  kpi.misc.durationHours = Math.round(kpi.misc.durationHours * 10) / 10;

  return kpi;
}

// ── Belastungsampel ────────────────────────────────────────────────────────

export interface LoadLightResult {
  status: 'green' | 'yellow' | 'red';
  message: string;
}

export function getLoadLight(activities: Activity[], goals: WeekGoals): LoadLightResult {
  // Wenn keine Ziele gesetzt: grün
  const keineZiele =
    goals.run_km === null &&
    goals.run_sessions === null &&
    goals.bike_km === null &&
    goals.bike_sessions === null &&
    goals.swim_m === null &&
    goals.swim_sessions === null &&
    goals.total_hours === null;

  if (keineZiele) return { status: 'green', message: 'Keine Ziele gesetzt' };

  // Nur aktuelle Woche (Montag bis heute)
  const heute = new Date();
  const wochentag = heute.getDay() || 7; // 1=Mo … 7=So
  const montag = new Date(heute);
  montag.setDate(heute.getDate() - (wochentag - 1));
  montag.setHours(0, 0, 0, 0);

  const dieseWoche = activities.filter((a) => new Date(a.date) >= montag);

  if (dieseWoche.length === 0) {
    return { status: 'red', message: 'Noch keine Aktivität diese Woche' };
  }

  // Anteiliger Wochenfortschritt: wie weit sind wir in der Woche? (1/7 bis 7/7)
  const fortschritt = wochentag / 7;

  // Ziel-Erfüllungsgrade berechnen
  const quoten: number[] = [];

  function quote(ist: number, soll: number | null): void {
    if (soll === null || soll === 0) return;
    quoten.push(ist / (soll * fortschritt));
  }

  const runKm = dieseWoche
    .filter((a) => a.sport_type === 'run')
    .reduce((s, a) => s + a.distance / 1000, 0);
  const runSess = dieseWoche.filter((a) => a.sport_type === 'run').length;
  const bikeKm = dieseWoche
    .filter((a) => a.sport_type === 'bike')
    .reduce((s, a) => s + a.distance / 1000, 0);
  const bikeSess = dieseWoche.filter((a) => a.sport_type === 'bike').length;
  const swimM = dieseWoche
    .filter((a) => a.sport_type === 'swim')
    .reduce((s, a) => s + a.distance, 0);
  const swimSess = dieseWoche.filter((a) => a.sport_type === 'swim').length;
  const totalH = dieseWoche.reduce((s, a) => s + a.duration / 3600, 0);

  quote(runKm, goals.run_km);
  quote(runSess, goals.run_sessions);
  quote(bikeKm, goals.bike_km);
  quote(bikeSess, goals.bike_sessions);
  quote(swimM, goals.swim_m);
  quote(swimSess, goals.swim_sessions);
  quote(totalH, goals.total_hours);

  if (quoten.length === 0) return { status: 'green', message: 'Auf Kurs' };

  const minQuote = Math.min(...quoten);

  if (minQuote >= 0.8) return { status: 'green', message: 'Alles auf Kurs 💪' };
  if (minQuote >= 0.4) return { status: 'yellow', message: 'Etwas hinter dem Ziel' };
  return { status: 'red', message: 'Wenig Training diese Woche' };
}

// ── Hilfsfunktion: KPI-Daten für gewählte Sportart ────────────────────────

export function getKpiForSport(
  kpi: KpiData,
  sport: string
): { distanceKm?: number; distanceM?: number; durationHours: number; sessions: number } | null {
  if (sport === 'run')
    return {
      distanceKm: kpi.run.distanceKm,
      durationHours: kpi.run.durationHours,
      sessions: kpi.run.sessions,
    };
  if (sport === 'bike')
    return {
      distanceKm: kpi.bike.distanceKm,
      durationHours: kpi.bike.durationHours,
      sessions: kpi.bike.sessions,
    };
  if (sport === 'swim')
    return {
      distanceM: kpi.swim.distanceM,
      durationHours: kpi.swim.durationHours,
      sessions: kpi.swim.sessions,
    };
  if (sport === 'misc')
    return { durationHours: kpi.misc.durationHours, sessions: kpi.misc.sessions };
  return null;
}

// Re-Export für bequemen Import in DashboardPage
export { filterByTimeRange, filterBySport };
export type { TimeRange };
