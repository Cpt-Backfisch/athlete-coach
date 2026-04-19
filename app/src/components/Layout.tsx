import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { toast } from 'sonner';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Toaster } from './ui/sonner';
import { useStravaSync } from '@/hooks/useStravaSync';

// App-Shell: Sidebar (Desktop ≥768px) + Content + BottomNav (Mobile <768px)
export function Layout() {
  const { isSyncing, error } = useStravaSync();

  // Sync-Fehler als Toast anzeigen
  useEffect(() => {
    if (error) toast.error(`Strava Sync: ${error}`);
  }, [error]);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop-Sidebar */}
      <Sidebar isSyncing={isSyncing} />

      {/* Haupt-Content — auf Desktop Abstand zur Sidebar lassen */}
      <main className="md:ml-[220px] px-4 pb-20 pt-4 md:px-6 md:pb-6 md:pt-6">
        <Outlet />
      </main>

      {/* Mobile Bottom-Navigation */}
      <BottomNav />

      {/* Globaler Toast-Container */}
      <Toaster />
    </div>
  );
}
