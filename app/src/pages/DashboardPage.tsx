import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilterChips } from '@/components/FilterChips';
import { KpiCard } from '@/components/KpiCard';
import { LoadLight } from '@/components/LoadLight';
import { VolumeBarChart } from '@/components/VolumeBarChart';
import { CountdownBadge } from '@/components/CountdownBadge';
import { useActivities } from '@/hooks/useActivities';
import { fetchWeekPlan, EMPTY_WEEK_GOALS } from '@/lib/weekFrame';
import { fetchUpcomingRaces } from '@/lib/events';
import {
  getWeeklyVolumeData,
  getKpiData,
  getLoadLight,
  filterByTimeRange,
  filterBySport,
} from '@/lib/utils/dashboardStats';
import { SPORT_COLORS } from '@/lib/theme';
import type { TimeRange } from '@/lib/utils/dateFilter';
import type { WeekGoals } from '@/lib/weekFrame';
import type { SportType } from '@/lib/activities';
import type { Race } from '@/lib/events';

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
  const [naechsteRaces, setNaechsteRaces] = useState<Race[]>([]);

  // Wochenziele + anstehende Wettkämpfe laden
  useEffect(() => {
    fetchWeekPlan().then((plan) => setWeekGoals(plan.goals));
    fetchUpcomingRaces().then((races) => setNaechsteRaces(races.slice(0, 3)));
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

      {/* Zeile 6: Anstehende Wettkämpfe */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Nächste Wettkämpfe
          </h2>
          <Link to="/events" className="text-xs text-muted-foreground hover:text-foreground">
            Alle Wettkämpfe →
          </Link>
        </div>

        {naechsteRaces.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine anstehenden Wettkämpfe.{' '}
            <Link to="/events" className="underline underline-offset-2">
              Hinzufügen →
            </Link>
          </p>
        ) : (
          <div className="space-y-2">
            {naechsteRaces.map((race) => {
              const farbe =
                race.sport_type === 'triathlon'
                  ? '#8E6FE0'
                  : (SPORT_COLORS[race.sport_type as keyof typeof SPORT_COLORS]?.dark ?? '#888');
              return (
                <div
                  key={race.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-white/5 border border-border"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: farbe }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{race.name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {new Date(race.date).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <CountdownBadge date={race.date} />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
