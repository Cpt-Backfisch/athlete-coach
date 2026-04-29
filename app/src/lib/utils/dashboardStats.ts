import { filterByTimeRange, filterBySport, getTimeRangeStart } from './dateFilter';
import type { TimeRange } from './dateFilter';
import type { Activity } from '../activities';
import type { WeekGoals } from '../weekFrame';

// ── Chart-Typ ──────────────────────────────────────────────────────────────

export interface VolumeBarData {
  label: string; // z.B. „KW 15" oder „Jan" oder „Jan 25"
  run: number; // Stunden
  bike: number;
  swim: number;
  misc: number;
  total: number;
  _year?: number; // intern für Jahrestrenner-Erkennung
}

// Rückwärts-kompatibler Alias
export type WeekBarData = VolumeBarData;

export interface VolumeChartResult {
  data: VolumeBarData[];
  yearChangeLabels: string[]; // Labels, wo ein Jahreswechsel beginnt
  yearChangeIndices: number[]; // 0-basierte Indizes der ersten Einträge eines neuen Jahres
}

// ── Kalenderwochen-Hilfsfunktionen ─────────────────────────────────────────

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

function montagVon(date: Date): Date {
  const d = new Date(date);
  const dow = d.getDay() || 7;
  d.setDate(d.getDate() - (dow - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

// ── Wöchentliche Aggregation ───────────────────────────────────────────────

function wochendatenBerechnen(activities: Activity[], range: TimeRange): VolumeChartResult {
  const gefiltert = filterByTimeRange(activities, range);
  const wochenMap = new Map<string, VolumeBarData>();

  for (const a of gefiltert) {
    const datum = new Date(a.date);
    const key = wochenKey(datum);
    const kw = getISOWeek(datum);
    const year = datum.getFullYear();

    if (!wochenMap.has(key)) {
      wochenMap.set(key, {
        label: `KW ${kw}`,
        run: 0,
        bike: 0,
        swim: 0,
        misc: 0,
        total: 0,
        _year: year,
      });
    }

    const eintrag = wochenMap.get(key)!;
    const stunden = a.duration / 3600;

    if (a.sport_type === 'run') eintrag.run += stunden;
    else if (a.sport_type === 'bike') eintrag.bike += stunden;
    else if (a.sport_type === 'swim') eintrag.swim += stunden;
    else eintrag.misc += stunden;

    eintrag.total += stunden;
  }

  // Wochen ohne Daten im Zeitraum mit 0 auffüllen (B4)
  const start = getTimeRangeStart(range);
  if (start) {
    const montag = montagVon(start);
    const heute = new Date();
    const current = new Date(montag);
    while (current <= heute) {
      const key = wochenKey(current);
      const kw = getISOWeek(current);
      const year = current.getFullYear();
      if (!wochenMap.has(key)) {
        wochenMap.set(key, {
          label: `KW ${kw}`,
          run: 0,
          bike: 0,
          swim: 0,
          misc: 0,
          total: 0,
          _year: year,
        });
      }
      current.setDate(current.getDate() + 7);
    }
  }

  const sortiert = Array.from(wochenMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, d]) => ({
      ...d,
      run: Math.round(d.run * 10) / 10,
      bike: Math.round(d.bike * 10) / 10,
      swim: Math.round(d.swim * 10) / 10,
      misc: Math.round(d.misc * 10) / 10,
      total: Math.round(d.total * 10) / 10,
    }));

  // Jahreswechsel-Labels und -Indizes ermitteln
  const yearChangeLabels: string[] = [];
  const yearChangeIndices: number[] = [];
  for (let i = 1; i < sortiert.length; i++) {
    if ((sortiert[i]._year ?? 0) > (sortiert[i - 1]._year ?? 0)) {
      yearChangeLabels.push(sortiert[i].label);
      yearChangeIndices.push(i);
    }
  }

  return { data: sortiert, yearChangeLabels, yearChangeIndices };
}

// ── Monatliche Aggregation ─────────────────────────────────────────────────

const MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

function monatsdatenBerechnen(activities: Activity[], range: TimeRange): VolumeChartResult {
  const gefiltert = filterByTimeRange(activities, range);
  const brauchJahrLabel = range === 'all' || range === '1J';

  type MonatEntry = VolumeBarData & { _month: number };
  const monthMap = new Map<string, MonatEntry>();

  for (const a of gefiltert) {
    const d = new Date(a.date);
    const year = d.getFullYear();
    const month = d.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    const label = brauchJahrLabel ? `${MONATE[month]} ${String(year).slice(2)}` : MONATE[month];

    if (!monthMap.has(key)) {
      monthMap.set(key, {
        label,
        run: 0,
        bike: 0,
        swim: 0,
        misc: 0,
        total: 0,
        _year: year,
        _month: month,
      });
    }

    const eintrag = monthMap.get(key)!;
    const stunden = a.duration / 3600;

    if (a.sport_type === 'run') eintrag.run += stunden;
    else if (a.sport_type === 'bike') eintrag.bike += stunden;
    else if (a.sport_type === 'swim') eintrag.swim += stunden;
    else eintrag.misc += stunden;

    eintrag.total += stunden;
  }

  const sortiert = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, d]) => ({
      label: d.label,
      run: Math.round(d.run * 10) / 10,
      bike: Math.round(d.bike * 10) / 10,
      swim: Math.round(d.swim * 10) / 10,
      misc: Math.round(d.misc * 10) / 10,
      total: Math.round(d.total * 10) / 10,
      _year: d._year,
    }));

  // Jahreswechsel-Labels und -Indizes ermitteln
  const sortedEntries = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  const yearChangeLabels: string[] = [];
  const yearChangeIndices: number[] = [];
  for (let i = 1; i < sortedEntries.length; i++) {
    const prevYear = sortedEntries[i - 1][1]._year ?? 0;
    const currYear = sortedEntries[i][1]._year ?? 0;
    if (currYear > prevYear) {
      yearChangeLabels.push(sortedEntries[i][1].label);
      yearChangeIndices.push(i);
    }
  }

  return { data: sortiert, yearChangeLabels, yearChangeIndices };
}

