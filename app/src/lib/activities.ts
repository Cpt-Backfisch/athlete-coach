import { supabase } from './supabase';

// ── Typen ──────────────────────────────────────────────────────────────────

export type SportType = 'run' | 'bike' | 'swim' | 'misc';

export interface Activity {
  id: string;
  user_id: string;
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

// ── CRUD-Funktionen ────────────────────────────────────────────────────────

export async function fetchActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw new Error(`Aktivitäten laden fehlgeschlagen: ${error.message}`);
  return (data ?? []) as Activity[];
}

export async function createActivity(input: ActivityInput): Promise<Activity> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');

  const { data, error } = await supabase
    .from('activities')
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(`Aktivität erstellen fehlgeschlagen: ${error.message}`);
  return data as Activity;
}

export async function updateActivity(id: string, input: Partial<ActivityInput>): Promise<Activity> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');

  const { data, error } = await supabase
    .from('activities')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw new Error(`Aktivität aktualisieren fehlgeschlagen: ${error.message}`);
  return data as Activity;
}

export async function fetchActivityById(id: string): Promise<Activity | null> {
  const { data, error } = await supabase.from('activities').select('*').eq('id', id).maybeSingle();

  if (error || !data) return null;
  return data as Activity;
}

export async function deleteActivity(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');

  const { error } = await supabase.from('activities').delete().eq('id', id).eq('user_id', user.id);

  if (error) throw new Error(`Aktivität löschen fehlgeschlagen: ${error.message}`);
}
