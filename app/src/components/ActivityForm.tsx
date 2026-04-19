import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { INTENSITY_LABELS } from '@/lib/utils/intensity';
import type { ActivityInput, SportType } from '@/lib/activities';

// ── Hilfsfunktionen für Dauer-Parsing ─────────────────────────────────────

// Parst „h:mm:ss" oder „mm:ss" → Sekunden
function parseDuration(input: string): number {
  const teile = input.trim().split(':').map(Number);
  if (teile.some(isNaN)) return 0;
  if (teile.length === 3) return teile[0] * 3600 + teile[1] * 60 + teile[2];
  if (teile.length === 2) return teile[0] * 60 + teile[1];
  return 0;
}

// Sekunden → „h:mm:ss" oder „mm:ss" für Vorausfüllung
function formatDurationInput(seconds: number): string {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Meter → km-Wert als String für Vorausfüllung (Lauf/Rad)
function meterToKmInput(meters: number, sport: SportType): string {
  if (!meters) return '';
  if (sport === 'swim') return String(meters);
  return (meters / 1000).toFixed(2).replace(/\.?0+$/, '');
}

// ── Props ──────────────────────────────────────────────────────────────────

interface ActivityFormProps {
  initialData?: Partial<ActivityInput>;
  onSubmit: (data: ActivityInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

// ── Formular ───────────────────────────────────────────────────────────────

export function ActivityForm({ initialData, onSubmit, onCancel, isSubmitting }: ActivityFormProps) {
  const [sport, setSport] = useState<SportType>(initialData?.sport_type ?? 'run');
  const [name, setName] = useState(initialData?.name ?? '');
  const [datum, setDatum] = useState(
    initialData?.date ? initialData.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [distanzInput, setDistanzInput] = useState(
    meterToKmInput(initialData?.distance ?? 0, initialData?.sport_type ?? 'run')
  );
  const [dauerInput, setDauerInput] = useState(formatDurationInput(initialData?.duration ?? 0));
  const [avgHr, setAvgHr] = useState(initialData?.avg_hr ? String(initialData.avg_hr) : '');
  const [elevation, setElevation] = useState(
    initialData?.elevation ? String(initialData.elevation) : ''
  );
  const [intensity, setIntensity] = useState(
    initialData?.intensity ? String(initialData.intensity) : ''
  );
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Distanz: Schwimmen in Metern, alle anderen km → Meter
    const distanzZahl = parseFloat(distanzInput.replace(',', '.')) || 0;
    const distanzInMeter = sport === 'swim' ? distanzZahl : distanzZahl * 1000;

    const daten: ActivityInput = {
      name,
      sport_type: sport,
      distance: distanzInMeter,
      duration: parseDuration(dauerInput),
      date: datum,
      avg_hr: avgHr ? Number(avgHr) : null,
      elevation: elevation ? Number(elevation) : null,
      intensity: intensity ? Number(intensity) : null,
      notes: notes || null,
    };

    await onSubmit(daten);
  }

  const distanzPlaceholder = sport === 'swim' ? 'Meter, z.B. 1500' : 'km, z.B. 10.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Datum */}
      <div className="space-y-1.5">
        <Label htmlFor="datum">Datum</Label>
        <Input
          id="datum"
          type="date"
          required
          value={datum}
          onChange={(e) => setDatum(e.target.value)}
        />
      </div>

      {/* Sportart */}
      <div className="space-y-1.5">
        <Label>Sportart</Label>
        <Select
          value={sport}
          onValueChange={(v) => {
            if (v) setSport(v as SportType);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="run">Laufen</SelectItem>
            <SelectItem value="bike">Rad</SelectItem>
            <SelectItem value="swim">Schwimmen</SelectItem>
            <SelectItem value="misc">Sonstiges</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Morgenrunde im Park"
        />
      </div>

      {/* Distanz + Dauer nebeneinander */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="distanz">Distanz</Label>
          <Input
            id="distanz"
            type="number"
            min="0"
            step="any"
            value={distanzInput}
            onChange={(e) => setDistanzInput(e.target.value)}
            placeholder={distanzPlaceholder}
            className="tabular-nums"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dauer">Dauer</Label>
          <Input
            id="dauer"
            value={dauerInput}
            onChange={(e) => setDauerInput(e.target.value)}
            placeholder="z.B. 45:00"
            className="tabular-nums"
          />
        </div>
      </div>

      {/* Ø HR + Höhenmeter nebeneinander */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="avgHr">Ø Herzfrequenz</Label>
          <Input
            id="avgHr"
            type="number"
            min="0"
            max="250"
            value={avgHr}
            onChange={(e) => setAvgHr(e.target.value)}
            placeholder="bpm"
            className="tabular-nums"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="elevation">Höhenmeter</Label>
          <Input
            id="elevation"
            type="number"
            min="0"
            value={elevation}
            onChange={(e) => setElevation(e.target.value)}
            placeholder="m"
            className="tabular-nums"
          />
        </div>
      </div>

      {/* Intensität */}
      <div className="space-y-1.5">
        <Label>Intensität</Label>
        <Select value={intensity} onValueChange={(v) => setIntensity(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="Optional" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(INTENSITY_LABELS).map(([wert, label]) => (
              <SelectItem key={wert} value={wert}>
                {wert} – {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notizen */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notizen</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional"
          rows={3}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Speichern…' : 'Speichern'}
        </Button>
      </div>
    </form>
  );
}
