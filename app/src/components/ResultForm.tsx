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
import type { PastResultInput, EventSportType } from '@/lib/events';

interface ResultFormProps {
  initialData?: Partial<PastResultInput>;
  onSubmit: (data: PastResultInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ResultForm({ initialData, onSubmit, onCancel, isSubmitting }: ResultFormProps) {
  const [sport, setSport] = useState<EventSportType>(initialData?.sport_type ?? 'run');
  const [name, setName] = useState(initialData?.name ?? '');
  const [datum, setDatum] = useState(
    initialData?.date ? initialData.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [ort, setOrt] = useState(initialData?.location ?? '');
  const [zielzeit, setZielzeit] = useState(initialData?.goal_time ?? '');
  const [istzeit, setIstzeit] = useState(initialData?.actual_time ?? '');
  const [notizen, setNotizen] = useState(initialData?.notes ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      name: name.trim(),
      date: datum,
      sport_type: sport,
      location: ort.trim() || null,
      goal_time: zielzeit.trim() || null,
      actual_time: istzeit.trim() || null,
      notes: notizen.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="rf-name">Name *</Label>
        <Input
          id="rf-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Halbmarathon Wien"
          required
        />
      </div>

      {/* Datum + Sportart */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rf-datum">Datum *</Label>
          <Input
            id="rf-datum"
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
        <Label htmlFor="rf-ort">Ort</Label>
        <Input
          id="rf-ort"
          value={ort}
          onChange={(e) => setOrt(e.target.value)}
          placeholder="z.B. Wien, Österreich"
        />
      </div>

      {/* Zielzeit + Tatsächliche Zeit */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rf-zielzeit">Zielzeit</Label>
          <Input
            id="rf-zielzeit"
            value={zielzeit}
            onChange={(e) => setZielzeit(e.target.value)}
            placeholder="z.B. 1:37:00"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rf-istzeit">Tatsächliche Zeit</Label>
          <Input
            id="rf-istzeit"
            value={istzeit}
            onChange={(e) => setIstzeit(e.target.value)}
            placeholder="z.B. 1:39:45"
          />
        </div>
      </div>

      {/* Notizen */}
      <div className="space-y-1.5">
        <Label htmlFor="rf-notizen">Notizen / Splits</Label>
        <Textarea
          id="rf-notizen"
          value={notizen}
          onChange={(e) => setNotizen(e.target.value)}
          rows={4}
          placeholder="Splits, Eindrücke, ..."
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
