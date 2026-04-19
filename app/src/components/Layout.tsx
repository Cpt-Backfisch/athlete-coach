import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Toaster } from './ui/sonner';

// App-Shell: Sidebar (Desktop ≥768px) + Content + BottomNav (Mobile <768px)
export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop-Sidebar */}
      <Sidebar />

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
