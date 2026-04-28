import { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Plus, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getSetting, setSetting } from '@/lib/settings';
import type { Activity } from '@/lib/activities';

// ── Typen ──────────────────────────────────────────────────────────────────

interface NicoEntry {
  date: string; // YYYY-MM-DD
  km: number; // kumulierter Gesamtstand
}

interface NicoData {
  entries: NicoEntry[];
}

// ── Konstanten ─────────────────────────────────────────────────────────────

const SEBI_COLOR = '#8E6FE0';
const NICO_COLOR = '#E04F4F';
const GOAL_COLOR = '#6A6A70';
const GOAL_KM = 1000;

const MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

// ── Chart-Daten berechnen ──────────────────────────────────────────────────

interface ChartPoint {
  label: string;
  monat: number;
  sebi: number | null;
  nico: number | null;
  ziel: number;
}

function buildChartData(activities: Activity[], nicoEntries: NicoEntry[]): ChartPoint[] {
  const year = new Date().getFullYear();
  const heute = new Date();
  heute.setHours(23, 59, 59, 999);

  const runActivities = activities.filter(
    (a) => a.sport_type === 'run' && new Date(a.date).getFullYear() === year
  );

  const sortedNico = [...nicoEntries].sort((a, b) => a.date.localeCompare(b.date));

  return MONATE.map((label, idx) => {
    const monatEndDatum = new Date(year, idx + 1, 0, 23, 59, 59);

    // Sebi: nur bis heute anzeigen
    const sebi =
      monatEndDatum <= heute
        ? runActivities
            .filter((a) => new Date(a.date) <= monatEndDatum)
            .reduce((sum, a) => sum + a.distance / 1000, 0)
        : null;

    // Nico: letzter kumulierter Stand bis Monatsende
    const nicoEntriesToDate = sortedNico.filter(
      (e) => e.date <= monatEndDatum.toISOString().slice(0, 10)
    );
    const nico =
      nicoEntriesToDate.length > 0 ? nicoEntriesToDate[nicoEntriesToDate.length - 1].km : null;

    // Ziel: linear 0 → 1000 km über das Jahr
    const ziel = Math.round(((idx + 1) / 12) * GOAL_KM);

    return { label, monat: idx, sebi, nico, ziel };
  });
}

// ── Import-Modal ───────────────────────────────────────────────────────────

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  entries: NicoEntry[];
  onSave: (entries: NicoEntry[]) => Promise<void>;
}

