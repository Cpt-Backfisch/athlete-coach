import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useActivities } from '@/hooks/useActivities';
import { ActivityFormModal } from '@/components/ActivityFormModal';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { FilterChips } from '@/components/FilterChips';
import { ActivityRow } from '@/components/ActivityRow';
import { filterByTimeRange, filterBySport } from '@/lib/utils/dateFilter';
import type { TimeRange } from '@/lib/utils/dateFilter';
import type { Activity } from '@/lib/activities';

// ── Filter-Optionen ────────────────────────────────────────────────────────

const ZEITRAUM_OPTIONEN = [
  { label: 'Alles', value: 'all' },
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '1J', value: '1J' },
  { label: '6M', value: '6M' },
  { label: '12W', value: '12W' },
  { label: '4W', value: '4W' },
  { label: '1W', value: '1W' },
];

const SPORT_OPTIONEN = [
  { label: 'Alle', value: 'all' },
  { label: 'Laufen', value: 'run' },
  { label: 'Rad', value: 'bike' },
  { label: 'Schwimmen', value: 'swim' },
  { label: 'Sonstiges', value: 'misc' },
];

// ── ActivitiesPage ─────────────────────────────────────────────────────────

export function ActivitiesPage() {
  const { activities, isLoading, error, removeActivity } = useActivities();

  const [timeRange, setTimeRange] = useState<TimeRange>('2026');
  const [sportFilter, setSportFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [bearbeitenActivity, setBearbeitenActivity] = useState<Activity | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [zuLoeschen, setZuLoeschen] = useState<Activity | undefined>(undefined);

  // Gefilterte + sortierte Liste — client-seitig berechnet
  const gefiltert = useMemo(() => {
    let liste = filterByTimeRange(activities, timeRange);
    liste = filterBySport(liste, sportFilter);
    // Neueste zuerst (Supabase liefert das bereits, aber sicherheitshalber)
    return [...liste].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activities, timeRange, sportFilter]);

  function oeffneHinzufuegen() {
    setBearbeitenActivity(undefined);
    setModalOpen(true);
  }

  function oeffneBearbeiten(a: Activity) {
    setBearbeitenActivity(a);
    setModalOpen(true);
  }

  function oeffneLoeschen(a: Activity) {
    setZuLoeschen(a);
    setDeleteOpen(true);
  }

  function handleSaved() {
    setBearbeitenActivity(undefined);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Kopfzeile */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Einheiten</h1>
        <button
          onClick={oeffneHinzufuegen}
          className="flex items-center gap-1.5 rounded-lg bg-[#8E6FE0] px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Einheit hinzufügen</span>
          <span className="sm:hidden">Hinzufügen</span>
        </button>
      </div>

      {/* Filter */}
      <FilterChips
        options={ZEITRAUM_OPTIONEN}
        value={timeRange}
        onChange={(v) => setTimeRange(v as TimeRange)}
      />
      <FilterChips options={SPORT_OPTIONEN} value={sportFilter} onChange={setSportFilter} />

      {/* Ladezustand */}
      {isLoading && <p className="text-muted-foreground text-sm">Einheiten werden geladen…</p>}

      {/* Fehler */}
      {error && <p className="text-destructive text-sm">{error}</p>}

      {/* Inhalt */}
      {!isLoading && !error && (
        <>
          {/* Anzahl */}
          <p className="text-sm text-muted-foreground tabular-nums">
            {gefiltert.length} {gefiltert.length === 1 ? 'Einheit' : 'Einheiten'}
          </p>

          {/* Leerzustand: gar keine Aktivitäten vorhanden */}
          {activities.length === 0 && (
            <p className="text-muted-foreground text-sm mt-4">
              Noch keine Einheiten. Importiere deine Aktivitäten oder füge eine manuell hinzu.
            </p>
          )}

          {/* Leerzustand: Filter liefert keine Treffer */}
          {activities.length > 0 && gefiltert.length === 0 && (
            <p className="text-muted-foreground text-sm mt-4">
              Keine Einheiten im gewählten Zeitraum.
            </p>
          )}

          {/* Aktivitätsliste */}
          {gefiltert.length > 0 && (
            <div className="rounded-[12px] border border-border overflow-hidden">
              {/* Spaltenheader — nur Desktop */}
              <div
                className="hidden md:grid items-center gap-x-3 px-4 py-2 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground
                md:grid-cols-[12px_1fr_80px_72px_64px_80px_48px_56px_40px]"
              >
                <span />
                <span>Name</span>
                <span>Datum</span>
                <span>Distanz</span>
                <span>Dauer</span>
                <span>Pace</span>
                <span>Ø HR</span>
                <span>Intensität</span>
                <span />
              </div>

              {gefiltert.map((a) => (
                <ActivityRow
                  key={a.id}
                  activity={a}
                  onEdit={() => oeffneBearbeiten(a)}
                  onDelete={() => oeffneLoeschen(a)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal: Hinzufügen / Bearbeiten */}
      <ActivityFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        activity={bearbeitenActivity}
        onSaved={handleSaved}
      />

      {/* Dialog: Löschen bestätigen */}
      {zuLoeschen && (
        <DeleteConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          activityName={zuLoeschen.name}
          onConfirm={() => removeActivity(zuLoeschen.id)}
        />
      )}
    </div>
  );
}
