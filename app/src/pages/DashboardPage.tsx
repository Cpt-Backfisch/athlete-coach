import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FilterChips } from '@/components/FilterChips';
import { KpiCard } from '@/components/KpiCard';
import { LoadLight } from '@/components/LoadLight';
import { VolumeBarChart } from '@/components/VolumeBarChart';
import { CountdownBadge } from '@/components/CountdownBadge';
import { CommentSection } from '@/components/CommentSection';
import { WeekCard } from '@/components/charts/WeekCard';
import { VolumeChartHours } from '@/components/charts/VolumeChartHours';
import { VolumeChartKm } from '@/components/charts/VolumeChartKm';
import { SportDistribution } from '@/components/charts/SportDistribution';
import { CumulativeTime } from '@/components/charts/CumulativeTime';
import { useActivities } from '@/hooks/useActivities';
import { fetchWeekPlan, EMPTY_WEEK_GOALS } from '@/lib/weekFrame';
import { fetchUpcomingRaces } from '@/lib/events';
import { getShareToken } from '@/lib/settings';
import {
  getVolumeChartData,
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

// ── Filter-Optionen ────────────────────────────────────────────────────────

const ZEITRAUM_OPTIONEN = [
  { label: 'Alles', value: 'all' },
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '1J', value: '1J' },
  { label: '6M', value: '6M' },
  { label: '12W', value: '12W' },
  { label: '4W', value: '4W' },
  { label: '1W', value: '1W' },
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
  const { user } = useAuth();
  const { activities, isLoading } = useActivities();

  const [timeRange, setTimeRange] = useState<TimeRange>('2026');
  const [sportFilter, setSportFilter] = useState('all');
  const [weekGoals, setWeekGoals] = useState<WeekGoals>(EMPTY_WEEK_GOALS);
  const [naechsteRaces, setNaechsteRaces] = useState<Race[]>([]);
  const [shareToken, setShareToken] = useState<string | null>(null);

  useEffect(() => {
    fetchWeekPlan().then((plan) => setWeekGoals(plan.goals));
    fetchUpcomingRaces().then((races) => setNaechsteRaces(races.slice(0, 3)));
    getShareToken().then(setShareToken);
  }, []);

  const gefiltert = useMemo(() => {
    let liste = filterByTimeRange(activities, timeRange);
    liste = filterBySport(liste, sportFilter);
    return liste;
  }, [activities, timeRange, sportFilter]);

  // Volume-Chart-Daten (dynamisch: Wochen oder Monate je nach Zeitraum)
  const volumeChartResult = useMemo(
    () => getVolumeChartData(gefiltert, timeRange),
    [gefiltert, timeRange]
  );

  // KPI-Daten
  const kpiData = useMemo(() => getKpiData(gefiltert, timeRange), [gefiltert, timeRange]);

  // Belastungsampel — immer alle Aktivitäten (nicht gefiltert)
  const loadLight = useMemo(() => getLoadLight(activities, weekGoals), [activities, weekGoals]);

  // Sichtbare KPI-Karten
  const sichtbareKpiKarten = useMemo(() => {
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

  // Jahresfilter für Monats-Charts
  const jahrFuerCharts = useMemo(() => {
    if (timeRange === '2024') return 2024;
    if (timeRange === '2025') return 2025;
    return 2026;
  }, [timeRange]);

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Dashboard wird geladen…</p>;
  }

  // Distanz-Prop pro Sportart: swim in km (aus distanceM / 1000), misc aus distanceKm
  function kpiDistanceKm(sport: SportType): number | undefined {
    if (sport === 'run') return kpiData.run.distanceKm;
    if (sport === 'bike') return kpiData.bike.distanceKm;
    if (sport === 'swim') return Math.round((kpiData.swim.distanceM / 1000) * 10) / 10;
    if (sport === 'misc') return kpiData.misc.distanceKm;
    return undefined;
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
              distanceKm={kpiDistanceKm(sport)}
              durationHours={kpiData[sport].durationHours}
              sessions={kpiData[sport].sessions}
            />
          ))}
        </div>
      )}

      {/* Zeile 5: Wochenvolumen-Chart */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Trainingsvolumen
        </h2>
        <VolumeBarChart
          data={volumeChartResult.data}
          sport={sportFilter}
          yearChangeLabels={volumeChartResult.yearChangeLabels}
        />
      </section>

      {/* ── Neue Charts ──────────────────────────────────────────────────── */}

      <WeekCard activities={activities} weekGoals={weekGoals} />

      <section className="rounded-[12px] bg-card border border-border px-4 py-4 space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Monatliches Volumen {jahrFuerCharts} — Stunden
        </h2>
        <VolumeChartHours activities={activities} year={jahrFuerCharts} />
      </section>

      <section className="rounded-[12px] bg-card border border-border px-4 py-4 space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Monatliches Volumen {jahrFuerCharts} — Kilometer
        </h2>
        <VolumeChartKm activities={activities} year={jahrFuerCharts} />
      </section>

      <section className="rounded-[12px] bg-card border border-border px-4 py-4 space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Sportverteilung — Gesamt
        </h2>
        <SportDistribution activities={gefiltert} />
      </section>

      <section className="rounded-[12px] bg-card border border-border px-4 py-4 space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Kumulierte Trainingszeit
        </h2>
        <CumulativeTime activities={activities} />
      </section>

      {/* Anstehende Wettkämpfe */}
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
                  className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-card border border-border"
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

      {/* Kommentare */}
      {shareToken ? (
        <CommentSection shareToken={shareToken} ownerUserId={user?.id ?? ''} isOwner={true} />
      ) : (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Kommentare
          </h2>
          <p className="text-sm text-muted-foreground">
            Erstelle einen{' '}
            <Link to="/settings" className="underline underline-offset-2">
              Share-Link in den Einstellungen
            </Link>
            , um Kommentare zu aktivieren.
          </p>
        </section>
      )}
    </div>
  );
}
