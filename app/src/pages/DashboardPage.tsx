import { useEffect, useMemo, useState } from 'react';
import { FilterChips } from '@/components/FilterChips';
import { KpiCard } from '@/components/KpiCard';
import { LoadLight } from '@/components/LoadLight';
import { VolumeBarChart } from '@/components/VolumeBarChart';
import { useActivities } from '@/hooks/useActivities';
import { fetchWeekPlan, EMPTY_WEEK_GOALS } from '@/lib/weekFrame';
import {
  getWeeklyVolumeData,
  getKpiData,
  getLoadLight,
  filterByTimeRange,
  filterBySport,
} from '@/lib/utils/dashboardStats';
import type { TimeRange } from '@/lib/utils/dateFilter';
import type { WeekGoals } from '@/lib/weekFrame';
import type { SportType } from '@/lib/activities';

// ── Filter-Optionen (Dashboard hat zusätzlich 1W) ─────────────────────────

const ZEITRAUM_OPTIONEN = [
  { label: '1W', value: '1W' },
  { label: '4W', value: '4W' },
  { label: '12W', value: '12W' },
  { label: '6M', value: '6M' },
  { label: '1J', value: '1J' },
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: 'Alles', value: 'all' },
];

const SPORT_OPTIONEN = [
  { label: 'Alle', value: 'all' },
  { label: 'Laufen', value: 'run' },
  { label: 'Rad', value: 'bike' },
  { label: 'Schwimmen', value: 'swim' },
  { label: 'Sonstiges', value: 'misc' },
];

const SPORT_REIHENFOLGE: SportType[] = ['run', 'bike', 'swim', 'misc'];

// ── DashboardPage ──────────────────────────────────────────────────────────

export function DashboardPage() {
  const { activities, isLoading } = useActivities();

  const [timeRange, setTimeRange] = useState<TimeRange>('12W');
  const [sportFilter, setSportFilter] = useState('all');
  const [weekGoals, setWeekGoals] = useState<WeekGoals>(EMPTY_WEEK_GOALS);

  // Wochenziele laden (für Belastungsampel)
  useEffect(() => {
    fetchWeekPlan().then((plan) => setWeekGoals(plan.goals));
  }, []);

  // Gefilterte Aktivitäten
  const gefiltert = useMemo(() => {
    let liste = filterByTimeRange(activities, timeRange);
    liste = filterBySport(liste, sportFilter);
    return liste;
  }, [activities, timeRange, sportFilter]);

  // Chart-Daten
  const weeklyVolumeData = useMemo(
    () => getWeeklyVolumeData(gefiltert, timeRange),
    [gefiltert, timeRange]
  );

  // KPI-Daten
  const kpiData = useMemo(() => getKpiData(gefiltert, timeRange), [gefiltert, timeRange]);

  // Belastungsampel — immer alle Aktivitäten (nicht gefilterte), laufende Woche
  const loadLight = useMemo(() => getLoadLight(activities, weekGoals), [activities, weekGoals]);

  // KPI-Karten: nur Sportarten mit mindestens 1 Session
  const sichtbareKpiKarten = useMemo(() => {
    // Wenn Sportart-Filter aktiv: nur diese Sportart anzeigen
    const sportarten =
      sportFilter !== 'all'
        ? [sportFilter as SportType]
        : SPORT_REIHENFOLGE.filter((s) => {
            if (s === 'run') return kpiData.run.sessions > 0;
            if (s === 'bike') return kpiData.bike.sessions > 0;
            if (s === 'swim') return kpiData.swim.sessions > 0;
            if (s === 'misc') return kpiData.misc.sessions > 0;
            return false;
          });
    return sportarten;
  }, [kpiData, sportFilter]);

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Dashboard wird geladen…</p>;
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Zeile 1: Titel + Belastungsampel */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <LoadLight status={loadLight.status} message={loadLight.message} />
      </div>

      {/* Zeile 2 + 3: Filter */}
      <FilterChips
        options={ZEITRAUM_OPTIONEN}
        value={timeRange}
        onChange={(v) => setTimeRange(v as TimeRange)}
      />
      <FilterChips options={SPORT_OPTIONEN} value={sportFilter} onChange={setSportFilter} />

      {/* Zeile 4: KPI-Karten */}
      {sichtbareKpiKarten.length === 0 ? (
        <p className="text-muted-foreground text-sm">Keine Aktivitäten im gewählten Zeitraum</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sichtbareKpiKarten.map((sport) => (
            <KpiCard
              key={sport}
              sport={sport}
              distanceKm={
                sport === 'run'
                  ? kpiData.run.distanceKm
                  : sport === 'bike'
                    ? kpiData.bike.distanceKm
                    : undefined
              }
              distanceM={sport === 'swim' ? kpiData.swim.distanceM : undefined}
              durationHours={
                sport === 'run'
                  ? kpiData.run.durationHours
                  : sport === 'bike'
                    ? kpiData.bike.durationHours
                    : sport === 'swim'
                      ? kpiData.swim.durationHours
                      : kpiData.misc.durationHours
              }
              sessions={
                sport === 'run'
                  ? kpiData.run.sessions
                  : sport === 'bike'
                    ? kpiData.bike.sessions
                    : sport === 'swim'
                      ? kpiData.swim.sessions
                      : kpiData.misc.sessions
              }
            />
          ))}
        </div>
      )}

      {/* Zeile 5: Wochenvolumen-Chart */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Trainingsvolumen
        </h2>
        <VolumeBarChart data={weeklyVolumeData} sport={sportFilter} />
      </section>

      {/* Zeile 6: Anstehende Events (Platzhalter) */}
      <section className="space-y-2">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Nächste Wettkämpfe
        </h2>
        <p className="text-sm text-muted-foreground">Wettkämpfe werden in Schritt 9 eingebunden.</p>
      </section>
    </div>
  );
}
