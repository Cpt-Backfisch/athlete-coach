import { useEffect, useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ReadOnlyBanner } from '@/components/ReadOnlyBanner';
import { FilterChips } from '@/components/FilterChips';
import { KpiCard } from '@/components/KpiCard';
import { VolumeBarChart } from '@/components/VolumeBarChart';
import { CountdownBadge } from '@/components/CountdownBadge';
import { CommentSection } from '@/components/CommentSection';
import { WeekGoalCard } from '@/components/WeekGoalCard';
import { VolumeChartHours } from '@/components/charts/VolumeChartHours';
import { VolumeChartKm } from '@/components/charts/VolumeChartKm';
import { CumulativeTime } from '@/components/charts/CumulativeTime';
import { SportDistribution } from '@/components/charts/SportDistribution';
import { useShare } from '@/contexts/ShareContext';
import { fetchActivitiesByUserId } from '@/lib/activities';
import { fetchUpcomingRacesByUser } from '@/lib/events';
import { blobLoadOneByUser } from '@/lib/jsonBlobStore';
import { SPORT_COLORS } from '@/lib/theme';
import {
  getVolumeChartData,
  getKpiData,
  filterByTimeRange,
  filterBySport,
} from '@/lib/utils/dashboardStats';
import type { Activity } from '@/lib/activities';
import type { TimeRange } from '@/lib/utils/dateFilter';
import type { SportType } from '@/lib/activities';
import type { WeekGoals, WeekPlan } from '@/lib/weekFrame';
import { EMPTY_WEEK_GOALS } from '@/lib/weekFrame';

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
];

const SPORT_OPTIONEN = [
  { label: 'Alle', value: 'all' },
  { label: 'Laufen', value: 'run' },
  { label: 'Rad', value: 'bike' },
  { label: 'Schwimmen', value: 'swim' },
  { label: 'Sonstiges', value: 'misc' },
];

const SPORT_REIHENFOLGE: SportType[] = ['run', 'bike', 'swim', 'misc'];

// ── Hilfsfunktion: Athletenname des Owners laden ──────────────────────────

async function ladeOwnerName(ownerUserId: string): Promise<string> {
  const { data } = await import('@/lib/supabase').then((m) =>
    m.supabase.from('settings').select('data').eq('user_id', ownerUserId).maybeSingle()
  );
  if (!data) return '';
  try {
    const cfg = JSON.parse((data as { data: string }).data);
    return (cfg.athlete_name as string) ?? '';
  } catch {
    return '';
  }
}

// ── SharePage ──────────────────────────────────────────────────────────────

