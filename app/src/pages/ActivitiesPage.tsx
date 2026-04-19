import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useActivities } from '@/hooks/useActivities';
import { ActivityFormModal } from '@/components/ActivityFormModal';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { IntensityDots } from '@/components/IntensityDots';
import { formatDistance, formatDuration, formatPace } from '@/lib/utils/pace';
import { SPORT_COLORS } from '@/lib/theme';
import type { Activity } from '@/lib/activities';

// Sportart-Label auf Deutsch
const SPORT_LABELS: Record<string, string> = {
  run: 'Laufen',
  bike: 'Rad',
  swim: 'Schwimmen',
  misc: 'Sonstiges',
};

// Dark-Mode-Farbe für den Sportart-Farbpunkt
function sportFarbe(sport: string): string {
  return SPORT_COLORS[sport as keyof typeof SPORT_COLORS]?.dark ?? '#888';
}

// Datum aus ISO-String leserlich darstellen
function formatDatum(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function ActivitiesPage() {
  const { activities, isLoading, error, removeActivity } = useActivities();

  const [modalOpen, setModalOpen] = useState(false);
  const [bearbeitenActivity, setBearbeitenActivity] = useState<Activity | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [zuLoeschen, setZuLoeschen] = useState<Activity | undefined>(undefined);

  // Nachladen nach Speichern — useActivities lädt automatisch neu, wenn Modal schließt
  function handleSaved() {
    setBearbeitenActivity(undefined);
  }

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

  if (isLoading) {
    return <p className="text-muted-foreground text-sm mt-8">Einheiten werden geladen…</p>;
  }

  if (error) {
    return <p className="text-destructive text-sm mt-8">{error}</p>;
  }

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
          Einheit hinzufügen
        </button>
      </div>

      {/* Leerzustand */}
      {activities.length === 0 && (
        <p className="text-muted-foreground text-sm mt-8">
          Noch keine Einheiten. Importiere deine Aktivitäten oder füge eine manuell hinzu.
        </p>
      )}

      {/* Tabelle */}
      {activities.length > 0 && (
        <div className="overflow-x-auto rounded-[12px] border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium w-6" />
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Datum</th>
                <th className="px-4 py-3 font-medium tabular-nums">Distanz</th>
                <th className="px-4 py-3 font-medium tabular-nums">Dauer</th>
                <th className="px-4 py-3 font-medium tabular-nums">Pace</th>
                <th className="px-4 py-3 font-medium">Intensität</th>
                <th className="px-4 py-3 font-medium w-16" />
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  {/* Sportart-Farbpunkt */}
                  <td className="px-4 py-3">
                    <span
                      className="block w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: sportFarbe(a.sport_type) }}
                      title={SPORT_LABELS[a.sport_type] ?? a.sport_type}
                    />
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">{a.name}</td>

                  {/* Datum */}
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {formatDatum(a.date)}
                  </td>

                  {/* Distanz */}
                  <td className="px-4 py-3 tabular-nums">
                    {formatDistance(a.distance, a.sport_type)}
                  </td>

                  {/* Dauer */}
                  <td className="px-4 py-3 tabular-nums">{formatDuration(a.duration)}</td>

                  {/* Pace */}
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {formatPace(a.distance, a.duration, a.sport_type)}
                  </td>

                  {/* Intensität */}
                  <td className="px-4 py-3">
                    {a.intensity ? (
                      <IntensityDots intensity={a.intensity} size="sm" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Aktionen */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => oeffneBearbeiten(a)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Bearbeiten"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => oeffneLoeschen(a)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Löschen"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
