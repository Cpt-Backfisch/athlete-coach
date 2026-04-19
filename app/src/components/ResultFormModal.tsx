import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResultForm } from './ResultForm';
import { createPastResult, updatePastResult } from '@/lib/events';
import type { PastResult, PastResultInput } from '@/lib/events';

interface ResultFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result?: PastResult; // vorhanden → Bearbeiten-Modus
  onSaved: () => void;
}

export function ResultFormModal({ open, onOpenChange, result, onSaved }: ResultFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const istBearbeiten = !!result;

  async function handleSubmit(input: PastResultInput) {
    setIsSubmitting(true);
    try {
      if (istBearbeiten && result) {
        await updatePastResult(result.id, input);
      } else {
        await createPastResult(input);
      }
      toast.success(istBearbeiten ? 'Ergebnis aktualisiert' : 'Ergebnis gespeichert');
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
          <DialogTitle>{istBearbeiten ? 'Ergebnis bearbeiten' : 'Ergebnis erfassen'}</DialogTitle>
        </DialogHeader>
        <ResultForm
          initialData={result}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
