import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountdownBadge } from '@/components/CountdownBadge';
import { EventFormModal } from '@/components/EventFormModal';
import { ResultFormModal } from '@/components/ResultFormModal';
import { SPORT_COLORS } from '@/lib/theme';
import { fetchUpcomingRaces, getCombinedHistory, deleteRace, deletePastResult } from '@/lib/events';
import type { Race, PastResult, EventListItem } from '@/lib/events';
import type { EventSportType } from '@/lib/events';

// Farbe für Sportart (Triathlon → Lila wie Run)
function sportFarbe(sport: EventSportType): string {
  if (sport === 'triathlon') return '#8E6FE0';
  return SPORT_COLORS[sport as keyof typeof SPORT_COLORS]?.dark ?? '#888';
}

// Datum auf Deutsch formatieren
function formatDatum(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ── EventsPage ─────────────────────────────────────────────────────────────

export function EventsPage() {
  const [upcomingRaces, setUpcomingRaces] = useState<Race[]>([]);
  const [history, setHistory] = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal-State: Wettkampf anlegen/bearbeiten
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editRace, setEditRace] = useState<Race | undefined>();

  // Modal-State: Ergebnis erfassen/bearbeiten
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [editResult, setEditResult] = useState<PastResult | undefined>();

  // Lösch-Bestätigung
  const [deleteTarget, setDeleteTarget] = useState<
    { kind: 'race'; id: string } | { kind: 'result'; id: string } | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const laden = useCallback(async () => {
    setIsLoading(true);
    try {
      const [upcoming, hist] = await Promise.all([fetchUpcomingRaces(), getCombinedHistory()]);
      setUpcomingRaces(upcoming);
      setHistory(hist);
    } catch (e) {
      toast.error(`Fehler beim Laden: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    laden();
  }, [laden]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.kind === 'race') {
        await deleteRace(deleteTarget.id);
        toast.success('Wettkampf gelöscht');
      } else {
        await deletePastResult(deleteTarget.id);
        toast.success('Ergebnis gelöscht');
      }
      setDeleteTarget(null);
      await laden();
    } catch (e) {
      toast.error(`Fehler beim Löschen: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Wettkämpfe werden geladen…</p>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* ── Abschnitt 1: Anstehende Wettkämpfe ─────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">Nächste Wettkämpfe</h1>
          <Button
            size="sm"
            onClick={() => {
              setEditRace(undefined);
              setEventModalOpen(true);
            }}
          >
            Wettkampf hinzufügen
          </Button>
        </div>

        {upcomingRaces.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine anstehenden Wettkämpfe. Füge deinen nächsten Wettkampf hinzu.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingRaces.map((race) => (
              <RaceCard
                key={race.id}
                race={race}
                onEdit={() => {
                  setEditRace(race);
                  setEventModalOpen(true);
                }}
                onDelete={() => setDeleteTarget({ kind: 'race', id: race.id })}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Abschnitt 2: Verlauf ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Verlauf</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditResult(undefined);
              setResultModalOpen(true);
            }}
          >
            Ergebnis erfassen
          </Button>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine vergangenen Wettkämpfe.</p>
        ) : (
          <div className="space-y-2">
            {history.map((item) =>
              item.kind === 'race' ? (
                <PastRaceRow
                  key={`race-${item.data.id}`}
                  race={item.data}
                  onEdit={() => {
                    setEditRace(item.data);
                    setEventModalOpen(true);
                  }}
                  onDelete={() => setDeleteTarget({ kind: 'race', id: item.data.id })}
                />
              ) : (
                <ResultRow
                  key={`result-${item.data.id}`}
                  result={item.data}
                  onEdit={() => {
                    setEditResult(item.data);
                    setResultModalOpen(true);
                  }}
                  onDelete={() => setDeleteTarget({ kind: 'result', id: item.data.id })}
                />
              )
            )}
          </div>
        )}
      </section>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <EventFormModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        race={editRace}
        onSaved={laden}
      />

      <ResultFormModal
        open={resultModalOpen}
        onOpenChange={setResultModalOpen}
        result={editResult}
        onSaved={laden}
      />

      {/* ── Lösch-Bestätigung ────────────────────────────────────────────── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-[var(--popover)] border border-border rounded-[12px] p-6 max-w-sm w-full mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-medium">
              {deleteTarget.kind === 'race' ? 'Wettkampf löschen?' : 'Ergebnis löschen?'}
            </p>
            <p className="text-sm text-muted-foreground">
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Löschen…' : 'Löschen'}
              </Button>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Teilkomponenten ────────────────────────────────────────────────────────

function RaceCard({
  race,
  onEdit,
  onDelete,
}: {
  race: Race;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const farbe = sportFarbe(race.sport_type);

  return (
    <div className="rounded-[12px] bg-white/5 border border-border px-4 py-4 space-y-2">
      {/* Kopfzeile: Sportpunkt + Name + Countdown */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: farbe }}
          />
          <span className="font-medium truncate">{race.name}</span>
        </div>
        <CountdownBadge date={race.date} />
      </div>

      {/* Datum */}
      <p className="text-sm text-muted-foreground tabular-nums pl-[18px]">
        {formatDatum(race.date)}
        {race.location && <> · {race.location}</>}
      </p>

      {/* Ziel */}
      {race.goal && (
        <p className="text-sm pl-[18px]">
          <span className="text-muted-foreground">Ziel: </span>
          {race.goal}
        </p>
      )}

      {/* Event-URL + Aktionen */}
      <div className="flex items-center justify-between pt-1 pl-[18px]">
        {race.event_url ? (
          <a
            href={race.event_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            Zur Veranstaltung <ExternalLink size={11} />
          </a>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            aria-label="Bearbeiten"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
            aria-label="Löschen"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PastRaceRow({
  race,
  onEdit,
  onDelete,
}: {
  race: Race;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const farbe = sportFarbe(race.sport_type);

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-white/5 border border-border">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: farbe }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{race.name}</span>
          <span className="text-xs bg-white/10 text-muted-foreground px-1.5 py-0.5 rounded-full flex-shrink-0">
            Vergangen
          </span>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatDatum(race.date)}
          {race.location && <> · {race.location}</>}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          aria-label="Bearbeiten"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
          aria-label="Löschen"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function ResultRow({
  result,
  onEdit,
  onDelete,
}: {
  result: PastResult;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const farbe = sportFarbe(result.sport_type);

  const zeitenText = [
    result.goal_time ? `Ziel: ${result.goal_time}` : null,
    result.actual_time ? `Ergebnis: ${result.actual_time}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-white/5 border border-border">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: farbe }} />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{result.name}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatDatum(result.date)}
          {result.location && <> · {result.location}</>}
        </p>
        {zeitenText && (
          <p className="text-xs text-muted-foreground tabular-nums mt-0.5">{zeitenText}</p>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          aria-label="Bearbeiten"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
          aria-label="Löschen"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
