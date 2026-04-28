import { useMemo } from 'react';
import { formatHoursMinutes } from '@/lib/format';
import type { Activity } from '@/lib/activities';
import type { WeekGoals } from '@/lib/weekFrame';

// ── ISO-Wochennummer (Mon = Tag 1, ISO 8601) ──────────────────────────────

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ── Aktivitäten der aktuellen ISO-Woche (Mo–So) ───────────────────────────

function getThisWeek(activities: Activity[]): Activity[] {
  const heute = new Date();
  const wochentag = heute.getDay() || 7;
  const montag = new Date(heute);
  montag.setDate(heute.getDate() - (wochentag - 1));
  montag.setHours(0, 0, 0, 0);
  const sonntag = new Date(montag);
  sonntag.setDate(montag.getDate() + 7);
  return activities.filter((a) => {
    const d = new Date(a.date);
    return d >= montag && d < sonntag;
  });
}

// ── SVG-Fortschrittsring ──────────────────────────────────────────────────

interface ProgressRingProps {
  pct: number;
  size?: number;
  strokeWidth?: number;
}

function ProgressRing({ pct, size = 88, strokeWidth = 8 }: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(pct / 100, 1));
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{ transform: 'rotate(-90deg)' }}
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--muted)" strokeWidth={strokeWidth} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  );
}

// ── Kleiner Fortschrittsbalken pro Sportart ───────────────────────────────

interface SportBarProps {
  label: string;
  istStd: number;
  color: string;
  totalGoalHours: number | null;
}

function SportBar({ label, istStd, color, totalGoalHours }: SportBarProps) {
  const pct =
    totalGoalHours && totalGoalHours > 0 ? Math.min((istStd / totalGoalHours) * 100, 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums text-foreground">{formatHoursMinutes(istStd)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Status-Pill ────────────────────────────────────────────────────────────

type Status = 'unter' | 'im' | 'ueber';

function StatusPill({ status }: { status: Status }) {
  const config: Record<Status, { label: string; className: string }> = {
    unter: {
      label: 'Unter Plan',
      className: 'bg-status-overload/15 text-status-overload border-status-overload/30',
    },
    im: {
      label: 'Im Plan',
      className: 'bg-status-caution/15 text-status-caution border-status-caution/30',
    },
    ueber: {
      label: 'Über Plan',
      className: 'bg-status-fresh/15 text-status-fresh border-status-fresh/30',
    },
  };
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {label}
    </span>
  );
}

// ── WeekGoalCard ───────────────────────────────────────────────────────────

interface WeekGoalCardProps {
  activities: Activity[];
  weekGoals: WeekGoals;
}

const SPORT_FARBEN: Record<string, string> = {
  run: '#8E6FE0',
  bike: '#FF7A1A',
  swim: '#3359C4',
  misc: '#B54A2E',
};

const SPORT_LABELS: Record<string, string> = {
  run: 'Laufen',
  bike: 'Rad',
  swim: 'Schwimmen',
  misc: 'Sonstiges',
};

export function WeekGoalCard({ activities, weekGoals }: WeekGoalCardProps) {
  const heute = new Date();
  const kw = getISOWeek(heute);

  const dieseWoche = useMemo(() => getThisWeek(activities), [activities]);

  const stats = useMemo(() => {
    const stunden = (sport: string) =>
      dieseWoche.filter((a) => a.sport_type === sport).reduce((s, a) => s + a.duration / 3600, 0);
    return {
      run: stunden('run'),
      bike: stunden('bike'),
      swim: stunden('swim'),
      misc: stunden('misc'),
      total: dieseWoche.reduce((s, a) => s + a.duration / 3600, 0),
      sessions: dieseWoche.length,
    };
  }, [dieseWoche]);

  const zielHours = weekGoals.total_hours;

  // Erwarteter Fortschritt heute: (Wochentag / 7) × 100% (Mo=1, So=7)
  const wochentag = heute.getDay() || 7;
  const erwartetPct = Math.round((wochentag / 7) * 100);
  const istPct = zielHours && zielHours > 0 ? Math.round((stats.total / zielHours) * 100) : 0;

  const status: Status = !zielHours
    ? 'im'
    : istPct >= erwartetPct * 1.1
      ? 'ueber'
      : istPct >= erwartetPct * 0.9
        ? 'im'
        : 'unter';

  const hatSportDaten = ['run', 'bike', 'swim', 'misc'].some(
    (s) => stats[s as keyof typeof stats] > 0
  );

  return (
    <div className="rounded-[12px] bg-card border border-border px-4 py-4 space-y-4">
      {/* Titel + Status-Pill */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">
            Diese Woche <span className="text-muted-foreground font-medium">KW{kw}</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
            {stats.sessions} {stats.sessions === 1 ? 'Einheit' : 'Einheiten'}
            {' · '}
            {formatHoursMinutes(stats.total)}
            {zielHours ? ` · Ziel: ${formatHoursMinutes(zielHours)}` : ''}
          </p>
        </div>
        <StatusPill status={status} />
      </div>

      {/* Mittlerer Block: Ring + Kennzahlen */}
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <ProgressRing pct={istPct} />
          <span className="absolute text-sm font-semibold tabular-nums">{istPct}%</span>
        </div>

        <div className="space-y-1.5 text-sm">
          <div>
            <span className="text-muted-foreground text-xs">Ist</span>
            <p className="font-semibold tabular-nums leading-tight">
              {formatHoursMinutes(stats.total)}
            </p>
          </div>
          {zielHours && (
            <div>
              <span className="text-muted-foreground text-xs">Ziel</span>
              <p className="font-medium tabular-nums leading-tight">
                {formatHoursMinutes(zielHours)}
              </p>
            </div>
          )}
          <p className="text-xs text-muted-foreground tabular-nums">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle"
              style={{ backgroundColor: 'var(--muted-foreground)' }}
            />
            erwartet heute: {erwartetPct}%
          </p>
        </div>
      </div>

      {/* Sportart-Balken */}
      {hatSportDaten && (
        <div className="space-y-2.5 pt-1 border-t border-border">
          {(['run', 'bike', 'swim', 'misc'] as const).map((sport) => {
            const std = stats[sport];
            if (std === 0) return null;
            return (
              <SportBar
                key={sport}
                label={SPORT_LABELS[sport]}
                istStd={std}
                color={SPORT_FARBEN[sport]}
                totalGoalHours={zielHours}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
