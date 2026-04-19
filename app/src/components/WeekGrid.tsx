import { DayCell } from './DayCell';
import type { WeekFrame, DayPlan } from '@/lib/weekFrame';

interface WeekGridProps {
  frame: WeekFrame;
  onChange: (frame: WeekFrame) => void;
}

// Wochentage in Reihenfolge Mo–So
const TAGE: { key: keyof WeekFrame; label: string }[] = [
  { key: 'mon', label: 'Mo' },
  { key: 'tue', label: 'Di' },
  { key: 'wed', label: 'Mi' },
  { key: 'thu', label: 'Do' },
  { key: 'fri', label: 'Fr' },
  { key: 'sat', label: 'Sa' },
  { key: 'sun', label: 'So' },
];

export function WeekGrid({ frame, onChange }: WeekGridProps) {
  function handleDayChange(key: keyof WeekFrame, plan: DayPlan) {
    onChange({ ...frame, [key]: plan });
  }

  return (
    // Mobile: 2 Spalten, Desktop: 7 Spalten
    <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
      {TAGE.map(({ key, label }) => (
        <DayCell
          key={key}
          day={label}
          plan={frame[key]}
          onChange={(plan) => handleDayChange(key, plan)}
        />
      ))}
    </div>
  );
}