// ── Öffentliche Funktion: Volume-Chart-Daten ───────────────────────────────

const MONATLICHE_RANGES: TimeRange[] = ['1J', '2024', '2025', '2026', 'all'];

export function getVolumeChartData(activities: Activity[], range: TimeRange): VolumeChartResult {
  if (MONATLICHE_RANGES.includes(range)) {
    return monatsdatenBerechnen(activities, range);
  }
  return wochendatenBerechnen(activities, range);
}

// Rückwärts-kompatibler Alias (gibt jetzt nur data zurück)
export function getWeeklyVolumeData(activities: Activity[], range: TimeRange): VolumeBarData[] {
  return getVolumeChartData(activities, range).data;
}

// ── KPI-Daten pro Sportart ─────────────────────────────────────────────────

export interface KpiData {
  run: { distanceKm: number; durationHours: number; sessions: number };
  bike: { distanceKm: number; durationHours: number; sessions: number };
  swim: { distanceM: number; durationHours: number; sessions: number };
  misc: { distanceKm: number; durationHours: number; sessions: number };
}

export function getKpiData(activities: Activity[], range: TimeRange): KpiData {
  const gefiltert = filterByTimeRange(activities, range);

  const kpi: KpiData = {
    run: { distanceKm: 0, durationHours: 0, sessions: 0 },
    bike: { distanceKm: 0, durationHours: 0, sessions: 0 },
    swim: { distanceM: 0, durationHours: 0, sessions: 0 },
    misc: { distanceKm: 0, durationHours: 0, sessions: 0 },
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
      kpi.misc.distanceKm += a.distance / 1000;
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
  kpi.misc.distanceKm = Math.round(kpi.misc.distanceKm * 10) / 10;
  kpi.misc.durationHours = Math.round(kpi.misc.durationHours * 10) / 10;

  return kpi;
}

// ── Belastungsampel ────────────────────────────────────────────────────────

export interface LoadLightResult {
  status: 'green' | 'yellow' | 'red';
  message: string;
}

export function getLoadLight(activities: Activity[], goals: WeekGoals): LoadLightResult {
  const keineZiele =
    goals.run_km === null &&
    goals.run_sessions === null &&
    goals.bike_km === null &&
    goals.bike_sessions === null &&
    goals.swim_m === null &&
    goals.swim_sessions === null &&
    goals.total_hours === null;

  if (keineZiele) return { status: 'green', message: 'Keine Ziele gesetzt' };

  const heute = new Date();
  const wochentag = heute.getDay() || 7;
  const montag = new Date(heute);
  montag.setDate(heute.getDate() - (wochentag - 1));
  montag.setHours(0, 0, 0, 0);

  const dieseWoche = activities.filter((a) => new Date(a.date) >= montag);

  if (dieseWoche.length === 0) {
    return { status: 'red', message: 'Noch keine Aktivität diese Woche' };
  }

  const fortschritt = wochentag / 7;
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
    return {
      distanceKm: kpi.misc.distanceKm,
      durationHours: kpi.misc.durationHours,
      sessions: kpi.misc.sessions,
    };
  return null;
}

// ── Monatliche Chart-Daten (für VolumeChartHours / VolumeChartKm) ──────────

export interface MonthBarData {
  month: string;
  run: number;
  bike: number;
  swim: number;
  misc: number;
}

export function getMonthlyVolumeHours(activities: Activity[], year: number): MonthBarData[] {
  const result: MonthBarData[] = MONATE.map((month) => ({
    month,
    run: 0,
    bike: 0,
    swim: 0,
    misc: 0,
  }));

  for (const a of activities) {
    const d = new Date(a.date);
    if (d.getFullYear() !== year) continue;
    const m = d.getMonth();
    const h = a.duration / 3600;
    if (a.sport_type === 'run') result[m].run += h;
    else if (a.sport_type === 'bike') result[m].bike += h;
    else if (a.sport_type === 'swim') result[m].swim += h;
    else result[m].misc += h;
  }

  return result.map((d) => ({
    ...d,
    run: Math.round(d.run * 10) / 10,
    bike: Math.round(d.bike * 10) / 10,
    swim: Math.round(d.swim * 10) / 10,
    misc: Math.round(d.misc * 10) / 10,
  }));
}

export function getMonthlyVolumeKm(activities: Activity[], year: number): MonthBarData[] {
  const result: MonthBarData[] = MONATE.map((month) => ({
    month,
    run: 0,
    bike: 0,
    swim: 0,
    misc: 0,
  }));

  for (const a of activities) {
    const d = new Date(a.date);
    if (d.getFullYear() !== year) continue;
    const m = d.getMonth();
    const km = a.distance / 1000;
    if (a.sport_type === 'run') result[m].run += km;
    else if (a.sport_type === 'bike') result[m].bike += km;
    else if (a.sport_type === 'swim') result[m].swim += km;
    // misc hat keine sinnvolle Distanz
  }

  return result.map((d) => ({
    ...d,
    run: Math.round(d.run * 10) / 10,
    bike: Math.round(d.bike * 10) / 10,
    swim: Math.round(d.swim * 10) / 10,
    misc: 0,
  }));
}

// ── Sportverteilung (alle Zeiten) ──────────────────────────────────────────

export interface SportDistributionData {
  name: string;
  sport: string;
  hours: number;
  color: string;
}

export function getSportDistribution(activities: Activity[]): SportDistributionData[] {
  const totals = { run: 0, bike: 0, swim: 0, misc: 0 };
  for (const a of activities) {
    const h = a.duration / 3600;
    if (a.sport_type === 'run') totals.run += h;
    else if (a.sport_type === 'bike') totals.bike += h;
    else if (a.sport_type === 'swim') totals.swim += h;
    else totals.misc += h;
  }

  return [
    { name: 'Laufen', sport: 'run', hours: Math.round(totals.run * 10) / 10, color: '#8E6FE0' },
    { name: 'Rad', sport: 'bike', hours: Math.round(totals.bike * 10) / 10, color: '#FF7A1A' },
    {
      name: 'Schwimmen',
      sport: 'swim',
      hours: Math.round(totals.swim * 10) / 10,
      color: '#3359C4',
    },
    {
      name: 'Sonstiges',
      sport: 'misc',
      hours: Math.round(totals.misc * 10) / 10,
      color: '#B54A2E',
    },
  ].filter((d) => d.hours > 0);
}

// ── Kumulierte Trainingszeit pro Jahr ──────────────────────────────────────

export interface CumulativePoint {
  label: string;
  dayOfYear: number;
  [year: string]: number | string | undefined;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function doyToMonthLabel(doy: number): string {
  const bounds = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  for (let i = bounds.length - 1; i >= 0; i--) {
    if (doy >= bounds[i]) return MONATE[i];
  }
  return '';
}

export function getCumulativeTime(activities: Activity[]): CumulativePoint[] {
  const years = [2024, 2025, 2026];
  const today = new Date();
  const thisYear = today.getFullYear();
  const todayDoy = getDayOfYear(today);

  const byYear: Record<number, Activity[]> = {};
  for (const y of years) {
    byYear[y] = activities
      .filter((a) => new Date(a.date).getFullYear() === y)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  const monthStarts = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
  const allDays = new Set<number>(monthStarts);

  for (const y of years) {
    for (const a of byYear[y]) {
      allDays.add(getDayOfYear(new Date(a.date)));
    }
  }

  const sortedDays = Array.from(allDays).sort((a, b) => a - b);
  const cumulative: Record<number, number> = { 2024: 0, 2025: 0, 2026: 0 };
  const pointers: Record<number, number> = { 2024: 0, 2025: 0, 2026: 0 };
  const data: CumulativePoint[] = [];

  for (const doy of sortedDays) {
    for (const y of years) {
      while (
        pointers[y] < byYear[y].length &&
        getDayOfYear(new Date(byYear[y][pointers[y]].date)) <= doy
      ) {
        cumulative[y] += byYear[y][pointers[y]].duration / 3600;
        pointers[y]++;
      }
    }

    const point: CumulativePoint = {
      label: doyToMonthLabel(doy),
      dayOfYear: doy,
      2024: Math.round(cumulative[2024] * 10) / 10,
      2025: Math.round(cumulative[2025] * 10) / 10,
    };

    if (thisYear > 2026 || doy <= todayDoy) {
      point[2026] = Math.round(cumulative[2026] * 10) / 10;
    }

    data.push(point);
  }

  return data;
}

// ── Wochenstatistik für WeekCard ──────────────────────────────────────────

export interface WeekStats {
  runKm: number;
  bikeKm: number;
  swimM: number;
  totalHours: number;
  sessions: number;
}

export function getWeekStats(activities: Activity[]): WeekStats {
  const heute = new Date();
  const wochentag = heute.getDay() || 7;
  const montag = new Date(heute);
  montag.setDate(heute.getDate() - (wochentag - 1));
  montag.setHours(0, 0, 0, 0);

  const dieseWoche = activities.filter((a) => new Date(a.date) >= montag);

  return {
    runKm:
      Math.round(
        dieseWoche
          .filter((a) => a.sport_type === 'run')
          .reduce((s, a) => s + a.distance / 1000, 0) * 10
      ) / 10,
    bikeKm:
      Math.round(
        dieseWoche
          .filter((a) => a.sport_type === 'bike')
          .reduce((s, a) => s + a.distance / 1000, 0) * 10
      ) / 10,
    swimM: Math.round(
      dieseWoche.filter((a) => a.sport_type === 'swim').reduce((s, a) => s + a.distance, 0)
    ),
    totalHours: Math.round(dieseWoche.reduce((s, a) => s + a.duration / 3600, 0) * 10) / 10,
    sessions: dieseWoche.length,
  };
}

// ── Re-Export ──────────────────────────────────────────────────────────────
export { filterByTimeRange, filterBySport };
export type { TimeRange };
