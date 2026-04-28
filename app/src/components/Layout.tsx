import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';
import { Toaster } from './ui/sonner';
import { useStravaSync } from '@/hooks/useStravaSync';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { syncAllActivities } from '@/lib/strava';

// App-Shell: Sidebar (Desktop ≥768px) + Content + BottomNav (Mobile <768px)
export function Layout() {
  const { isSyncing, syncResult, error } = useStravaSync();

  useEffect(() => {
    if (error) toast.error('Strava Sync fehlgeschlagen — bitte erneut versuchen');
  }, [error]);

  useEffect(() => {
    if (syncResult && syncResult.synced > 0) {
      toast.success(
        `${syncResult.synced} neue ${syncResult.synced === 1 ? 'Aktivität' : 'Aktivitäten'} geladen`
      );
    }
  }, [syncResult]);

  async function manualSync() {
    try {
      const ergebnis = await syncAllActivities();
      if (ergebnis.synced > 0) {
        toast.success(
          `${ergebnis.synced} neue ${ergebnis.synced === 1 ? 'Aktivität' : 'Aktivitäten'} geladen`
        );
      } else {
        toast.success('Alles aktuell');
      }
    } catch {
      toast.error('Sync fehlgeschlagen — bitte erneut versuchen');
    }
  }

  const { pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: manualSync,
    disabled: isSyncing,
  });

  const isPulling = pullDistance > 0;
  const pullProgress = Math.min(pullDistance / 36, 1); // 36 = THRESHOLD * 0.45

  return (
    <div className="min-h-screen bg-background">
      {/* Pull-to-Refresh Indikator (nur Mobile) */}
      {(isPulling || isRefreshing) && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center md:hidden pointer-events-none"
          style={{ height: isRefreshing ? 48 : Math.max(pullDistance, 0) }}
        >
          <RefreshCw
            size={20}
            className={`text-primary transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              opacity: isRefreshing ? 1 : pullProgress,
              transform: `rotate(${pullProgress * 180}deg)`,
            }}
          />
        </div>
      )}

      {/* Mobile Top-Header mit Wortmarke */}
      <MobileHeader />

      {/* Desktop-Sidebar */}
      <Sidebar isSyncing={isSyncing} />

      {/* Haupt-Content — auf Mobile Abstand zum Top-Header, auf Desktop zur Sidebar */}
      <main
        className="md:ml-[220px] px-4 pb-20 pt-[52px] md:px-6 md:pb-6 md:pt-6 transition-transform"
        style={isPulling ? { transform: `translateY(${pullDistance}px)` } : undefined}
      >
        <Outlet />
      </main>

      {/* Mobile Bottom-Navigation */}
      <BottomNav />

      {/* Globaler Toast-Container */}
      <Toaster />
    </div>
  );
}