export function SharePage() {
  const { isShareMode, shareToken, ownerUserId, isLoading: shareLoading } = useShare();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [weekGoals, setWeekGoals] = useState<WeekGoals>(EMPTY_WEEK_GOALS);
  const [ownerName, setOwnerName] = useState('');
  const [races, setRaces] = useState<
    Array<{ id: string; name: string; date: string; sport_type: string; goal?: string | null }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('2026');
  const [sportFilter, setSportFilter] = useState('all');
  const [commentCount, setCommentCount] = useState(0);
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);

  useEffect(() => {
    if (shareLoading || !ownerUserId) return;

    Promise.all([
      fetchActivitiesByUserId(ownerUserId),
      ladeOwnerName(ownerUserId),
      fetchUpcomingRacesByUser(ownerUserId),
      blobLoadOneByUser<WeekPlan>('week_frame', ownerUserId),
    ]).then(([acts, name, raceList, weekPlan]) => {
      setActivities(acts);
      setOwnerName(name);
      setRaces(raceList);
      setWeekGoals(weekPlan?.goals ?? EMPTY_WEEK_GOALS);
      setIsLoading(false);
    });
  }, [shareLoading, ownerUserId]);

  // ── Gefilterte Aktivitäten + Chart-Daten ──────────────────────────────────

  const gefiltertNachZeit = useMemo(
    () => filterByTimeRange(activities, timeRange),
    [activities, timeRange]
  );

  const gefiltert = useMemo(
    () => filterBySport(gefiltertNachZeit, sportFilter),
    [gefiltertNachZeit, sportFilter]
  );

  const volumeChartResult = useMemo(
    () => getVolumeChartData(gefiltert, timeRange),
    [gefiltert, timeRange]
  );

  const kpiData = useMemo(
    () => getKpiData(gefiltertNachZeit, timeRange),
    [gefiltertNachZeit, timeRange]
  );

  const sichtbareKpiKarten = useMemo(() => {
    if (sportFilter !== 'all') return [sportFilter as SportType];
    return SPORT_REIHENFOLGE.filter((s) => kpiData[s].sessions > 0);
  }, [kpiData, sportFilter]);

  const jahrFuerCharts = useMemo(() => {
    if (timeRange === '2024') return 2024;
    if (timeRange === '2025') return 2025;
    return 2026;
  }, [timeRange]);

  // ── Ungültiger Link ──────────────────────────────────────────────────────

  if (shareLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Lädt…
      </div>
    );
  }

  if (!isShareMode || !ownerUserId || !shareToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div className="space-y-2">
          <p className="font-medium">Ungültiger Link</p>
          <p className="text-sm text-muted-foreground">
            Dieser Link ist ungültig oder wurde widerrufen.
          </p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <ReadOnlyBanner ownerName={ownerName} />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Filter + Kommentare-Button (Desktop) */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 space-y-3">
            <FilterChips
              options={ZEITRAUM_OPTIONEN}
              value={timeRange}
              onChange={(v) => setTimeRange(v as TimeRange)}
            />
            <FilterChips options={SPORT_OPTIONEN} value={sportFilter} onChange={setSportFilter} />
          </div>
          <Sheet open={commentSheetOpen} onOpenChange={setCommentSheetOpen}>
            <SheetTrigger className="hidden md:flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0 mt-0.5">
              <MessageCircle size={14} />
              <span>Kommentare{commentCount > 0 ? ` (${commentCount})` : ''}</span>
            </SheetTrigger>
            <SheetContent title="Kommentare">
              <CommentSection
                shareToken={shareToken}
                ownerUserId={ownerUserId}
                isOwner={false}
                onCountChange={setCommentCount}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* KPI-Karten — read-only, kein Filter-Klick */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Aktivitäten laden…</p>
        ) : sichtbareKpiKarten.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Aktivitäten im gewählten Zeitraum</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sichtbareKpiKarten.map((sport) => {
              let distKm: number | undefined;
              if (sport === 'run') distKm = kpiData.run.distanceKm;
              else if (sport === 'bike') distKm = kpiData.bike.distanceKm;
              else if (sport === 'swim')
                distKm = Math.round((kpiData.swim.distanceM / 1000) * 10) / 10;
              else if (sport === 'misc') distKm = kpiData.misc.distanceKm;
              return (
                <KpiCard
                  key={sport}
                  sport={sport}
                  distanceKm={distKm}
                  durationHours={kpiData[sport].durationHours}
                  sessions={kpiData[sport].sessions}
                />
              );
            })}
          </div>
        )}

        {/* Wochenziel-Karte */}
        {!isLoading && <WeekGoalCard activities={activities} weekGoals={weekGoals} />}

        {/* Trainingsvolumen-Chart */}
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

        {/* Monatliches Volumen — Stunden */}
        <section className="rounded-[12px] bg-card border border-border px-4 py-4 space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Monatliches Volumen {jahrFuerCharts} — Stunden
          </h2>
          <VolumeChartHours activities={activities} year={jahrFuerCharts} />
        </section>

        {/* Monatliches Volumen — Kilometer */}
        <section className="rounded-[12px] bg-card border border-border px-4 py-4 space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Monatliches Volumen {jahrFuerCharts} — Kilometer
          </h2>
          <VolumeChartKm activities={activities} year={jahrFuerCharts} />
        </section>

        {/* Sportverteilung */}
        <section className="rounded-[12px] bg-card border border-border px-4 py-4 space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Sportverteilung — Gesamt
          </h2>
          <SportDistribution activities={gefiltert} />
        </section>

        {/* Kumulierte Trainingszeit */}
        <section className="rounded-[12px] bg-card border border-border px-4 py-4 space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Kumulierte Trainingszeit
          </h2>
          <CumulativeTime activities={activities} />
        </section>

        {/* Anstehende Wettkämpfe */}
        {races.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Nächste Wettkämpfe
            </h2>
            <div className="space-y-2">
              {races.map((race) => {
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
                      <p className="text-xs text-muted-foreground">
                        {new Date(race.date).toLocaleDateString('de-DE', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                        {race.goal && <> · Ziel: {race.goal}</>}
                      </p>
                    </div>
                    <CountdownBadge date={race.date} />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Kommentare: Mobile unten, Desktop im Sheet */}
        <section className="md:hidden">
          <CommentSection
            shareToken={shareToken}
            ownerUserId={ownerUserId}
            isOwner={false}
            onCountChange={setCommentCount}
          />
        </section>
      </div>
    </div>
  );
}
