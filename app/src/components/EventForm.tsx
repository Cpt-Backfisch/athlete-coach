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
import type { RaceInput, EventSportType } from '@/lib/events';

interface EventFormProps {
  initialData?: Partial<RaceInput>;
  onSubmit: (data: RaceInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function EventForm({ initialData, onSubmit, onCancel, isSubmitting }: EventFormProps) {
  const [sport, setSport] = useState<EventSportType>(initialData?.sport_type ?? 'run');
  const [name, setName] = useState(initialData?.name ?? '');
  const [datum, setDatum] = useState(
    initialData?.date ? initialData.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [ort, setOrt] = useState(initialData?.location ?? '');
  const [ziel, setZiel] = useState(initialData?.goal ?? '');
  const [url, setUrl] = useState(initialData?.event_url ?? '');
  const [notizen, setNotizen] = useState(initialData?.notes ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      name: name.trim(),
      date: datum,
      sport_type: sport,
      location: ort.trim() || null,
      goal: ziel.trim() || null,
      event_url: url.trim() || null,
      notes: notizen.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="ef-name">Name *</Label>
        <Input
          id="ef-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Zürich Marathon"
          required
        />
      </div>

      {/* Datum + Sportart */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ef-datum">Datum *</Label>
          <Input
            id="ef-datum"
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Sportart *</Label>
          <Select
            value={sport}
            onValueChange={(v) => {
              if (v) setSport(v as EventSportType);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="run">Laufen</SelectItem>
              <SelectItem value="bike">Rad</SelectItem>
              <SelectItem value="swim">Schwimmen</SelectItem>
              <SelectItem value="triathlon">Triathlon</SelectItem>
              <SelectItem value="misc">Sonstiges</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ort */}
      <div className="space-y-1.5">
        <Label htmlFor="ef-ort">Ort</Label>
        <Input
          id="ef-ort"
          value={ort}
          onChange={(e) => setOrt(e.target.value)}
          placeholder="z.B. Zürich, Schweiz"
        />
      </div>

      {/* Ziel */}
      <div className="space-y-1.5">
        <Label htmlFor="ef-ziel">Ziel</Label>
        <Input
          id="ef-ziel"
          value={ziel}
          onChange={(e) => setZiel(e.target.value)}
          placeholder="z.B. 1:37:00 oder Ankommen"
        />
      </div>

      {/* Event-URL */}
      <div className="space-y-1.5">
        <Label htmlFor="ef-url">Event-URL</Label>
        <Input
          id="ef-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      {/* Notizen */}
      <div className="space-y-1.5">
        <Label htmlFor="ef-notizen">Notizen</Label>
        <Textarea
          id="ef-notizen"
          value={notizen}
          onChange={(e) => setNotizen(e.target.value)}
          rows={3}
          placeholder="Streckenprofil, Anreise, ..."
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={isSubmitting || !name.trim() || !datum}>
          {isSubmitting ? 'Speichern…' : 'Speichern'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
