import { useEffect, useState } from 'react';
import { isStravaConnected, getLastSyncTime, syncAllActivities } from '@/lib/strava';
import type { SyncResult } from '@/lib/strava';

// Prüft beim App-Start ob ein Auto-Sync nötig ist (>60 Minuten seit letztem Sync).
// Wird einmalig pro Session ausgeführt — nur in Layout.tsx einbinden.
export function useStravaSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function pruefeUndSync() {
      try {
        const verbunden = await isStravaConnected();
        if (!verbunden) return;

        const letzterSync = await getLastSyncTime();
        if (letzterSync) {
          const minutenSeitSync = (Date.now() - letzterSync.getTime()) / 1000 / 60;
          if (minutenSeitSync < 60) return; // Zu früh für nächsten Sync
        }

        setIsSyncing(true);
        const ergebnis = await syncAllActivities();
        setSyncResult(ergebnis);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Sync fehlgeschlagen');
      } finally {
        setIsSyncing(false);
      }
    }

    pruefeUndSync();
    // Leeres Dependency-Array: nur einmal beim Mount ausführen
  }, []);

  return { isSyncing, syncResult, error };
}
