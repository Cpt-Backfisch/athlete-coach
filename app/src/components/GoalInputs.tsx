import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { WeekGoals } from '@/lib/weekFrame';

interface GoalInputsProps {
  goals: WeekGoals;
  onChange: (goals: WeekGoals) => void;
}

// Hilfsfunktion: number | null → Eingabewert-String
function toInput(val: number | null): string {
  return val !== null ? String(val) : '';
}

// Hilfsfunktion: Eingabe-String → number | null
function fromInput(val: string): number | null {
  const n = parseFloat(val);
  return isNaN(n) || n < 0 ? null : n;
}

export function GoalInputs({ goals, onChange }: GoalInputsProps) {
  function update(key: keyof WeekGoals, raw: string) {
    onChange({ ...goals, [key]: fromInput(raw) });
  }

  return (
    // 2 Spalten Mobile, 4 Spalten Desktop
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Laufen */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Laufen km/Wo</Label>
        <Input
          type="number"
          min="0"
          step="any"
          className="tabular-nums"
          placeholder="—"
          value={toInput(goals.run_km)}
          onChange={(e) => update('run_km', e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Laufen Einheiten/Wo</Label>
        <Input
          type="number"
          min="0"
          step="1"
          className="tabular-nums"
          placeholder="—"
          value={toInput(goals.run_sessions)}
          onChange={(e) => update('run_sessions', e.target.value)}
        />
      </div>

      {/* Rad */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Rad km/Wo</Label>
        <Input
          type="number"
          min="0"
          step="any"
          className="tabular-nums"
          placeholder="—"
          value={toInput(goals.bike_km)}
          onChange={(e) => update('bike_km', e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Rad Einheiten/Wo</Label>
        <Input
          type="number"
          min="0"
          step="1"
          className="tabular-nums"
          placeholder="—"
          value={toInput(goals.bike_sessions)}
          onChange={(e) => update('bike_sessions', e.target.value)}
        />
      </div>

      {/* Schwimmen */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Schwimmen m/Wo</Label>
        <Input
          type="number"
          min="0"
          step="any"
          className="tabular-nums"
          placeholder="—"
          value={toInput(goals.swim_m)}
          onChange={(e) => update('swim_m', e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Schwimmen Einheiten/Wo</Label>
        <Input
          type="number"
          min="0"
          step="1"
          className="tabular-nums"
          placeholder="—"
          value={toInput(goals.swim_sessions)}
          onChange={(e) => update('swim_sessions', e.target.value)}
        />
      </div>

      {/* Gesamt */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Gesamt Stunden/Wo</Label>
        <Input
          type="number"
          min="0"
          step="any"
          className="tabular-nums"
          placeholder="—"
          value={toInput(goals.total_hours)}
          onChange={(e) => update('total_hours', e.target.value)}
        />
      </div>
    </div>
  );
}
