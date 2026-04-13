// @ts-check
import { test, expect } from '@playwright/test';

const SUPABASE_HOST = 'https://cpzdqgrqodvwtnqmusso.supabase.co';

/**
 * Mockt alle Supabase-REST-Anfragen mit leeren Antworten.
 * Verhindert echte DB-Aufrufe in Tests — keine Testdaten in der Produktions-DB.
 */
async function mockSupabaseRest(page) {
  await page.route(`${SUPABASE_HOST}/rest/v1/**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    })
  );
  // Auth-Refresh-Endpunkt mocken (falls SDK Token aufzufrischen versucht)
  await page.route(`${SUPABASE_HOST}/auth/v1/token**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock_access_token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock_refresh_token',
        user: { id: 'mock-user-id', email: 'mock@example.com', role: 'authenticated' },
      }),
    })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 1: App lädt ohne JS-Fehler
// ─────────────────────────────────────────────────────────────────────────────
test('App lädt ohne console.error', async ({ page }) => {
  const jsErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') jsErrors.push(msg.text());
  });
  page.on('pageerror', (err) => jsErrors.push(err.message));

  // '' → baseURL selbst (https://cpt-backfisch.github.io/athlete-coach)
  await page.goto('');
  await page.waitForLoadState('networkidle');

  // Harmlose Browser-Fehler herausfiltern:
  // - Netzwerkfehler (CDN, externe Ressourcen)
  // - 404-Fehler ohne Kontext (z.B. Service-Worker-Probe)
  // - Supabase-Verbindungsfehler (kein Token → expect)
  const criticalErrors = jsErrors.filter(
    (e) =>
      !e.includes('net::ERR_') &&
      !e.includes('Failed to fetch') &&
      !e.includes('Failed to load resource') &&
      !e.includes('ERR_INTERNET_DISCONNECTED') &&
      !e.includes('favicon')
  );

  expect(criticalErrors, `Unerwartete JS-Fehler:\n${criticalErrors.join('\n')}`).toHaveLength(0);
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 2: Login-Screen erscheint wenn nicht eingeloggt
// ─────────────────────────────────────────────────────────────────────────────
test('Login-Screen erscheint ohne aktive Session', async ({ page }) => {
  // Frischer Browser-Kontext → kein Auth-Token im localStorage
  await page.goto('');
  await page.waitForLoadState('networkidle');

  // Die App zeigt den Login-Screen, wenn keine Session gefunden wird.
  // showLoginScreen() ist async (wartet auf Supabase-Init), daher großzügiger Timeout.
  const loginEmail = page.locator('#login-email');
  await expect(loginEmail).toBeVisible({ timeout: 10000 });

  const loginBtn = page.getByRole('button', { name: 'Anmelden' });
  await expect(loginBtn).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 3: Dashboard rendert nach Mock-Login (Supabase-Calls gemockt)
// ─────────────────────────────────────────────────────────────────────────────
test('Dashboard rendert nach Mock-Login', async ({ page }) => {
  // Fake Supabase-Session in localStorage setzen (vor Navigation).
  // Supabase JS v2 liest den Token aus localStorage ohne Netzwerkaufruf,
  // solange expires_at > aktuelle Zeit + 60 Sek.
  await page.addInitScript(() => {
    const fakeSession = {
      access_token: 'fake-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'fake-refresh-token',
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'test@athlete.coach',
        email_confirmed_at: '2024-01-01T00:00:00.000Z',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      },
    };
    localStorage.setItem('sb-cpzdqgrqodvwtnqmusso-auth-token', JSON.stringify(fakeSession));
  });

  await mockSupabaseRest(page);
  await page.goto('');
  await page.waitForLoadState('networkidle');

  // Login-Screen darf NICHT erscheinen
  await expect(page.locator('#login-email')).not.toBeVisible({ timeout: 5000 });

  // Dashboard-Navigation ist aktiv
  const navDashboard = page.locator('#nav-dashboard');
  await expect(navDashboard).toHaveClass(/active/, { timeout: 10000 });

  // Seiteninhalt wurde gerendert (nicht leer)
  const pageContent = page.locator('#page-content');
  await expect(pageContent).not.toBeEmpty({ timeout: 8000 });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 4: Share-Link öffnet Read-Only-View (?share=TOKEN)
// ─────────────────────────────────────────────────────────────────────────────
test('Share-Link öffnet Read-Only-Ansicht', async ({ page }) => {
  const FAKE_TOKEN = 'smoke-test-readonly-token';
  const TEST_UID = '00000000-0000-0000-0000-000000000002';

  // Supabase-REST-Calls selektiv mocken
  await page.route(`${SUPABASE_HOST}/rest/v1/**`, (route) => {
    const url = route.request().url();

    if (url.includes('/public_shares')) {
      // Share-Token als gültig zurückgeben (PostgREST single()-Format: direkt Objekt)
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user_id: TEST_UID }),
      });
    }

    // Datentabellen (activities, races, past_results, week_frame, ...):
    // App erwartet {data: "<JSON-String>"}  — leere JSON-Arrays als Inhalt.
    // Ohne korrektes Format wirft JSON.parse(undefined) → loadShareData gibt null zurück.
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: '[]' }),
    });
  });

  // '?share=TOKEN' löst zu baseURL + Query auf, kein führendes '/'
  await page.goto(`?share=${FAKE_TOKEN}`);
  await page.waitForLoadState('networkidle');

  // "Nur-Lese-Ansicht"-Banner muss sichtbar sein
  const readOnlyBanner = page.getByText('Nur-Lese-Ansicht');
  await expect(readOnlyBanner).toBeVisible({ timeout: 12000 });

  // Login-Screen darf nicht erscheinen
  await expect(page.locator('#login-email')).not.toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 5: PWA-Manifest ist valide und abrufbar
// ─────────────────────────────────────────────────────────────────────────────
test('PWA-Manifest ist valide', async ({ page }) => {
  await page.goto('');
  // Warten bis DOM vollständig geparst ist
  await page.waitForLoadState('domcontentloaded');

  // <link rel="manifest"> muss im DOM vorhanden sein
  const manifestHref = await page.evaluate(() => {
    const link = document.querySelector('link[rel="manifest"]');
    return link ? link.getAttribute('href') : null;
  });

  expect(manifestHref, '<link rel="manifest"> nicht gefunden').not.toBeNull();

  // Das Manifest ist als data-URI eingebettet
  expect(manifestHref, 'Manifest-href ist keine data:application/json URI').toMatch(
    /^data:application\/json/
  );

  // Manifest JSON dekodieren und validieren
  const manifest = await page.evaluate(() => {
    const link = document.querySelector('link[rel="manifest"]');
    if (!link) return null;
    const href = link.getAttribute('href');
    const base64 = href.split(',')[1];
    try {
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  });

  expect(manifest, 'Manifest-JSON konnte nicht geparst werden').not.toBeNull();

  // Pflichtfelder laut Web-App-Manifest-Spezifikation
  expect(manifest).toHaveProperty('name');
  expect(manifest).toHaveProperty('start_url');
  expect(manifest).toHaveProperty('display');

  expect(manifest.name).toBeTruthy();
  expect(['standalone', 'fullscreen', 'minimal-ui', 'browser']).toContain(manifest.display);
});
