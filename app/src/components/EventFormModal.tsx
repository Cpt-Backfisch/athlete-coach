import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EventForm } from './EventForm';
import { createRace, updateRace } from '@/lib/events';
import type { Race, RaceInput } from '@/lib/events';

interface EventFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  race?: Race; // vorhanden → Bearbeiten-Modus
  onSaved: () => void;
}

export function EventFormModal({ open, onOpenChange, race, onSaved }: EventFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const istBearbeiten = !!race;

  async function handleSubmit(input: RaceInput) {
    setIsSubmitting(true);
    try {
      if (istBearbeiten && race) {
        await updateRace(race.id, input);
      } else {
        await createRace(input);
      }
      toast.success(istBearbeiten ? 'Wettkampf aktualisiert' : 'Wettkampf gespeichert');
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast.error(`Fehler beim Speichern: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {istBearbeiten ? 'Wettkampf bearbeiten' : 'Wettkampf hinzufügen'}
          </DialogTitle>
        </DialogHeader>
        <EventForm
          initialData={race}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
