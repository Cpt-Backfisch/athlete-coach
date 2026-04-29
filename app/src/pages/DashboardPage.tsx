import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SegmentedControl } from '@/components/SegmentedControl';
import { KpiCard } from '@/components/KpiCard';
import { EmptyState } from '@/components/EmptyState';
import { KpiCardSkeleton, BarChartSkeleton } from '@/components/charts/ChartSkeleton';
import { LoadLight } from '@/components/LoadLight';
import { VolumeBarChart } from '@/components/VolumeBarChart';
import { CountdownBadge } from '@/components/CountdownBadge';
import { CommentSection } from '@/components/CommentSection';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { WeekCard } from '@/components/charts/WeekCard';
import { WeekGoalCard } from '@/components/WeekGoalCard';
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
import { TRIATHLON_COLOR } from '@/lib/sportColors';
import { SPORT_COLORS } from '@/lib/theme';
import { RunCompetitionChart } from '@/components/charts/RunCompetitionChart';
import { BarChart2, MessageCircle } from 'lucide-react';
import type { TimeRange } from '@/lib/utils/dateFilter';
import type { WeekGoals } from '@/lib/weekFrame';
import type { SportType } from '@/lib/activities';
import type { Race } from '@/lib/events';

// ── Typen ─────────────────────────────────────────────────────────────────
type SportFilter = 'all' | SportType;

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

const SPORT_REIHENFOLGE: SportType[] = ['run', 'bike', 'swim', 'misc'];

