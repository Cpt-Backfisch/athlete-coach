import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  isStravaConnected,
  getLastSyncTime,
  syncAllActivities,
  disconnectStrava,
  importFromCSV,
} from '@/lib/strava';
import { initiateStravaOAuth, handleOAuthCallback } from '@/lib/stravaOAuth';
import type { SyncResult, ImportResult } from '@/lib/strava';

// ── Hilfsfunktion: Minuten-Ago-Text ───────────────────────────────────────

function vorWieVieleMinuten(datum: Date | null): string {
  if (!datum) return 'Noch nie';
  const minuten = Math.round((Date.now() - datum.getTime()) / 1000 / 60);
  if (minuten < 1) return 'Gerade eben';
  if (minuten === 1) return 'vor 1 Minute';
  return `vor ${minuten} Minuten`;
}

// ── OAuth-Code aus HashRouter-URL extrahieren ─────────────────────────────
// HashRouter erzeugt URLs wie: /#/import?code=XXX&scope=...
// Der Code steht im window.location.hash nach dem Fragezeichen.

function extractOAuthCode(): string | null {
  const hash = window.location.hash; // z.B. "#/import?code=abc123&scope=..."
  const fragezeichenIndex = hash.indexOf('?');
  if (fragezeichenIndex === -1) return null;
  const params = new URLSearchParams(hash.slice(fragezeichenIndex + 1));
  return params.get('code');
}

// ── ImportPage ─────────────────────────────────────────────────────────────

export function ImportPage() {
  const [verbunden, setVerbunden] = useState<boolean | null>(null);
  const [letzterSync, setLetzterSync] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncErgebnis, setSyncErgebnis] = useState<SyncResult | null>(null);
  const [csvLaed, setCsvLaed] = useState(false);
  const [csvErgebnis, setCsvErgebnis] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status beim Mount laden + OAuth-Callback verarbeiten
  useEffect(() => {
    ladeStatus();
    verarbeiteOAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ladeStatus() {
    const [istVerbunden, syncZeit] = await Promise.all([isStravaConnected(), getLastSyncTime()]);
    setVerbunden(istVerbunden);
    setLetzterSync(syncZeit);
  }

  // Prüft ob Strava einen code= Parameter in der URL hinterlassen hat
  async function verarbeiteOAuthCallback() {
    const code = extractOAuthCode();
    if (!code) return;

    // Code sofort aus der URL entfernen (verhindert doppelte Verarbeitung bei Reload)
    window.history.replaceState(null, '', '/#/import');

    try {
      await handleOAuthCallback(code);
      toast.success('Strava erfolgreich verbunden!');
      setVerbunden(true);
      // Direkt nach dem Verbinden synchronisieren
      await starteSync();
    } catch {
      toast.error('Verbindung fehlgeschlagen — bitte erneut versuchen');
    }
  }

  async function starteSync() {
    setSyncing(true);
    setSyncErgebnis(null);
    try {
      const ergebnis = await syncAllActivities();
      setSyncErgebnis(ergebnis);
      setLetzterSync(new Date());
      toast.success(`${ergebnis.synced} Einheiten synchronisiert`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Sync fehlgeschlagen');
    } finally {
      setSyncing(false);
    }
  }

  async function handleTrennen() {
    try {
      await disconnectStrava();
      setVerbunden(false);
      setLetzterSync(null);
      setSyncErgebnis(null);
      toast.success('Strava-Verbindung getrennt');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Trennen fehlgeschlagen');
    }
  }

  async function handleDatei(datei: File) {
    if (!datei.name.endsWith('.csv')) {
      toast.error('Nur CSV-Dateien werden unterstützt');
      return;
    }
    setCsvLaed(true);
    setCsvErgebnis(null);
    try {
      const ergebnis = await importFromCSV(datei);
      setCsvErgebnis(ergebnis);
      toast.success(`${ergebnis.imported} Einheiten importiert`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Import fehlgeschlagen');
    } finally {
      setCsvLaed(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const datei = e.dataTransfer.files[0];
    if (datei) handleDatei(datei);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const datei = e.target.files?.[0];
    if (datei) handleDatei(datei);
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-semibold">Import</h1>

      {/* ── Sektion 1: Strava-Verbindung ── */}
      <section className="rounded-[12px] border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Strava</h2>
          {verbunden === null ? (
            <span className="text-xs text-muted-foreground">Laden…</span>
          ) : verbunden ? (
            <span className="rounded-full bg-green-500/15 px-3 py-0.5 text-xs font-medium text-green-500">
              Verbunden
            </span>
          ) : (
            <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
              Nicht verbunden
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Letzter Sync: {vorWieVieleMinuten(letzterSync)}
        </p>

        {syncErgebnis && (
          <p className="text-sm text-muted-foreground">
            {syncErgebnis.synced} von {syncErgebnis.total} Einheiten synchronisiert
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {!verbunden && (
            <button
              onClick={initiateStravaOAuth}
              className="rounded-lg bg-[#FC4C02] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Mit Strava verbinden
            </button>
          )}
          {verbunden && (
            <>
              <button
                onClick={starteSync}
                disabled={syncing}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                {syncing ? 'Synchronisiere…' : 'Jetzt synchronisieren'}
              </button>
              <button
                onClick={handleTrennen}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                Verbindung trennen
              </button>
            </>
          )}
        </div>
      </section>

      {/* ── Sektion 2: CSV-Import ── */}
      <section className="rounded-[12px] border border-border bg-card p-5 space-y-4">
        <h2 className="font-medium">CSV-Archiv importieren</h2>

        {/* Drag-and-Drop-Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={[
            'flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-10 gap-3 transition-colors',
            dragOver ? 'border-[#8E6FE0] bg-[#8E6FE0]/5' : 'border-border',
          ].join(' ')}
        >
          <p className="text-sm text-muted-foreground">CSV-Datei hierher ziehen oder auswählen</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={csvLaed}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            {csvLaed ? 'Importiere…' : 'Datei auswählen'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {/* Import-Ergebnis */}
        {csvErgebnis && (
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">{csvErgebnis.imported}</span> Einheiten importiert,{' '}
              <span className="font-medium">{csvErgebnis.skipped}</span> übersprungen
            </p>
            {csvErgebnis.errors.length > 0 && (
              <ul className="space-y-1">
                {csvErgebnis.errors.map((err, i) => (
                  <li key={i} className="text-xs text-destructive">
                    {err}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* ── Sektion 3: Hinweis ── */}
      <p className="text-xs text-muted-foreground">
        CSV-Export aus Strava: Mein Profil → Einstellungen → Meine Daten → Archiv anfordern
      </p>
    </div>
  );
}
