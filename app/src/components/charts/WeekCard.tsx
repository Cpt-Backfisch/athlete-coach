import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getWeekStats } from '@/lib/utils/dashboardStats';
import type { Activity } from '@/lib/activities';
import type { WeekGoals } from '@/lib/weekFrame';

const FARBEN = {
  run: '#8E6FE0',
  bike: '#FF7A1A',
  swim: '#3359C4',
  misc: '#B54A2E',
};

interface WeekCardProps {
  activities: Activity[];
  weekGoals: WeekGoals;
}

interface ProgressBarProps {
  label: string;
  ist: number;
  soll: number | null;
  unit: string;
  color: string;
}

function ProgressBar({ label, ist, soll, unit, color }: ProgressBarProps) {
  const pct = soll ? Math.min((ist / soll) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">
          {ist}
          {soll ? ` / ${soll}` : ''} {unit}
        </span>
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

export function WeekCard({ activities, weekGoals }: WeekCardProps) {
  const stats = useMemo(() => getWeekStats(activities), [activities]);

  const pieData = useMemo(() => {
    const run = stats.runKm > 0 ? 1 : 0;
    const bike = stats.bikeKm > 0 ? 1 : 0;
    const swim = stats.swimM > 0 ? 1 : 0;

    // Tatsächliche Stunden für den Donut-Chart aus gefilterten Aktivitäten
    const heute = new Date();
    const wochentag = heute.getDay() || 7;
    const montag = new Date(heute);
    montag.setDate(heute.getDate() - (wochentag - 1));
    montag.setHours(0, 0, 0, 0);
    const dieseWoche = activities.filter((a) => new Date(a.date) >= montag);

    const runH = dieseWoche
      .filter((a) => a.sport_type === 'run')
      .reduce((s, a) => s + a.duration / 3600, 0);
    const bikeH = dieseWoche
      .filter((a) => a.sport_type === 'bike')
      .reduce((s, a) => s + a.duration / 3600, 0);
    const swimH = dieseWoche
      .filter((a) => a.sport_type === 'swim')
      .reduce((s, a) => s + a.duration / 3600, 0);
    const miscH = dieseWoche
      .filter((a) => a.sport_type === 'misc')
      .reduce((s, a) => s + a.duration / 3600, 0);

    const result = [];
    if (runH > 0) result.push({ name: 'Laufen', value: runH, color: FARBEN.run });
    if (bikeH > 0) result.push({ name: 'Rad', value: bikeH, color: FARBEN.bike });
    if (swimH > 0) result.push({ name: 'Schwimmen', value: swimH, color: FARBEN.swim });
    if (miscH > 0) result.push({ name: 'Sonstiges', value: miscH, color: FARBEN.misc });

    // Fallback: leerer Donut
    if (result.length === 0) result.push({ name: '', value: 1, color: 'var(--muted)' });

    return { data: result, hasData: run + bike + swim > 0 };
  }, [activities]);

  const hatZiele =
    weekGoals.run_km !== null ||
    weekGoals.bike_km !== null ||
    weekGoals.swim_m !== null ||
    weekGoals.total_hours !== null;

  return (
    <div className="rounded-[12px] bg-card border border-border px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Diese Woche
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {stats.sessions} {stats.sessions === 1 ? 'Einheit' : 'Einheiten'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="w-20 h-20 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData.data}
                cx="50%"
                cy="50%"
                innerRadius={22}
                outerRadius={36}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gesamt-Stunden */}
        <div>
          <p className="text-2xl font-semibold tabular-nums leading-none">
            {stats.totalHours.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Stunden gesamt</p>
        </div>
      </div>

      {/* Fortschrittsbalken */}
      {hatZiele && (
        <div className="space-y-2.5 pt-1">
          {weekGoals.run_km !== null && (
            <ProgressBar
              label="Laufen"
              ist={stats.runKm}
              soll={weekGoals.run_km}
              unit="km"
              color={FARBEN.run}
            />
          )}
          {weekGoals.bike_km !== null && (
            <ProgressBar
              label="Rad"
              ist={stats.bikeKm}
              soll={weekGoals.bike_km}
              unit="km"
              color={FARBEN.bike}
            />
          )}
          {weekGoals.swim_m !== null && (
            <ProgressBar
              label="Schwimmen"
              ist={stats.swimM}
              soll={weekGoals.swim_m}
              unit="m"
              color={FARBEN.swim}
            />
          )}
          {weekGoals.total_hours !== null && (
            <ProgressBar
              label="Gesamt"
              ist={stats.totalHours}
              soll={weekGoals.total_hours}
              unit="Std"
              color="#888"
            />
          )}
        </div>
      )}
    </div>
  );
}
