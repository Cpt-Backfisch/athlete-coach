import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActivityForm } from './ActivityForm';
import { createActivity, updateActivity } from '@/lib/activities';
import type { Activity, ActivityInput } from '@/lib/activities';

interface ActivityFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Activity; // vorhanden → Bearbeiten-Modus
  onSaved: () => void;
}

export function ActivityFormModal({
  open,
  onOpenChange,
  activity,
  onSaved,
}: ActivityFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const istBearbeiten = !!activity;

  async function handleSubmit(input: ActivityInput) {
    setIsSubmitting(true);
    try {
      if (istBearbeiten && activity) {
        await updateActivity(activity.id, input);
      } else {
        await createActivity(input);
      }
      toast.success('Einheit gespeichert');
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
          <DialogTitle>{istBearbeiten ? 'Einheit bearbeiten' : 'Einheit hinzufügen'}</DialogTitle>
        </DialogHeader>
        <ActivityForm
          initialData={activity}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
