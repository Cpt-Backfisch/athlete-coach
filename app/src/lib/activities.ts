import { supabase } from './supabase';
import { blobLoadArray, blobLoadArrayByUser, blobSave } from './jsonBlobStore';

// ── Typen ──────────────────────────────────────────────────────────────────

export type SportType = 'run' | 'bike' | 'swim' | 'misc';

export interface Activity {
  id: string;
  user_id?: string; // nicht im Blob gespeichert — wird durch RLS-Zeile abgedeckt
  strava_id?: string | null;
  name: string;
  sport_type: SportType;
  distance: number; // immer in Metern
  duration: number; // in Sekunden
  date: string; // ISO-String
  avg_hr?: number | null;
  elevation?: number | null;
  intensity?: number | null; // 1–5
  notes?: string | null;
  created_at?: string;
}

export type ActivityInput = Omit<Activity, 'id' | 'user_id' | 'created_at' | 'strava_id'>;

// ── Hilfsfunktion ─────────────────────────────────────────────────────────

async function getUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');
  return user.id;
}

// ── CRUD-Funktionen ────────────────────────────────────────────────────────

export async function fetchActivities(): Promise<Activity[]> {
  const items = await blobLoadArray<Activity>('activities');
  return items.sort((a, b) => b.date.localeCompare(a.date));
}

// Aktivitäten eines anderen Users laden (Share-View, kein Auth nötig — RLS Share-Policy)
export async function fetchActivitiesByUserId(userId: string): Promise<Activity[]> {
  const items = await blobLoadArrayByUser<Activity>('activities', userId);
  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export async function createActivity(input: ActivityInput): Promise<Activity> {
  const userId = await getUserId();
  const items = await blobLoadArray<Activity>('activities');
  const newItem: Activity = {
    ...input,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  await blobSave('activities', userId, [...items, newItem]);
  return newItem;
}

export async function updateActivity(id: string, input: Partial<ActivityInput>): Promise<Activity> {
  const userId = await getUserId();
  const items = await blobLoadArray<Activity>('activities');
  const idx = items.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Aktivität nicht gefunden');
  const updated: Activity = { ...items[idx], ...input };
  const newItems = [...items];
  newItems[idx] = updated;
  await blobSave('activities', userId, newItems);
  return updated;
}

export async function fetchActivityById(id: string): Promise<Activity | null> {
  const items = await blobLoadArray<Activity>('activities');
  return items.find((a) => a.id === id) ?? null;
}

export async function deleteActivity(id: string): Promise<void> {
  const userId = await getUserId();
  const items = await blobLoadArray<Activity>('activities');
  await blobSave(
    'activities',
    userId,
    items.filter((a) => a.id !== id)
  );
}

// ── Upsert per strava_id (für Sync) ───────────────────────────────────────

export function upsertActivityByStravaId(
  items: Activity[],
  newData: Omit<Activity, 'id'>
): { updated: Activity[]; isNew: boolean } {
  const idx = items.findIndex((a) => a.strava_id === newData.strava_id);
  if (idx >= 0) {
    const updatedItems = [...items];
    updatedItems[idx] = { ...items[idx], ...newData };
    return { updated: updatedItems, isNew: false };
  }
  return {
    updated: [
      ...items,
      { ...newData, id: crypto.randomUUID(), created_at: new Date().toISOString() },
    ],
    isNew: true,
  };
}

// ── Upsert per name+date (für CSV-Import) ─────────────────────────────────

export function upsertActivityByNameDate(
  items: Activity[],
  newData: Omit<Activity, 'id'>
): Activity[] {
  const key = `${newData.name}|${newData.date.slice(0, 10)}`;
  const idx = items.findIndex((a) => `${a.name}|${a.date.slice(0, 10)}` === key);
  if (idx >= 0) {
    const updated = [...items];
    updated[idx] = { ...items[idx], ...newData };
    return updated;
  }
  return [...items, { ...newData, id: crypto.randomUUID(), created_at: new Date().toISOString() }];
}
