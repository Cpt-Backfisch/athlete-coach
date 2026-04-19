import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ShareProvider } from '@/contexts/ShareContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { ImportPage } from '@/pages/ImportPage';
import { ActivitiesPage } from '@/pages/ActivitiesPage';
import { ActivityDetailPage } from '@/pages/ActivityDetailPage';
import { TrainingPage } from '@/pages/TrainingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EventsPage } from '@/pages/EventsPage';
import { CoachPage } from '@/pages/CoachPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { SharePage } from '@/pages/SharePage';

// ── App ────────────────────────────────────────────────────────────────────

// HashRouter ist nötig, weil GitHub Pages kein server-seitiges Routing unterstützt.
// Alle Routen laufen unter /athlete-coach/app/#/<route>.
function App() {
  return (
    <Routes>
      {/* Öffentliche Routen (kein Layout, kein Login) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/share" element={<SharePage />} />

      {/* Geschützte Routen mit App-Shell (Sidebar / BottomNav) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/activities/:id" element={<ActivityDetailPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/coach" element={<CoachPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

// ── Root mit Providern ────────────────────────────────────────────────────

export function AppWithProviders() {
  return (
    <AuthProvider>
      <HashRouter>
        <ShareProvider>
          <App />
        </ShareProvider>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
