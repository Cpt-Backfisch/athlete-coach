import { useEffect, useMemo, useState } from 'react';
import { ReadOnlyBanner } from '@/components/ReadOnlyBanner';
import { FilterChips } from '@/components/FilterChips';
import { KpiCard } from '@/components/KpiCard';
import { VolumeBarChart } from '@/components/VolumeBarChart';
import { CountdownBadge } from '@/components/CountdownBadge';
import { CommentSection } from '@/components/CommentSection';
import { useShare } from '@/contexts/ShareContext';
import { fetchActivitiesByUserId } from '@/lib/activities';
import { supabase } from '@/lib/supabase';
import { SPORT_COLORS } from '@/lib/theme';
import {
  getWeeklyVolumeData,
  getKpiData,
  filterByTimeRange,
  filterBySport,
} from '@/lib/utils/dashboardStats';
import type { Activity } from '@/lib/activities';
import type { TimeRange } from '@/lib/utils/dateFilter';
import type { SportType } from '@/lib/activities';

// ── Filter-Optionen ────────────────────────────────────────────────────────

const ZEITRAUM_OPTIONEN = [
  { label: '4W', value: '4W' },
  { label: '12W', value: '12W' },
  { label: '6M', value: '6M' },
  { label: '1J', value: '1J' },
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

// ── Hilfsfunktion: Athletenname des Owners laden ──────────────────────────

async function ladeOwnerName(ownerUserId: string): Promise<string> {
  const { data } = await supabase
    .from('settings')
    .select('data')
    .eq('user_id', ownerUserId)
    .maybeSingle();

  if (!data) return '';
  try {
    const cfg = JSON.parse((data as { data: string }).data);
    return (cfg.athlete_name as string) ?? '';
  } catch {
    return '';
  }
}

// Anstehende Wettkämpfe des Owners laden (RLS Share-Policy)
async function ladeOwnerRaces(ownerUserId: string) {
  const heute = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('races')
    .select('*')
    .eq('user_id', ownerUserId)
    .gte('date', heute)
    .order('date', { ascending: true })
    .limit(3);

  return (data ?? []) as Array<{
    id: string;
    name: string;
    date: string;
    sport_type: string;
    goal?: string | null;
  }>;
}

// ── SharePage ──────────────────────────────────────────────────────────────

export function SharePage() {
  const { isShareMode, shareToken, ownerUserId, isLoading: shareLoading } = useShare();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [ownerName, setOwnerName] = useState('');
  const [races, setRaces] = useState<
    Array<{ id: string; name: string; date: string; sport_type: string; goal?: string | null }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('12W');
  const [sportFilter, setSportFilter] = useState('all');

  useEffect(() => {
    if (shareLoading || !ownerUserId) return;

    Promise.all([
      fetchActivitiesByUserId(ownerUserId),
      ladeOwnerName(ownerUserId),
      ladeOwnerRaces(ownerUserId),
    ]).then(([acts, name, raceList]) => {
      setActivities(acts);
      setOwnerName(name);
      setRaces(raceList);
      setIsLoading(false);
    });
  }, [shareLoading, ownerUserId]);

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

  // ── Gefilterte Aktivitäten + Chart-Daten ─────────────────────────────────

  const gefiltert = useMemo(() => {
    let liste = filterByTimeRange(activities, timeRange);
    liste = filterBySport(liste, sportFilter);
    return liste;
  }, [activities, timeRange, sportFilter]);

  const weeklyVolumeData = useMemo(
    () => getWeeklyVolumeData(gefiltert, timeRange),
    [gefiltert, timeRange]
  );

  const kpiData = useMemo(() => getKpiData(gefiltert, timeRange), [gefiltert, timeRange]);

  const sichtbareKpiKarten = useMemo(() => {
    if (sportFilter !== 'all') return [sportFilter as SportType];
    return SPORT_REIHENFOLGE.filter((s) => kpiData[s].sessions > 0);
  }, [kpiData, sportFilter]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <ReadOnlyBanner ownerName={ownerName} />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Filter */}
        <FilterChips
          options={ZEITRAUM_OPTIONEN}
          value={timeRange}
          onChange={(v) => setTimeRange(v as TimeRange)}
        />
        <FilterChips options={SPORT_OPTIONEN} value={sportFilter} onChange={setSportFilter} />

        {/* KPI-Karten */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Aktivitäten laden…</p>
        ) : sichtbareKpiKarten.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Aktivitäten im gewählten Zeitraum</p>
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
                durationHours={kpiData[sport].durationHours}
                sessions={kpiData[sport].sessions}
              />
            ))}
          </div>
        )}

        {/* Wochenvolumen-Chart */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Trainingsvolumen
          </h2>
          <VolumeBarChart data={weeklyVolumeData} sport={sportFilter} />
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
                    className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-white/5 border border-border"
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

        {/* Kommentare */}
        <CommentSection shareToken={shareToken} isOwner={false} />
      </div>
    </div>
  );
}
