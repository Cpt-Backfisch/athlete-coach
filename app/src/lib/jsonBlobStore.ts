import { supabase } from './supabase';

// ── JSON-Blob-Helpers ──────────────────────────────────────────────────────
//
// Alle vier Tabellen (activities, races, past_results, week_frame) sowie
// strava_token und settings nutzen das Schema:
//   user_id uuid, data text, updated_at timestamptz
// In `data` liegt das komplette Payload als JSON-String (Array oder Objekt).
// RLS stellt sicher dass jede Query nur die eigene Zeile sieht.

function parseBlob<T>(raw: { data: string } | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw.data) as T;
  } catch {
    return null;
  }
}

// ── Einzelnes Objekt laden (z.B. week_frame, strava_token) ────────────────

export async function blobLoadOne<T>(table: string): Promise<T | null> {
  const { data } = await supabase.from(table).select('data').maybeSingle();
  return parseBlob<T>(data as { data: string } | null);
}

// ── Array laden — eigener User via RLS ────────────────────────────────────

export async function blobLoadArray<T>(table: string): Promise<T[]> {
  const { data } = await supabase.from(table).select('data').maybeSingle();
  const parsed = parseBlob<T[]>(data as { data: string } | null);
  return Array.isArray(parsed) ? parsed : [];
}

// ── Array laden — fremder User (Share-View, expliziter user_id-Filter) ────

export async function blobLoadArrayByUser<T>(table: string, userId: string): Promise<T[]> {
  const { data } = await supabase.from(table).select('data').eq('user_id', userId).maybeSingle();
  const parsed = parseBlob<T[]>(data as { data: string } | null);
  return Array.isArray(parsed) ? parsed : [];
}

// ── Einzelnes Objekt laden — fremder User (Share-View) ────────────────────

export async function blobLoadOneByUser<T>(table: string, userId: string): Promise<T | null> {
  const { data } = await supabase.from(table).select('data').eq('user_id', userId).maybeSingle();
  return parseBlob<T>(data as { data: string } | null);
}

// ── Objekt oder Array speichern ───────────────────────────────────────────

export async function blobSave<T>(table: string, userId: string, payload: T): Promise<void> {
  const { error } = await supabase
    .from(table)
    .upsert({ user_id: userId, data: JSON.stringify(payload) }, { onConflict: 'user_id' });
  if (error) throw new Error(`${table} speichern fehlgeschlagen: ${error.message}`);
}
