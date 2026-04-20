import { saveToken } from './strava';

const STRAVA_CLIENT_ID = '216084';
const VERCEL_PROXY_URL = 'https://athlete-coach-proxy-rnuy.vercel.app';

// ── OAuth-Flow ─────────────────────────────────────────────────────────────

// Leitet den User zur Strava-OAuth-Seite weiter.
// redirect_uri zeigt auf /#/import — wichtig für den HashRouter.
// import.meta.env.BASE_URL wird von Vite auf '/athlete-coach/app/' gesetzt (GitHub Pages).
export function initiateStravaOAuth(): void {
  const base = import.meta.env.BASE_URL ?? '/';
  const redirectUri = `${window.location.origin}${base}#/import`;

  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'read,activity:read_all',
  });

  window.location.href = `https://www.strava.com/oauth/authorize?${params}`;
}

// Tauscht den OAuth-Code gegen Access- und Refresh-Token über den Vercel-Proxy.
// TODO (Fix-PR): Debug-Logs entfernen
export async function handleOAuthCallback(code: string): Promise<void> {
  console.log('[strava-oauth] URL beim Callback:', window.location.href);
  console.log(
    '[strava-oauth] Query-Params:',
    Object.fromEntries(new URLSearchParams(window.location.search))
  );
  console.log('[strava-oauth] Hash:', window.location.hash);

  const url = `${VERCEL_PROXY_URL}/api/strava?action=exchange&code=${encodeURIComponent(code)}`;
  console.log('[strava-oauth] Proxy-Call an:', url);

  try {
    const res = await fetch(url);
    console.log('[strava-oauth] Response status:', res.status, 'body:', await res.clone().text());

    if (!res.ok) throw new Error('OAuth-Austausch fehlgeschlagen');

    const daten = await res.json();

    await saveToken({
      access_token: daten.access_token,
      refresh_token: daten.refresh_token,
      expires_at: daten.expires_at,
    });
  } catch (err) {
    console.error('[strava-oauth] Fehler:', err);
    throw err;
  }
}
