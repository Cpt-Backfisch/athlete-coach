import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { isStravaConnected } from '@/lib/strava';
import { sendTelegramTest, checkTelegramStatus } from '@/lib/telegram';
import {
  getSetting,
  setSetting,
  getShareToken,
  createShareToken,
  deleteShareToken,
  getShareUrl,
  registerStravaWebhook,
  getWebhookStatus,
} from '@/lib/settings';
import type { WebhookStatus } from '@/lib/settings';

// ── SettingsPage ──────────────────────────────────────────────────────────

export function SettingsPage() {
  // Profil
  const [athleteName, setAthleteName] = useState('');
  const [nameGespeichert, setNameGespeichert] = useState(false);

  // Strava
  const [stravaVerbunden, setStravaVerbunden] = useState(false);
  const [webhookId, setWebhookId] = useState<string | null>(null);
  const [webhookLaed, setWebhookLaed] = useState(false);
  const [telegramPushEnabled, setTelegramPushEnabled] = useState(true);
  const [telegramWeeklyEnabled, setTelegramWeeklyEnabled] = useState(true);

  // Telegram
  const [telegramKonfiguriert, setTelegramKonfiguriert] = useState<boolean | null>(null);
  const [telegramTestLaed, setTelegramTestLaed] = useState(false);

  // Share-Link
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareLaed, setShareLaed] = useState(false);

  // Account
  const [neueEmail, setNeueEmail] = useState('');
  const [neuesPasswort, setNeuesPasswort] = useState('');
  const [accountLaed, setAccountLaed] = useState(false);
  const [loeschenOffen, setLoeschenOffen] = useState(false);

  // Webhook-Status
  const [webhookStatus, setWebhookStatus] = useState<WebhookStatus | null>(null);
  const [webhookStatusLaed, setWebhookStatusLaed] = useState(false);

  // ── Daten laden ──────────────────────────────────────────────────────────

  const ladeWebhookStatus = useCallback(async () => {
    setWebhookStatusLaed(true);
    const status = await getWebhookStatus();
    setWebhookStatus(status);
    setWebhookStatusLaed(false);
  }, []);

  useEffect(() => {
    async function laden() {
      const [name, whId, pushEnabled, weeklyEnabled, token, stravaOk, tgOk] = await Promise.all([
        getSetting('athlete_name'),
        getSetting('strava_webhook_id'),
        getSetting('telegram_push_enabled'),
        getSetting('telegram_weekly_enabled'),
        getShareToken(),
        isStravaConnected(),
        checkTelegramStatus(),
      ]);

      setAthleteName(name ?? '');
      setWebhookId(whId);
      // Default: true wenn noch nicht gesetzt
      setTelegramPushEnabled(pushEnabled !== 'false');
      setTelegramWeeklyEnabled(weeklyEnabled !== 'false');
      setShareToken(token);
      setStravaVerbunden(stravaOk);
      setTelegramKonfiguriert(tgOk);
    }
    laden();
    ladeWebhookStatus();
  }, [ladeWebhookStatus]);

  // ── Handler ───────────────────────────────────────────────────────────────

  async function handleNameSpeichern() {
    setNameGespeichert(true);
    try {
      await setSetting('athlete_name', athleteName.trim());
      toast.success('Gespeichert');
    } catch (e) {
      toast.error(`Fehler: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setNameGespeichert(false);
    }
  }

  async function handleWebhookRegistrieren() {
    setWebhookLaed(true);
    try {
      const { subscription_id } = await registerStravaWebhook();
      setWebhookId(String(subscription_id));
      toast.success(`Webhook registriert (ID: ${subscription_id})`);
    } catch (e) {
      toast.error(`Fehler: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setWebhookLaed(false);
    }
  }

  async function handleTelegramTest() {
    setTelegramTestLaed(true);
    try {
      await sendTelegramTest();
      toast.success('Test-Nachricht gesendet ✓');
    } catch (e) {
      toast.error(`Fehler: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setTelegramTestLaed(false);
    }
  }

  async function handleShareErstellen() {
    setShareLaed(true);
    try {
      const token = await createShareToken();
      setShareToken(token);
      toast.success('Share-Link erstellt');
    } catch (e) {
      toast.error(`Fehler: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setShareLaed(false);
    }
  }

  async function handleShareLoeschen() {
    setShareLaed(true);
    try {
      await deleteShareToken();
      setShareToken(null);
      toast.success('Link gelöscht');
    } catch (e) {
      toast.error(`Fehler: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setShareLaed(false);
    }
  }

  function handleShareKopieren() {
    if (!shareToken) return;
    navigator.clipboard.writeText(getShareUrl(shareToken)).then(() => {
      toast.success('Link kopiert');
    });
  }

  async function handleEmailAendern() {
    if (!neueEmail.trim()) return;
    setAccountLaed(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: neueEmail.trim() });
      if (error) throw error;
      toast.success('Bestätigungs-E-Mail gesendet');
      setNeueEmail('');
    } catch (e) {
      toast.error(`Fehler: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setAccountLaed(false);
    }
  }

  async function handlePasswortAendern() {
    if (neuesPasswort.length < 8) {
      toast.error('Passwort muss mindestens 8 Zeichen haben');
      return;
    }
    setAccountLaed(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: neuesPasswort });
      if (error) throw error;
      toast.success('Passwort gespeichert');
      setNeuesPasswort('');
    } catch (e) {
      toast.error(`Fehler: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setAccountLaed(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-xl font-semibold">Einstellungen</h1>

      {/* ── Sektion 1: Profil ─────────────────────────────────────── */}
      <Section title="Profil">
        <div className="space-y-1.5">
          <Label htmlFor="s-name">Dein Name</Label>
          <div className="flex gap-2">
            <Input
              id="s-name"
              value={athleteName}
              onChange={(e) => setAthleteName(e.target.value)}
              placeholder="z.B. Sebastian"
              className="max-w-xs"
            />
            <Button onClick={handleNameSpeichern} disabled={nameGespeichert} size="sm">
              Speichern
            </Button>
          </div>
        </div>
      </Section>

      <Separator />

      {/* ── Sektion 2: Strava ─────────────────────────────────────── */}
      <Section title="Strava">
        {/* Verbindungs-Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          {stravaVerbunden ? (
            <StatusBadge color="green">Verbunden</StatusBadge>
          ) : (
            <StatusBadge color="grey">Nicht verbunden</StatusBadge>
          )}
        </div>

        {/* Webhook */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">
              Webhook-ID: <span className="font-mono text-foreground">{webhookId ?? '—'}</span>
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleWebhookRegistrieren}
              disabled={webhookLaed}
            >
              {webhookLaed ? 'Registrieren…' : 'Webhook registrieren'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Der Webhook informiert die App automatisch über neue Einheiten.
          </p>
        </div>

        {/* Telegram-Toggles (nur wenn Strava verbunden) */}
        {stravaVerbunden && (
          <div className="space-y-3 pt-1">
            <ToggleRow
              id="push-toggle"
              label="Coach-Bewertung nach neuer Einheit"
              checked={telegramPushEnabled}
              onCheckedChange={async (v) => {
                setTelegramPushEnabled(v);
                await setSetting('telegram_push_enabled', v ? 'true' : 'false');
              }}
            />
            <ToggleRow
              id="weekly-toggle"
              label="Wöchentliche Zusammenfassung (sonntags)"
              checked={telegramWeeklyEnabled}
              onCheckedChange={async (v) => {
                setTelegramWeeklyEnabled(v);
                await setSetting('telegram_weekly_enabled', v ? 'true' : 'false');
              }}
            />
            <p className="text-xs text-muted-foreground">
              Benötigt konfigurierten Telegram-Bot (in Vercel Env Vars).
            </p>
          </div>
        )}
      </Section>

      <Separator />

      {/* ── Sektion 3: Telegram ───────────────────────────────────── */}
      <Section title="Telegram">
        <div className="flex items-center gap-3 flex-wrap">
          {telegramKonfiguriert === null ? (
            <span className="text-xs text-muted-foreground">Prüfe Status…</span>
          ) : telegramKonfiguriert ? (
            <StatusBadge color="green">Konfiguriert</StatusBadge>
          ) : (
            <StatusBadge color="grey">Nicht konfiguriert</StatusBadge>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleTelegramTest}
            disabled={telegramTestLaed}
          >
            {telegramTestLaed ? 'Senden…' : 'Test-Nachricht senden'}
          </Button>
        </div>
      </Section>

      <Separator />

      {/* ── Sektion 4: Share-Link ─────────────────────────────────── */}
      <Section title="Share-Link">
        {shareToken ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                readOnly
                value={getShareUrl(shareToken)}
                className="text-xs font-mono flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleShareKopieren}
                aria-label="Kopieren"
              >
                <Copy size={14} />
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleShareLoeschen}
              disabled={shareLaed}
              className="text-destructive hover:text-destructive"
            >
              Link löschen
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={handleShareErstellen} disabled={shareLaed}>
            {shareLaed ? 'Erstellen…' : 'Share-Link erstellen'}
          </Button>
        )}
        <p className="text-xs text-muted-foreground pt-1">
          Freunde können mit diesem Link dein Training lesen und kommentieren.
        </p>
      </Section>

      <Separator />

      {/* ── Sektion 5: Account ────────────────────────────────────── */}
      <Section title="Account">
        {/* E-Mail ändern */}
        <div className="space-y-1.5">
          <Label htmlFor="s-email">E-Mail ändern</Label>
          <div className="flex gap-2">
            <Input
              id="s-email"
              type="email"
              value={neueEmail}
              onChange={(e) => setNeueEmail(e.target.value)}
              placeholder="neue@email.de"
              className="max-w-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleEmailAendern}
              disabled={accountLaed || !neueEmail.trim()}
            >
              Ändern
            </Button>
          </div>
        </div>

        {/* Passwort ändern */}
        <div className="space-y-1.5 pt-2">
          <Label htmlFor="s-pw">Passwort ändern</Label>
          <div className="flex gap-2">
            <Input
              id="s-pw"
              type="password"
              value={neuesPasswort}
              onChange={(e) => setNeuesPasswort(e.target.value)}
              placeholder="Neues Passwort (min. 8 Zeichen)"
              className="max-w-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handlePasswortAendern}
              disabled={accountLaed || neuesPasswort.length < 8}
            >
              Ändern
            </Button>
          </div>
        </div>

        {/* Account löschen */}
        <div className="pt-4 space-y-2">
          {!loeschenOffen ? (
            <Button size="sm" variant="destructive" onClick={() => setLoeschenOffen(true)}>
              Account löschen
            </Button>
          ) : (
            <div className="rounded-[10px] border border-red-500/30 bg-red-500/5 p-4 space-y-3">
              <p className="text-sm">
                Möchtest du deinen Account wirklich löschen? Alle deine Daten werden unwiderruflich
                gelöscht.
              </p>
              <p className="text-sm text-muted-foreground">
                Bitte kontaktiere den Support zum Löschen deines Accounts oder lösche ihn direkt im
                Supabase-Dashboard.
              </p>
              <Button size="sm" variant="outline" onClick={() => setLoeschenOffen(false)}>
                Abbrechen
              </Button>
            </div>
          )}
        </div>
      </Section>

      <Separator />

      {/* ── Sektion 6: Webhook-Health ─────────────────────────────── */}
      <Section title="Webhook-Status">
        <div className="space-y-2">
          {webhookStatusLaed ? (
            <p className="text-sm text-muted-foreground">Lädt…</p>
          ) : webhookStatus ? (
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Subscription-ID: </span>
                <span className="font-mono">{webhookStatus.id ?? '—'}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Callback-URL: </span>
                <span className="font-mono text-xs break-all">
                  {webhookStatus.callback_url ?? '—'}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Kein Webhook aktiv</p>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={ladeWebhookStatus}
            disabled={webhookStatusLaed}
            className="flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={webhookStatusLaed ? 'animate-spin' : ''} />
            Status aktualisieren
          </Button>
        </div>
      </Section>
    </div>
  );
}

// ── Teilkomponenten ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function StatusBadge({ color, children }: { color: 'green' | 'grey'; children: React.ReactNode }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${
        color === 'green' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-muted-foreground'
      }`}
    >
      {children}
    </span>
  );
}

function ToggleRow({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id} className="cursor-pointer">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
