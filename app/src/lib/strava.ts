import Papa from 'papaparse';
import { supabase } from './supabase';

const VERCEL_PROXY_URL = 'https://athlete-coach-proxy-rnuy.vercel.app';

// ── Typen ──────────────────────────────────────────────────────────────────

export interface StravaToken {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface SyncResult {
  synced: number;
  total: number;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

// Strava-Aktivitätstypen auf interne sport_type-Werte normalisieren
function normalizeSportType(raw: string): 'run' | 'bike' | 'swim' | 'misc' {
  const lower = raw.toLowerCase();
  if (lower.includes('run')) return 'run';
  if (lower.includes('ride')) return 'bike';
  if (lower.includes('swim')) return 'swim';
  return 'misc';
}

// ── Token-Verwaltung ───────────────────────────────────────────────────────

export async function getStoredToken(): Promise<StravaToken | null> {
  const { data, error } = await supabase
    .from('strava_token')
    .select('access_token, refresh_token, expires_at')
    .maybeSingle();
  if (error || !data) return null;
  return data as StravaToken;
}

export async function saveToken(token: StravaToken): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');

  const { error } = await supabase.from('strava_token').upsert(
    {
      user_id: user.id,
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_at: token.expires_at,
    },
    { onConflict: 'user_id' }
  );
  if (error) throw new Error(`Token speichern fehlgeschlagen: ${error.message}`);
}

export async function refreshStravaToken(
  refresh_token: string
): Promise<Pick<StravaToken, 'access_token' | 'expires_at'>> {
  const url = `${VERCEL_PROXY_URL}/api/strava?action=refresh&refresh_token=${encodeURIComponent(refresh_token)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Strava Token-Erneuerung fehlgeschlagen');
  return res.json();
}

export async function getValidToken(): Promise<StravaToken | null> {
  const stored = await getStoredToken();
  if (!stored) return null;

  // 5-Minuten-Puffer: Token vor Ablauf erneuern
  const nowPlusPuffer = Math.floor(Date.now() / 1000) + 300;
  if (stored.expires_at < nowPlusPuffer) {
    const refreshed = await refreshStravaToken(stored.refresh_token);
    const updated: StravaToken = {
      ...stored,
      access_token: refreshed.access_token,
      expires_at: refreshed.expires_at,
    };
    await saveToken(updated);
    return updated;
  }

  return stored;
}

// ── Aktivitäten abrufen (mit Rate-Limit-Handler) ──────────────────────────

export async function fetchActivitiesPage(token: StravaToken, page: number): Promise<unknown[]> {
  const maxVersuche = 3;
  let wartezeit = 1000; // ms, verdoppelt sich bei jedem Versuch

  for (let versuch = 1; versuch <= maxVersuche; versuch++) {
    const params = new URLSearchParams({
      action: 'activities',
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_at: String(token.expires_at),
      page: String(page),
      per_page: '200',
    });
    const res = await fetch(`${VERCEL_PROXY_URL}/api/strava?${params}`);

    // Rate-Limit: Exponential Backoff
    if (res.status === 429) {
      if (versuch === maxVersuche)
        throw new Error('Strava Rate-Limit erreicht — bitte später erneut versuchen');
      await new Promise((r) => setTimeout(r, wartezeit));
      wartezeit *= 2;
      continue;
    }

    if (!res.ok) throw new Error(`Strava-API Fehler: ${res.status}`);

    // Proxy erneuert Token automatisch und gibt neue Werte per Header zurück
    const newAccessToken = res.headers.get('X-New-Access-Token');
    const newExpiresAt = res.headers.get('X-New-Expires-At');
    if (newAccessToken && newExpiresAt) {
      await saveToken({
        ...token,
        access_token: newAccessToken,
        expires_at: Number(newExpiresAt),
      });
    }

    return res.json();
  }

  return [];
}

// ── Sync ───────────────────────────────────────────────────────────────────

export async function syncAllActivities(): Promise<SyncResult> {
  const token = await getValidToken();
  if (!token) throw new Error('Kein Strava-Token vorhanden');

  let page = 1;
  let total = 0;
  let synced = 0;

  while (true) {
    const aktivitaeten = await fetchActivitiesPage(token, page);
    if (aktivitaeten.length === 0) break;

    total += aktivitaeten.length;

    // Jede Aktivität in Supabase upserten
    for (const a of aktivitaeten as Record<string, unknown>[]) {
      const { error } = await supabase.from('activities').upsert(
        {
          strava_id: String(a['id']),
          name: a['name'],
          sport_type: normalizeSportType(String(a['type'] ?? '')),
          distance: a['distance'], // Meter, roh
          duration: a['moving_time'],
          date: a['start_date'],
          avg_hr: a['average_heartrate'] ?? null,
          elevation: a['total_elevation_gain'] ?? null,
        },
        { onConflict: 'strava_id' }
      );
      if (!error) synced++;
    }

    page++;
  }

  await updateLastSyncTime();
  return { synced, total };
}

// ── Letzter Sync-Zeitpunkt ─────────────────────────────────────────────────

export async function getLastSyncTime(): Promise<Date | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'strava_last_sync')
    .maybeSingle();
  if (error || !data) return null;
  return new Date(data.value as string);
}

export async function updateLastSyncTime(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('settings').upsert(
    {
      user_id: user.id,
      key: 'strava_last_sync',
      value: new Date().toISOString(),
    },
    { onConflict: 'user_id,key' }
  );
}

// ── Verbindungsstatus ──────────────────────────────────────────────────────

export async function isStravaConnected(): Promise<boolean> {
  const { data, error } = await supabase.from('strava_token').select('access_token').maybeSingle();
  return !error && !!data;
}

export async function disconnectStrava(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('strava_token').delete().eq('user_id', user.id);
  if (error) throw new Error(`Trennen fehlgeschlagen: ${error.message}`);
}

// ── CSV-Import ─────────────────────────────────────────────────────────────

export async function importFromCSV(file: File): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (ergebnis) => {
        const zeilen = ergebnis.data as Record<string, string>[];
        let imported = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const zeile of zeilen) {
          try {
            const rawTyp = zeile['Activity Type'] ?? '';
            const sportType = normalizeSportType(rawTyp);

            const rawDistanz = parseFloat(zeile['Distance'] ?? '0');
            // Schwimmen im Strava-CSV: Distanz in Metern — alle anderen in km
            const distanzInMeter = sportType === 'swim' ? rawDistanz : rawDistanz * 1000;

            const dauer = parseInt(zeile['Moving Time'] ?? '0', 10);
            const datum = zeile['Activity Date'] ?? '';
            const name = zeile['Activity Name'] ?? 'Importiert';

            if (!datum) {
              skipped++;
              continue;
            }

            // Duplikat-Check via UPSERT nach name + date
            const { error } = await supabase.from('activities').upsert(
              {
                name,
                sport_type: sportType,
                distance: distanzInMeter,
                duration: dauer,
                date: datum,
              },
              { onConflict: 'name,date' }
            );

            if (error) {
              errors.push(`${name}: ${error.message}`);
            } else {
              imported++;
            }
          } catch (e) {
            errors.push(`Zeile übersprungen: ${String(e)}`);
            skipped++;
          }
        }

        resolve({ imported, skipped, errors });
      },
      error: (e) => reject(new Error(`CSV-Parsing fehlgeschlagen: ${e.message}`)),
    });
  });
}
