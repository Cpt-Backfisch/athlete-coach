import { supabase } from './supabase';
import type { SportType } from './activities';

// ── Typen ──────────────────────────────────────────────────────────────────

// Events haben zusätzlich Triathlon als Sportart
export type EventSportType = SportType | 'triathlon';

export interface Race {
  id: string;
  user_id: string;
  name: string;
  date: string; // ISO-String
  sport_type: EventSportType;
  location?: string | null;
  goal?: string | null; // Freitext (z.B. „1:37:00" oder „Ankommen")
  notes?: string | null;
  event_url?: string | null;
}

export type RaceInput = Omit<Race, 'id' | 'user_id'>;

export interface PastResult {
  id: string;
  user_id: string;
  name: string;
  date: string;
  sport_type: EventSportType;
  location?: string | null;
  goal_time?: string | null; // z.B. „1:37:00"
  actual_time?: string | null; // z.B. „1:39:45"
  notes?: string | null; // Freitext für Splits, Eindrücke etc.
}

export type PastResultInput = Omit<PastResult, 'id' | 'user_id'>;

// Kombinierter Typ für die Verlaufs-Liste
export type EventListItem = { kind: 'race'; data: Race } | { kind: 'result'; data: PastResult };

// ── Hilfsfunktionen ────────────────────────────────────────────────────────

// Tage bis zum Datum (positiv = Zukunft, negativ = Vergangenheit)
export function getDaysUntil(dateStr: string): number {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const ziel = new Date(dateStr);
  ziel.setHours(0, 0, 0, 0);
  return Math.round((ziel.getTime() - heute.getTime()) / (1000 * 60 * 60 * 24));
}

// Heutiges Datum als ISO-String (YYYY-MM-DD)
function heuteISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Races ──────────────────────────────────────────────────────────────────

export async function fetchUpcomingRaces(): Promise<Race[]> {
  const { data, error } = await supabase
    .from('races')
    .select('*')
    .gte('date', heuteISO())
    .order('date', { ascending: true });

  if (error) throw new Error(`Wettkämpfe laden fehlgeschlagen: ${error.message}`);
  return (data ?? []) as Race[];
}

export async function fetchPastRaces(): Promise<Race[]> {
  const { data, error } = await supabase
    .from('races')
    .select('*')
    .lt('date', heuteISO())
    .order('date', { ascending: false });

  if (error) throw new Error(`Vergangene Wettkämpfe laden fehlgeschlagen: ${error.message}`);
  return (data ?? []) as Race[];
}

export async function createRace(input: RaceInput): Promise<Race> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');

  const { data, error } = await supabase
    .from('races')
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(`Wettkampf erstellen fehlgeschlagen: ${error.message}`);
  return data as Race;
}

export async function updateRace(id: string, input: Partial<RaceInput>): Promise<Race> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');

  const { data, error } = await supabase
    .from('races')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw new Error(`Wettkampf aktualisieren fehlgeschlagen: ${error.message}`);
  return data as Race;
}

export async function deleteRace(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');

  const { error } = await supabase.from('races').delete().eq('id', id).eq('user_id', user.id);

  if (error) throw new Error(`Wettkampf löschen fehlgeschlagen: ${error.message}`);
}

// ── Past Results ───────────────────────────────────────────────────────────

export async function fetchPastResults(): Promise<PastResult[]> {
  const { data, error } = await supabase
    .from('past_results')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw new Error(`Ergebnisse laden fehlgeschlagen: ${error.message}`);
  return (data ?? []) as PastResult[];
}

export async function createPastResult(input: PastResultInput): Promise<PastResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');

  const { data, error } = await supabase
    .from('past_results')
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(`Ergebnis erstellen fehlgeschlagen: ${error.message}`);
  return data as PastResult;
}

export async function updatePastResult(
  id: string,
  input: Partial<PastResultInput>
): Promise<PastResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');

  const { data, error } = await supabase
    .from('past_results')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw new Error(`Ergebnis aktualisieren fehlgeschlagen: ${error.message}`);
  return data as PastResult;
}

export async function deletePastResult(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');

  const { error } = await supabase
    .from('past_results')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(`Ergebnis löschen fehlgeschlagen: ${error.message}`);
}

// ── Kombinierter Verlauf ───────────────────────────────────────────────────

export async function getCombinedHistory(): Promise<EventListItem[]> {
  const [vergangeneRaces, ergebnisse] = await Promise.all([fetchPastRaces(), fetchPastResults()]);

  const liste: EventListItem[] = [
    ...vergangeneRaces.map((r): EventListItem => ({ kind: 'race', data: r })),
    ...ergebnisse.map((r): EventListItem => ({ kind: 'result', data: r })),
  ];

  // Neueste zuerst
  liste.sort((a, b) => {
    const dateA = a.kind === 'race' ? a.data.date : a.data.date;
    const dateB = b.kind === 'race' ? b.data.date : b.data.date;
    return dateB.localeCompare(dateA);
  });

  return liste;
}
