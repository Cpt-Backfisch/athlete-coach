import { Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IntensityDots } from './IntensityDots';
import { formatDistance, formatDuration, formatPace } from '@/lib/utils/pace';
import { SPORT_COLORS } from '@/lib/theme';
import type { Activity } from '@/lib/activities';

interface ActivityRowProps {
  activity: Activity;
  onEdit: () => void;
  onDelete: () => void;
}

// Datum als „19. Apr." formatieren
function formatDatum(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

export function ActivityRow({ activity: a, onEdit, onDelete }: ActivityRowProps) {
  const navigate = useNavigate();
  const sportFarbe = SPORT_COLORS[a.sport_type as keyof typeof SPORT_COLORS]?.dark ?? '#888';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/activities/${a.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/activities/${a.id}`)}
      className="grid items-center gap-x-3 px-4 py-3 border-b border-border last:border-0
        hover:bg-muted/50 hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-150
        active:scale-[0.99] cursor-pointer select-none
        grid-cols-[12px_1fr_auto_auto]
        md:grid-cols-[12px_1fr_80px_72px_64px_80px_48px_56px_40px]"
    >
      {/* 1. Sportart-Farbpunkt */}
      <span
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: sportFarbe }}
      />

      {/* 2. Name */}
      <span className="font-medium truncate">{a.name}</span>

      {/* 3. Datum — auf Mobile versteckt */}
      <span className="hidden md:block text-sm text-muted-foreground tabular-nums">
        {formatDatum(a.date)}
      </span>

      {/* 4. Distanz */}
      <span className="text-sm tabular-nums text-right md:text-left">
        {formatDistance(a.distance, a.sport_type)}
      </span>

      {/* 5. Dauer — auf Mobile versteckt */}
      <span className="hidden md:block text-sm tabular-nums">{formatDuration(a.duration)}</span>

      {/* 6. Pace — auf Mobile versteckt */}
      <span className="hidden md:block text-sm tabular-nums text-muted-foreground">
        {formatPace(a.distance, a.duration, a.sport_type)}
      </span>

      {/* 7. Ø HR — auf Mobile versteckt */}
      <span className="hidden md:block text-sm tabular-nums text-muted-foreground">
        {a.avg_hr ? `${a.avg_hr} bpm` : '—'}
      </span>

      {/* 8. Intensitäts-Dots — auf Mobile versteckt */}
      <span className="hidden md:flex items-center">
        {a.intensity ? (
          <IntensityDots intensity={a.intensity} size="sm" />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </span>

      {/* 9. Aktionen */}
      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onEdit}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          title="Bearbeiten"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-muted-foreground hover:text-destructive transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          title="Löschen"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
