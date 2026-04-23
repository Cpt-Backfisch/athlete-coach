import { supabase } from './supabase';
import { blobLoadArray, blobSave } from './jsonBlobStore';
import type { SportType } from './activities';

// ── Typen ──────────────────────────────────────────────────────────────────

export type EventSportType = SportType | 'triathlon';

export interface Race {
  id: string;
  user_id?: string;
  name: string;
  date: string; // ISO-String
  sport_type: EventSportType;
  location?: string | null;
  goal?: string | null;
  notes?: string | null;
  event_url?: string | null;
}

export type RaceInput = Omit<Race, 'id' | 'user_id'>;

export interface PastResult {
  id: string;
  user_id?: string;
  name: string;
  date: string;
  sport_type: EventSportType;
  location?: string | null;
  goal_time?: string | null;
  actual_time?: string | null;
  notes?: string | null;
  // Strukturierte Triathlon-Splits (optional)
  swim_time?: string | null; // "38:14"
  t1_time?: string | null; // "6:59"
  bike_time?: string | null; // "2:23:53"
  t2_time?: string | null; // "4:32"
  run_time?: string | null; // "1:41:37"
  format_desc?: string | null; // "1,5/40/10 km · Neo"
}

export type PastResultInput = Omit<PastResult, 'id' | 'user_id'>;

export type EventListItem = { kind: 'race'; data: Race } | { kind: 'result'; data: PastResult };

// ── Strukturierte Split-Daten (Seed) ───────────────────────────────────────
// Wird beim ersten Laden angewendet wenn Splits noch nicht im Blob stehen.

const SPLIT_SEED: Record<string, Partial<PastResult>> = {
  pr1: {
    sport_type: 'triathlon',
    swim_time: '38:14',
    t1_time: '6:59',
    bike_time: '2:23:53',
    t2_time: '4:32',
    run_time: '1:41:37',
    format_desc: '2,0/80/20 km · Neo',
  },
  pr2: {
    sport_type: 'triathlon',
    swim_time: '28:27',
    t1_time: '5:42',
    bike_time: '1:03:20',
    t2_time: '3:56',
    run_time: '46:15',
    format_desc: '1,5/40/10 km · Neo',
  },
  pr3: {
    sport_type: 'triathlon',
    swim_time: '26:24',
    t1_time: '2:21',
    bike_time: '1:30:47',
    t2_time: '2:30',
    run_time: '48:33',
    format_desc: '1,5/44/10 km · kein Neo',
  },
  pr6: {
    sport_type: 'triathlon',
    swim_time: '32:05',
    t1_time: '4:09',
    bike_time: '1:24:22',
    t2_time: '2:51',
    run_time: '48:23',
    format_desc: '1,5/45/10 km · kein Neo',
  },
  pr7: {
    sport_type: 'triathlon',
    swim_time: '29:52',
    t1_time: '5:23',
    bike_time: '1:12:24',
    t2_time: '4:04',
    run_time: '47:15',
    format_desc: '1,5/40/10 km · Neo',
  },
  // pr8: T1/T2 bewusst weggelassen (nicht vorhanden)
  pr8: {
    sport_type: 'triathlon',
    swim_time: '34:13',
    bike_time: '1:24:00',
    run_time: '51:55',
    format_desc: '1,5/40/10 km · kein Neo',
  },
};

// ── Normalisierung (alte Feldnamen → neue) ─────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeResult(raw: any): PastResult {
  const id = String(raw.id ?? crypto.randomUUID());
  const seed = SPLIT_SEED[id] ?? {};
  return {
    id,
    name: String(raw.name ?? ''),
    date: String(raw.date ?? ''),
    // 'type' ist das alte Feld — 'sport_type' das neue
    sport_type: (raw.sport_type ?? raw.type ?? 'misc') as EventSportType,
    location: (raw.location as string | null) ?? null,
    // 'goalTime' → 'goal_time', 'actualTime' → 'actual_time'
    goal_time: ((raw.goal_time ?? raw.goalTime) as string | null) ?? null,
    actual_time: ((raw.actual_time ?? raw.actualTime) as string | null) ?? null,
    notes: (raw.notes as string | null) ?? null,
    // Splits: behalte vorhandene, ergänze aus Seed wenn fehlend
    swim_time: (raw.swim_time as string | null) ?? seed.swim_time ?? null,
    t1_time: (raw.t1_time as string | null) ?? seed.t1_time ?? null,
    bike_time: (raw.bike_time as string | null) ?? seed.bike_time ?? null,
    t2_time: (raw.t2_time as string | null) ?? seed.t2_time ?? null,
    run_time: (raw.run_time as string | null) ?? seed.run_time ?? null,
    format_desc: (raw.format_desc as string | null) ?? seed.format_desc ?? null,
  };
}

// ── Hilfsfunktionen ────────────────────────────────────────────────────────

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await blobLoadArray<any>('past_results');
  const normalized = raw.map(normalizeResult);

  // Einmalige Migration: wenn Feldnamen-Normalisierung oder Splits fehlen,
  // speichern wir das normalisierte Array zurück.
  const needsSave = raw.some(
    (r, i) =>
      r.type !== undefined || // altes Feldname-Schema
      r.goalTime !== undefined ||
      r.actualTime !== undefined ||
      (normalized[i].swim_time !== null && r.swim_time == null) // neue Split-Felder fehlen
  );

  if (needsSave) {
    try {
      const userId = await getUserId();
      await blobSave('past_results', userId, normalized);
    } catch {
      // Migration kann nur wenn eingeloggt — still ignorieren
    }
  }

  return normalized.sort((a, b) => b.date.localeCompare(a.date));
}

export async function createPastResult(input: PastResultInput): Promise<PastResult> {
  const userId = await getUserId();
  const items = await fetchPastResults();
  const newItem: PastResult = { ...input, id: crypto.randomUUID() };
  await blobSave('past_results', userId, [...items, newItem]);
  return newItem;
}

export async function updatePastResult(
  id: string,
  input: Partial<PastResultInput>
): Promise<PastResult> {
  const userId = await getUserId();
  const items = await fetchPastResults();
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
  const items = await fetchPastResults();
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

  liste.sort((a, b) => b.data.date.localeCompare(a.data.date));
  return liste;
}
