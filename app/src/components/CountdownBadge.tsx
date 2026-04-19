import { getDaysUntil } from '@/lib/events';

interface CountdownBadgeProps {
  date: string;
}

export function CountdownBadge({ date }: CountdownBadgeProps) {
  const tage = getDaysUntil(date);

  let hintergrund: string;
  let text: string;

  if (tage === 0) {
    hintergrund = '#EF444422';
    text = 'Heute!';
  } else if (tage < 7) {
    hintergrund = '#EF444422';
    text = `in ${tage} Tagen`;
  } else if (tage <= 30) {
    hintergrund = '#EAB30822';
    text = `in ${tage} Tagen`;
  } else {
    hintergrund = 'rgba(255,255,255,0.08)';
    text = `in ${tage} Tagen`;
  }

  const farbe =
    tage === 0 || tage < 7 ? '#EF4444' : tage <= 30 ? '#EAB308' : 'var(--muted-foreground)';

  return (
    <span
      className="text-xs font-medium tabular-nums px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ backgroundColor: hintergrund, color: farbe }}
    >
      {text}
    </span>
  );
}
