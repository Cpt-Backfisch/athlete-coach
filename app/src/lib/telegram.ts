const VERCEL_PROXY_URL = 'https://athlete-coach-proxy-rnuy.vercel.app';

// Schickt eine Test-Nachricht via Telegram Bot.
export async function sendTelegramTest(): Promise<void> {
  const res = await fetch(`${VERCEL_PROXY_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'telegram_test' }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
}

// Prüft ob Telegram im Proxy konfiguriert ist.
export async function checkTelegramStatus(): Promise<boolean> {
  try {
    const res = await fetch(`${VERCEL_PROXY_URL}/api/chat?action=telegram_status`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.configured === true;
  } catch {
    return false;
  }
}
