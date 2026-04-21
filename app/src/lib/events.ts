import { supabase } from './supabase';
import { blobLoadArray, blobSave } from './jsonBlobStore';
import type { SportType } from './activities';

// ── Typen ──────────────────────────────────────────────────────────────────

// Events haben zusätzlich Triathlon als Sportart
export type EventSportType = SportType | 'triathlon';

export interface Race {
  id: string;
  user_id?: string; // nicht im Blob gespeichert — wird durch RLS-Zeile abgedeckt
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
  user_id?: string; // nicht im Blob gespeichert — wird durch RLS-Zeile abgedeckt
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

function heuteISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');
  return user.id;
}

// ── Races ──────────────────────────────────────────────────────────────────

export async function fetchUpcomingRaces(): Promise<Race[]> {
  const heute = heuteISO();
  const items = await blobLoadArray<Race>('races');
  return items.filter((r) => r.date >= heute).sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchPastRaces(): Promise<Race[]> {
  const heute = heuteISO();
  const items = await blobLoadArray<Race>('races');
  return items.filter((r) => r.date < heute).sort((a, b) => b.date.localeCompare(a.date));
}

// Anstehende Wettkämpfe eines anderen Users laden (Share-View)
export async function fetchUpcomingRacesByUser(userId: string): Promise<Race[]> {
  const { data } = await supabase.from('races').select('data').eq('user_id', userId).maybeSingle();
  if (!data) return [];
  try {
    const all = JSON.parse((data as { data: string }).data) as Race[];
    const heute = heuteISO();
    return Array.isArray(all)
      ? all
          .filter((r) => r.date >= heute)
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, 3)
      : [];
  } catch {
    return [];
  }
}

export async function createRace(input: RaceInput): Promise<Race> {
  const userId = await getUserId();
  const items = await blobLoadArray<Race>('races');
  const newItem: Race = { ...input, id: crypto.randomUUID() };
  await blobSave('races', userId, [...items, newItem]);
  return newItem;
}

export async function updateRace(id: string, input: Partial<RaceInput>): Promise<Race> {
  const userId = await getUserId();
  const items = await blobLoadArray<Race>('races');
  const idx = items.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Wettkampf nicht gefunden');
  const updated: Race = { ...items[idx], ...input };
  const newItems = [...items];
  newItems[idx] = updated;
  await blobSave('races', userId, newItems);
  return updated;
}

export async function deleteRace(id: string): Promise<void> {
  const userId = await getUserId();
  const items = await blobLoadArray<Race>('races');
  await blobSave(
    'races',
    userId,
    items.filter((r) => r.id !== id)
  );
}

// ── Past Results ───────────────────────────────────────────────────────────

export async function fetchPastResults(): Promise<PastResult[]> {
  const items = await blobLoadArray<PastResult>('past_results');
  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export async function createPastResult(input: PastResultInput): Promise<PastResult> {
  const userId = await getUserId();
  const items = await blobLoadArray<PastResult>('past_results');
  const newItem: PastResult = { ...input, id: crypto.randomUUID() };
  await blobSave('past_results', userId, [...items, newItem]);
  return newItem;
}

export async function updatePastResult(
  id: string,
  input: Partial<PastResultInput>
): Promise<PastResult> {
  const userId = await getUserId();
  const items = await blobLoadArray<PastResult>('past_results');
  const idx = items.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Ergebnis nicht gefunden');
  const updated: PastResult = { ...items[idx], ...input };
  const newItems = [...items];
  newItems[idx] = updated;
  await blobSave('past_results', userId, newItems);
  return updated;
}

export async function deletePastResult(id: string): Promise<void> {
  const userId = await getUserId();
  const items = await blobLoadArray<PastResult>('past_results');
  await blobSave(
    'past_results',
    userId,
    items.filter((r) => r.id !== id)
  );
}

// ── Kombinierter Verlauf ───────────────────────────────────────────────────

export async function getCombinedHistory(): Promise<EventListItem[]> {
  const [vergangeneRaces, ergebnisse] = await Promise.all([fetchPastRaces(), fetchPastResults()]);

  const liste: EventListItem[] = [
    ...vergangeneRaces.map((r): EventListItem => ({ kind: 'race', data: r })),
    ...ergebnisse.map((r): EventListItem => ({ kind: 'result', data: r })),
  ];

  liste.sort((a, b) => {
    const dateA = a.data.date;
    const dateB = b.data.date;
    return dateB.localeCompare(dateA);
  });

  return liste;
}
