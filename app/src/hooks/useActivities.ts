import { useCallback, useEffect, useState } from 'react';
import { fetchActivities, createActivity, updateActivity, deleteActivity } from '@/lib/activities';
import type { Activity, ActivityInput } from '@/lib/activities';

// Stellt Aktivitäten und CRUD-Funktionen für die ActivitiesPage bereit.
export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const daten = await fetchActivities();
      setActivities(daten);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function addActivity(input: ActivityInput) {
    await createActivity(input);
    await reload();
  }

  async function editActivity(id: string, input: Partial<ActivityInput>) {
    await updateActivity(id, input);
    await reload();
  }

  async function removeActivity(id: string) {
    await deleteActivity(id);
    await reload();
  }

  return { activities, isLoading, error, reload, addActivity, editActivity, removeActivity };
}
