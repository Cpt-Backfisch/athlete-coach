import { cn } from '@/lib/utils';
import { SPORT_COLORS } from '@/lib/theme';
import type { SportType } from '@/lib/activities';

const SPORT_LABELS: Record<SportType, string> = {
  run: 'Laufen',
  bike: 'Rad',
  swim: 'Schwimmen',
  misc: 'Sonstiges',
};

const DE_1 = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

interface KpiCardProps {
  sport: SportType;
  distanceKm?: number;
  durationHours: number;
  sessions: number;
  isActive?: boolean;
  onClick?: () => void;
}

export function KpiCard({
  sport,
  distanceKm,
  durationHours,
  sessions,
  isActive = false,
  onClick,
}: KpiCardProps) {
  const farbe = SPORT_COLORS[sport]?.dark ?? '#888';

  const hasDistance = distanceKm !== undefined && distanceKm > 0;
  const hauptwert = hasDistance ? DE_1.format(distanceKm!) : DE_1.format(durationHours);
  const haupteinheit = hasDistance ? 'km' : 'Std';
  const untertitel = `${DE_1.format(durationHours)} Std · ${sessions} ${sessions === 1 ? 'Einheit' : 'Einheiten'}`;

  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        'rounded-[12px] bg-card px-4 py-4 space-y-2 text-left w-full transition-all duration-150',
        onClick && 'cursor-pointer active:scale-[0.98]',
        isActive ? 'border-2' : 'border border-border'
      )}
      style={isActive ? { borderColor: farbe, backgroundColor: `${farbe}0D` } : {}}
    >
      {/* Sportart-Label */}
      <div className="flex items-center gap-1.5">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: farbe }}
        />
        <span className="text-xs text-muted-foreground font-medium">{SPORT_LABELS[sport]}</span>
      </div>

      {/* Hauptzahl */}
      <p className="text-3xl font-semibold tabular-nums leading-none">
        {hauptwert}
        <span className="text-base font-normal text-muted-foreground ml-1">{haupteinheit}</span>
      </p>

      {/* Dauer + Sessions */}
      <p className="text-xs text-muted-foreground tabular-nums">{untertitel}</p>
    </button>
  );
}
