import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { MetaCard } from '@/components/MetaCard';
import { StreamChart } from '@/components/StreamChart';
import { IntensityDots } from '@/components/IntensityDots';
import { ActivityFormModal } from '@/components/ActivityFormModal';
import { fetchActivityById } from '@/lib/activities';
import { getStreams } from '@/lib/streams';
import { formatDistance, formatDuration, formatPace } from '@/lib/utils/pace';
import { getIntensityLabel } from '@/lib/utils/intensity';
import { SPORT_COLORS } from '@/lib/theme';
import type { Activity } from '@/lib/activities';
import type { StreamPoint } from '@/lib/streams';

// ── Sportart-Labels ────────────────────────────────────────────────────────

const SPORT_LABELS: Record<string, string> = {
  run: 'Laufen',
  bike: 'Rad',
  swim: 'Schwimmen',
  misc: 'Sonstiges',
};

// ── Pace-Formatierung für velocity (m/s) je nach Sportart ─────────────────

function velocityFormatter(sport: string): (v: number) => string {
  if (sport === 'run' || sport === 'misc') {
    // m/s → min/km
    return (v) => {
      if (!v || v <= 0) return '—';
      const sekundenProKm = 1000 / v;
      const min = Math.floor(sekundenProKm / 60);
      const sec = Math.round(sekundenProKm % 60);
      return `${min}:${String(sec).padStart(2, '0')}`;
    };
  }
  if (sport === 'bike') {
    // m/s → km/h
    return (v) => (v * 3.6).toFixed(1);
  }
  if (sport === 'swim') {
    // m/s → min/100m
    return (v) => {
      if (!v || v <= 0) return '—';
      const sekundenPro100m = 100 / v;
      const min = Math.floor(sekundenPro100m / 60);
      const sec = Math.round(sekundenPro100m % 60);
      return `${min}:${String(sec).padStart(2, '0')}`;
    };
  }
  return (v) => v.toFixed(1);
}

function velocityUnit(sport: string): string {
  if (sport === 'run' || sport === 'misc') return '/km';
  if (sport === 'bike') return 'km/h';
  if (sport === 'swim') return '/100m';
  return 'm/s';
}

// ── Datum formatieren ──────────────────────────────────────────────────────

function formatDatum(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ── ActivityDetailPage ─────────────────────────────────────────────────────

export function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [streams, setStreams] = useState<StreamPoint[] | null>(null);
  const [streamsLaden, setStreamsLaden] = useState(false);
  const [laedt, setLaedt] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line react-hooks/immutability
    ladeAktivitaet(id);
  }, [id]);

  async function ladeAktivitaet(activityId: string) {
    setLaedt(true);
    const a = await fetchActivityById(activityId);
    setActivity(a);
    setLaedt(false);

    // Streams parallel laden — blockiert nicht die Grundanzeige
    if (a) {
      setStreamsLaden(true);
      const s = await getStreams(activityId, a.strava_id ?? null);
      setStreams(s);
      setStreamsLaden(false);
    }
  }

  function handleSaved() {
    if (id) ladeAktivitaet(id);
  }

  // ── Render: Ladezustand ───────────────────────────────────────────────────

  if (laedt) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground text-sm">
        Laden…
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/activities')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Zurück
        </button>
        <p className="text-muted-foreground text-sm">Einheit nicht gefunden.</p>
      </div>
    );
  }

  const sportFarbe = SPORT_COLORS[activity.sport_type as keyof typeof SPORT_COLORS]?.dark ?? '#888';
  const formatVelocity = velocityFormatter(activity.sport_type);
  const velUnit = velocityUnit(activity.sport_type);

  // ── Render: Detailansicht ─────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Zurück + Bearbeiten */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Zurück
        </button>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil size={14} /> Bearbeiten
        </button>
      </div>

      {/* Header: Sportart-Farbpunkt + Name + Datum */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: sportFarbe }}
          />
          <span
            className="text-xs font-medium px-2 py-0.5"
            style={{
              borderRadius: '999px',
              backgroundColor: `${sportFarbe}22`,
              color: sportFarbe,
            }}
          >
            {SPORT_LABELS[activity.sport_type] ?? activity.sport_type}
          </span>
        </div>
        <h1 className="text-2xl font-semibold leading-tight">{activity.name}</h1>
        <p className="text-sm text-muted-foreground">{formatDatum(activity.date)}</p>
      </div>

      {/* Metadaten-Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetaCard label="Distanz" value={formatDistance(activity.distance, activity.sport_type)} />
        <MetaCard label="Dauer" value={formatDuration(activity.duration)} />
        <MetaCard
          label="Pace"
          value={formatPace(activity.distance, activity.duration, activity.sport_type)}
        />
        {activity.avg_hr != null && (
          <MetaCard label="Ø Herzfrequenz" value={String(activity.avg_hr)} unit="bpm" />
        )}
        {activity.elevation != null && (
          <MetaCard label="Höhenmeter" value={String(activity.elevation)} unit="m" />
        )}
        {activity.intensity != null && (
          <div className="rounded-[12px] bg-card border border-border px-4 py-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Intensität
            </p>
            <div className="flex items-center gap-2 pt-1">
              <IntensityDots intensity={activity.intensity} size="md" />
              <span className="text-sm text-muted-foreground">
                {getIntensityLabel(activity.intensity)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Notizen */}
      {activity.notes && (
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Notizen
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{activity.notes}</p>
        </div>
      )}

      {/* Strava-Stream-Charts */}
      {streamsLaden && (
        <p className="text-sm text-muted-foreground animate-pulse">Lade Strava-Daten…</p>
      )}

      {streams && streams.length > 0 && (
        <div className="space-y-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Strava-Daten
          </h2>

          {/* Herzfrequenz-Chart */}
          <StreamChart
            data={streams}
            dataKey="heartrate"
            label="Herzfrequenz"
            color="#EF4444"
            unit="bpm"
          />

          {/* Pace / Velocity-Chart */}
          <StreamChart
            data={streams}
            dataKey="velocity"
            label="Pace"
            color={sportFarbe}
            formatY={formatVelocity}
            unit={velUnit}
          />
        </div>
      )}

      {/* Bearbeiten-Modal */}
      <ActivityFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        activity={activity}
        onSaved={handleSaved}
      />
    </div>
  );
}
