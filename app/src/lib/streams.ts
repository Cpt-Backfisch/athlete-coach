import { supabase } from './supabase';
import { getValidToken } from './strava';

// ── Typen ──────────────────────────────────────────────────────────────────

export interface StreamPoint {
  time: number; // Sekunden seit Start
  heartrate?: number;
  velocity?: number; // m/s (von Strava)
  cadence?: number;
  altitude?: number;
}

// ── Supabase-Cache ─────────────────────────────────────────────────────────

export async function getCachedStreams(activityId: string): Promise<StreamPoint[] | null> {
  const { data, error } = await supabase
    .from('streams')
    .select('data')
    .eq('activity_id', activityId)
    .maybeSingle();

  if (error || !data) return null;
  return data.data as StreamPoint[];
}

export async function saveStreamsToCache(activityId: string, data: StreamPoint[]): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('streams').upsert(
    {
      activity_id: activityId,
      user_id: user.id,
      data: data,
      cached_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,activity_id' }
  );
}

// ── Strava-API ─────────────────────────────────────────────────────────────

export async function fetchStreamsFromStrava(
  _activityId: string,
  stravaActivityId: string
): Promise<StreamPoint[]> {
  const token = await getValidToken();
  if (!token) throw new Error('Kein gültiger Strava-Token');

  const params = new URLSearchParams({
    keys: 'time,heartrate,velocity_smooth,cadence,altitude',
    key_by_type: 'true',
  });

  const res = await fetch(
    `https://www.strava.com/api/v3/activities/${stravaActivityId}/streams?${params}`,
    { headers: { Authorization: `Bearer ${token.access_token}` } }
  );

  if (!res.ok) throw new Error(`Strava Streams Fehler: ${res.status}`);

  // Strava antwortet mit { time: {data:[]}, heartrate: {data:[]}, ... }
  const raw = (await res.json()) as Record<string, { data: number[] } | undefined>;

  const zeitReihe = raw['time']?.data ?? [];
  return zeitReihe.map((t, i) => ({
    time: t,
    heartrate: raw['heartrate']?.data[i],
    velocity: raw['velocity_smooth']?.data[i],
    cadence: raw['cadence']?.data[i],
    altitude: raw['altitude']?.data[i],
  }));
}

// ── Haupt-Funktion: Cache-First ────────────────────────────────────────────

export async function getStreams(
  activityId: string,
  stravaActivityId: string | null | undefined
): Promise<StreamPoint[] | null> {
  try {
    // 1. Cache prüfen
    const cached = await getCachedStreams(activityId);
    if (cached && cached.length > 0) return cached;

    // 2. Kein Strava-Link → keine Streams verfügbar
    if (!stravaActivityId) return null;

    // 3. Von Strava laden
    const fresh = await fetchStreamsFromStrava(activityId, stravaActivityId);
    if (fresh.length === 0) return null;

    // 4. Cachen
    await saveStreamsToCache(activityId, fresh);
    return fresh;
  } catch {
    // Stream-Fehler still schlucken — kein Crash, nur kein Chart
    return null;
  }
}
