import { supabase } from './supabase';

const VERCEL_PROXY_URL = 'https://athlete-coach-proxy-rnuy.vercel.app';

// ── Settings-Blob (eine JSON-Zeile pro User) ───────────────────────────────

async function ladeBlob(): Promise<Record<string, string>> {
  const { data } = await supabase.from('settings').select('data').maybeSingle();
  if (!data) return {};
  try {
    return JSON.parse((data as { data: string }).data) as Record<string, string>;
  } catch {
    return {};
  }
}

async function schreibeBlob(blob: Record<string, string>): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');
  await supabase
    .from('settings')
    .upsert({ user_id: user.id, data: JSON.stringify(blob) }, { onConflict: 'user_id' });
}

// ── Einstellungen ──────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  const blob = await ladeBlob();
  return (blob[key] as string | undefined) ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const blob = await ladeBlob();
  blob[key] = value;
  await schreibeBlob(blob);
}

// ── Share-Link ─────────────────────────────────────────────────────────────

export async function getShareToken(): Promise<string | null> {
  const { data } = await supabase.from('public_shares').select('token').maybeSingle();
  return (data as { token: string } | null)?.token ?? null;
}

export async function createShareToken(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');

  // Kryptografisch sicherer Token (kein Math.random())
  const token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  await supabase
    .from('public_shares')
    .upsert(
      { user_id: user.id, token, created_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  return token;
}

export async function deleteShareToken(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');
  await supabase.from('public_shares').delete().eq('user_id', user.id);
}

export function getShareUrl(token: string): string {
  return `${window.location.origin}/#/share?token=${token}`;
}

// ── Strava Webhook registrieren ────────────────────────────────────────────

export async function registerStravaWebhook(): Promise<{ subscription_id: number }> {
  const callbackUrl = `${VERCEL_PROXY_URL}/api/webhook`;
  const res = await fetch(
    `${VERCEL_PROXY_URL}/api/strava?action=webhook_register&callback_url=${encodeURIComponent(callbackUrl)}&verify_token=athlete_coach_verify`
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { errors?: Array<{ message: string }> }).errors?.[0]?.message ?? `HTTP ${res.status}`
    );
  }

  const data = (await res.json()) as { id?: number; subscription_id?: number };
  const id = data.id ?? data.subscription_id ?? 0;
  await setSetting('strava_webhook_id', String(id));
  return { subscription_id: id };
}

// ── Strava Webhook Status ─────────────────────────────────────────────────

export interface WebhookStatus {
  id?: number;
  callback_url?: string;
  active?: boolean;
}

export async function getWebhookStatus(): Promise<WebhookStatus | null> {
  const res = await fetch(`${VERCEL_PROXY_URL}/api/strava?action=webhook_status`);
  if (!res.ok) return null;
  const data = await res.json();
  // Strava gibt ein Array zurück
  const list = Array.isArray(data) ? data : [];
  return list[0] ?? null;
}