function ImportModal({ open, onClose, entries, onSave }: ImportModalProps) {
  const [datum, setDatum] = useState('');
  const [km, setKm] = useState('');
  const [laden, setLaden] = useState(false);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => a.date.localeCompare(b.date)),
    [entries]
  );

  const letzterStand = sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1].km : 0;

  async function handleAdd() {
    if (!datum || !km) return;

    const kmNum = Number(km);
    const heute = new Date().toISOString().slice(0, 10);

    if (datum > heute) {
      toast.error('Datum darf nicht in der Zukunft liegen');
      return;
    }

    // Finde letzten Stand vor diesem Datum
    const vorher = sortedEntries.filter((e) => e.date <= datum);
    const letzterVorStand = vorher.length > 0 ? vorher[vorher.length - 1].km : 0;

    if (kmNum <= letzterVorStand && sortedEntries.length > 0) {
      toast.error(`Gesamtstand muss > ${letzterVorStand} km sein (kumuliert)`);
      return;
    }

    setLaden(true);
    try {
      const newEntry: NicoEntry = { date: datum, km: kmNum };
      const newEntries = [...entries.filter((e) => e.date !== datum), newEntry].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      await onSave(newEntries);
      setDatum('');
      setKm('');
      toast.success('Eintrag gespeichert');
    } catch {
      toast.error('Speichern fehlgeschlagen');
    } finally {
      setLaden(false);
    }
  }

  async function handleDelete(date: string) {
    setLaden(true);
    try {
      await onSave(entries.filter((e) => e.date !== date));
      toast.success('Eintrag gelöscht');
    } catch {
      toast.error('Löschen fehlgeschlagen');
    } finally {
      setLaden(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nico-Daten einpflegen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-xs text-muted-foreground">
            Aktueller Gesamtstand Nico:{' '}
            <span className="font-semibold tabular-nums">{letzterStand} km</span>
          </p>

          {/* Neuen Eintrag hinzufügen */}
          <div className="space-y-3 rounded-[10px] bg-muted/40 p-3">
            <div className="space-y-1.5">
              <Label htmlFor="nc-datum">Datum</Label>
              <Input
                id="nc-datum"
                type="date"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nc-km">Gesamtstand (km, kumuliert)</Label>
              <Input
                id="nc-km"
                type="number"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                placeholder="z.B. 87"
                min={0}
                step={0.1}
              />
            </div>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!datum || !km || laden}
              className="flex items-center gap-1.5"
            >
              <Plus size={14} />
              Hinzufügen
            </Button>
          </div>

          {/* Bestehende Einträge */}
          {sortedEntries.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Einträge</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {sortedEntries.map((e) => (
                  <div
                    key={e.date}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-[8px] bg-muted/40 text-sm"
                  >
                    <span className="text-muted-foreground tabular-nums">
                      {new Date(e.date + 'T12:00:00').toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                    <span className="font-semibold tabular-nums">{e.km} km</span>
                    <button
                      onClick={() => handleDelete(e.date)}
                      disabled={laden}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Eintrag ${e.date} löschen`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── RunCompetitionChart ────────────────────────────────────────────────────

interface RunCompetitionChartProps {
  activities: Activity[];
}

export function RunCompetitionChart({ activities }: RunCompetitionChartProps) {
  const [nicoData, setNicoData] = useState<NicoData>({ entries: [] });
  const [importOffen, setImportOffen] = useState(false);

  useEffect(() => {
    getSetting('nicoCompetition').then((raw) => {
      if (raw) {
        try {
          setNicoData(JSON.parse(raw) as NicoData);
        } catch {
          /* Fallback */
        }
      }
    });
  }, []);

  async function saveNicoEntries(entries: NicoEntry[]) {
    const next = { entries };
    setNicoData(next);
    await setSetting('nicoCompetition', JSON.stringify(next));
  }

  const chartData = useMemo(
    () => buildChartData(activities, nicoData.entries),
    [activities, nicoData.entries]
  );

  const maxY = useMemo(() => {
    const sebiMax = Math.max(...chartData.map((d) => d.sebi ?? 0));
    const nicoMax = Math.max(...chartData.map((d) => d.nico ?? 0));
    return Math.max(1100, Math.ceil((Math.max(sebiMax, nicoMax) * 1.1) / 100) * 100);
  }, [chartData]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {/* Legende */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <LegendDot color={SEBI_COLOR} label="Sebi" />
          <LegendDot color={NICO_COLOR} label="Nico" />
          <LegendDot color={GOAL_COLOR} label="1.000 km Ziel" dashed />
        </div>
        <button
          onClick={() => setImportOffen(true)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Nico-Daten importieren"
        >
          <Download size={12} />
          Import
        </button>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, maxY]}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={<RunChartTooltip />} />
          {/* Ziel-Linie */}
          <Line
            type="linear"
            dataKey="ziel"
            name="Ziel"
            stroke={GOAL_COLOR}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
          />
          {/* Nico */}
          <Line
            type="monotone"
            dataKey="nico"
            name="Nico"
            stroke={NICO_COLOR}
            strokeWidth={2}
            dot={(props) => {
              if (props.value == null) return <g key={props.key} />;
              return (
                <circle
                  key={props.key}
                  cx={props.cx}
                  cy={props.cy}
                  r={4}
                  fill={NICO_COLOR}
                  stroke="var(--card)"
                  strokeWidth={2}
                />
              );
            }}
            connectNulls={false}
          />
          {/* Sebi */}
          <Line
            type="monotone"
            dataKey="sebi"
            name="Sebi"
            stroke={SEBI_COLOR}
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <ImportModal
        open={importOffen}
        onClose={() => setImportOffen(false)}
        entries={nicoData.entries}
        onSave={saveNicoEntries}
      />
    </div>
  );
}

// Tooltip als eigenständige Komponente — Recharts akzeptiert JSX-Element als content-Prop
function RunChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[8px] bg-card border border-border px-3 py-2 text-xs space-y-1 shadow-lg">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold tabular-nums">{Math.round(entry.value)} km</span>
        </div>
      ))}
    </div>
  );
}

function LegendDot({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {dashed ? (
        <svg width="16" height="4" viewBox="0 0 16 4">
          <line
            x1="0"
            y1="2"
            x2="16"
            y2="2"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        </svg>
      ) : (
        <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: color }} />
      )}
      <span>{label}</span>
    </div>
  );
}
