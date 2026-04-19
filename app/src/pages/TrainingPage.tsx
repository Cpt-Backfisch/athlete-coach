import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { WeekGrid } from '@/components/WeekGrid';
import { GoalInputs } from '@/components/GoalInputs';
import { fetchWeekPlan, saveWeekPlan, EMPTY_WEEK_FRAME, EMPTY_WEEK_GOALS } from '@/lib/weekFrame';
import type { WeekPlan, WeekFrame, WeekGoals } from '@/lib/weekFrame';

export function TrainingPage() {
  const [plan, setPlan] = useState<WeekPlan>({
    frame: EMPTY_WEEK_FRAME,
    goals: EMPTY_WEEK_GOALS,
  });
  const [laedt, setLaedt] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Ref für den Debounce-Timer
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Beim Mount: Plan laden
  useEffect(() => {
    fetchWeekPlan().then((geladen) => {
      setPlan(geladen);
      setLaedt(false);
    });
  }, []);

  // Auto-Save: 1500ms nach letzter Änderung speichern
  useEffect(() => {
    if (!isDirty) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      speichern(plan);
    }, 1500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // plan und isDirty als Dependencies — bewusst vollständig
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, isDirty]);

  async function speichern(aktuell: WeekPlan) {
    setIsSaving(true);
    try {
      await saveWeekPlan(aktuell);
      setIsDirty(false);
    } catch (e) {
      toast.error(`Fehler beim Speichern: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsSaving(false);
    }
  }

  function handleFrameChange(frame: WeekFrame) {
    setPlan((prev) => ({ ...prev, frame }));
    setIsDirty(true);
  }

  function handleGoalsChange(goals: WeekGoals) {
    setPlan((prev) => ({ ...prev, goals }));
    setIsDirty(true);
  }

  if (laedt) {
    return <p className="text-muted-foreground text-sm">Trainingsplan wird geladen…</p>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Kopfzeile */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Trainingsplan</h1>
          {/* Unsaved-Changes-Indikator */}
          {isDirty && (
            <span className="flex items-center gap-1.5 text-xs text-amber-500">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Nicht gespeichert
            </span>
          )}
        </div>
        <button
          onClick={() => speichern(plan)}
          disabled={isSaving || !isDirty}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40"
        >
          {isSaving ? 'Speichern…' : 'Speichern'}
        </button>
      </div>

      {/* Wochenrahmen */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Wochenrahmen
        </h2>
        <WeekGrid frame={plan.frame} onChange={handleFrameChange} />
      </section>

      {/* Wochenziele */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Wochenziele
        </h2>
        <GoalInputs goals={plan.goals} onChange={handleGoalsChange} />
      </section>
    </div>
  );
}
