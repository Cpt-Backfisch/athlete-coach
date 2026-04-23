import { SPORT_COLORS } from '@/lib/theme';
import type { SportType } from '@/lib/activities';

const SPORT_LABELS: Record<SportType, string> = {
  run: 'Laufen',
  bike: 'Rad',
  swim: 'Schwimmen',
  misc: 'Sonstiges',
};

interface KpiCardProps {
  sport: SportType;
  distanceKm?: number; // Laufen + Rad
  distanceM?: number; // Schwimmen
  durationHours: number;
  sessions: number;
}

export function KpiCard({ sport, distanceKm, distanceM, durationHours, sessions }: KpiCardProps) {
  const farbe = SPORT_COLORS[sport]?.dark ?? '#888';

  // Hauptzahl: Distanz wenn vorhanden, sonst Dauer
  let hauptwert: string;
  let haupteinheit: string;

  if (distanceKm !== undefined) {
    hauptwert = distanceKm.toFixed(1);
    haupteinheit = 'km';
  } else if (distanceM !== undefined) {
    hauptwert = Math.round(distanceM).toLocaleString('de-DE');
    haupteinheit = 'm';
  } else {
    hauptwert = durationHours.toFixed(1);
    haupteinheit = 'h';
  }

  const untertitel = `${durationHours.toFixed(1)} h · ${sessions} ${sessions === 1 ? 'Einheit' : 'Einheiten'}`;

  return (
    <div className="rounded-[12px] bg-card border border-border px-4 py-4 space-y-2">
      {/* Sportart-Label */}
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: farbe }} />
        <span className="text-xs text-muted-foreground font-medium">{SPORT_LABELS[sport]}</span>
      </div>

      {/* Hauptzahl */}
      <p className="text-3xl font-semibold tabular-nums leading-none">
        {hauptwert}
        <span className="text-base font-normal text-muted-foreground ml-1">{haupteinheit}</span>
      </p>

      {/* Dauer + Sessions */}
      <p className="text-xs text-muted-foreground tabular-nums">{untertitel}</p>
    </div>
  );
}