// ── DashboardPage ──────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useAuth();
  const { activities, isLoading } = useActivities();
  const navigate = useNavigate();
  const [kpiHasAnimated, setKpiHasAnimated] = useState(false);

  const [timeRange, setTimeRange] = useState<TimeRange>('2026');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [weekGoals, setWeekGoals] = useState<WeekGoals>(EMPTY_WEEK_GOALS);
  const [naechsteRaces, setNaechsteRaces] = useState<Race[]>([]);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);

  useEffect(() => {
    fetchWeekPlan().then((plan) => setWeekGoals(plan.goals));
    fetchUpcomingRaces().then((races) => setNaechsteRaces(races.slice(0, 3)));
    getShareToken().then(setShareToken);
  }, []);

  // Nach erstem Mount mit Daten → Animation deaktivieren (kein Re-Animate bei Filter-Wechsel)
  useEffect(() => {
    if (!kpiHasAnimated && !isLoading && activities.length > 0) {
      const t = setTimeout(() => setKpiHasAnimated(true), 600);
      return () => clearTimeout(t);
    }
  }, [kpiHasAnimated, isLoading, activities.length]);

  // Zeitraum-gefiltert (ohne Sportart) — Basis für KPI-Karten und Volume-Chart
  const gefiltertNachZeit = useMemo(
    () => filterByTimeRange(activities, timeRange),
    [activities, timeRange]
  );

  // Zeitraum + Sportart gefiltert — für SportDistribution und andere Sektionen
  const gefiltert = useMemo(
    () => filterBySport(gefiltertNachZeit, sportFilter),
    [gefiltertNachZeit, sportFilter]
  );

  // Volume-Chart verwendet immer alle Sportarten (Dimming statt Ausblenden)
  const volumeChartResult = useMemo(
    () => getVolumeChartData(gefiltertNachZeit, timeRange),
    [gefiltertNachZeit, timeRange]
  );

  // KPI-Daten per Sportart — immer aus zeit-gefiltertem Datensatz (nicht sport-gefiltert)
  const kpiData = useMemo(
    () => getKpiData(gefiltertNachZeit, timeRange),
    [gefiltertNachZeit, timeRange]
  );

  // Belastungsampel — immer alle Aktivitäten (nicht gefiltert)
  const loadLight = useMemo(() => getLoadLight(activities, weekGoals), [activities, weekGoals]);

  // Zeige alle Sportarten mit Daten im gewählten Zeitraum
  const sichtbareKpiKarten = useMemo(
    () => SPORT_REIHENFOLGE.filter((s) => kpiData[s].sessions > 0),
    [kpiData]
  );

  // Jahresfilter für Monats-Charts
  const jahrFuerCharts = useMemo(() => {
    if (timeRange === '2024') return 2024;
    if (timeRange === '2025') return 2025;
    return 2026;
  }, [timeRange]);

  // F6/F8: Toggle Sportart-Filter (gleicher Klick = deaktivieren)
  function toggleSport(sport: string) {
    setSportFilter((prev) => (prev === sport ? 'all' : (sport as SportType)));
  }

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-4xl">
        <div className="h-6 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-full animate-pulse rounded-md bg-muted" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
        <div className="rounded-[12px] bg-card border border-border px-4 py-4 space-y-3">
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <BarChartSkeleton height={200} />
        </div>
      </div>
    );
  }

  function kpiDistanceKm(sport: SportType): number | undefined {
    if (sport === 'run') return kpiData.run.distanceKm;
    if (sport === 'bike') return kpiData.bike.distanceKm;
    if (sport === 'swim') return Math.round((kpiData.swim.distanceM / 1000) * 10) / 10;
    if (sport === 'misc') return kpiData.misc.distanceKm;
    return undefined;
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Belastungsampel + Kommentare-Button (Desktop) */}
      <div className="flex items-center justify-between gap-3">
        <LoadLight status={loadLight.status} message={loadLight.message} />
        {shareToken && (
          <Sheet open={commentSheetOpen} onOpenChange={setCommentSheetOpen}>
            <SheetTrigger className="hidden md:flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <MessageCircle size={14} />
              <span>Kommentare{commentCount > 0 ? ` (${commentCount})` : ''}</span>
            </SheetTrigger>
            <SheetContent title="Kommentare">
              <CommentSection
                shareToken={shareToken}
                ownerUserId={user?.id ?? ''}
                isOwner={true}
                onCountChange={setCommentCount}
              />
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* F7: Segmented Control — Zeitraum */}
      <SegmentedControl
        options={ZEITRAUM_OPTIONEN}
        value={timeRange}
        onChange={(v) => setTimeRange(v as TimeRange)}
      />

      {/* F6: KPI-Kacheln als Sportart-Filter — zweite Filter-Zeile entfällt */}
      {sichtbareKpiKarten.length === 0 ? (
        activities.length === 0 ? (
          <EmptyState
            icon={BarChart2}
            title="Noch keine Trainingsdaten"
            description="Verbinde Strava und lade deine Aktivitäten, um das Dashboard zu sehen."
            cta={{ label: 'Strava verbinden', onClick: () => navigate('/settings') }}
          />
        ) : (
          <p className="text-muted-foreground text-sm">Keine Aktivitäten im gewählten Zeitraum</p>
        )
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sichtbareKpiKarten.map((sport, i) => (
            <KpiCard
              key={sport}
              sport={sport}
              distanceKm={kpiDistanceKm(sport)}
              durationHours={kpiData[sport].durationHours}
              sessions={kpiData[sport].sessions}
              isActive={sportFilter === sport}
              onClick={() => toggleSport(sport)}
              animate={!kpiHasAnimated}
              animationDelay={i * 60}
            />
          ))}
        </div>
      )}

      {/* F1: Wochenziel-Karte */}
      <WeekGoalCard activities={activities} weekGoals={weekGoals} />

      {/* F8: Trainingsvolumen-Chart — immer gestapelt, Balken-Klick setzt Filter */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Trainingsvolumen
        </h2>
        <VolumeBarChart
          data={volumeChartResult.data}
          sport={sportFilter}
          yearChangeLabels={volumeChartResult.yearChangeLabels}
          yearChangeIndices={volumeChartResult.yearChangeIndices}
          onSportClick={toggleSport}
        />
      </section>

      {/* ── Weitere Charts ────────────────────────────────────────────────── */}

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

      {/* F10: Kumulierte Trainingszeit — mit lokalen Jahr-Filtern (in der Komponente) */}
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
                  ? TRIATHLON_COLOR
                  : (SPORT_COLORS[race.sport_type as keyof typeof SPORT_COLORS]?.dark ?? '#888');
              return (
                <div
                  key={race.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-card border border-l-[4px] border-border"
                  style={{ borderLeftColor: farbe }}
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

      {/* F11: Sebi & Nico gegen die 1.000 km */}
      <section className="rounded-[12px] bg-card border border-border px-4 py-4 space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Sebi & Nico — 1.000 km Lauf-Challenge {new Date().getFullYear()}
        </h2>
        <RunCompetitionChart activities={activities} />
      </section>

      {/* Kommentare: auf Mobile unten, auf Desktop im Sheet (oben) */}
      {shareToken ? (
        <section className="md:hidden">
          <CommentSection
            shareToken={shareToken}
            ownerUserId={user?.id ?? ''}
            isOwner={true}
            onCountChange={setCommentCount}
          />
        </section>
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
