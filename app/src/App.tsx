import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { ImportPage } from '@/pages/ImportPage';
import { ActivitiesPage } from '@/pages/ActivitiesPage';
import { ActivityDetailPage } from '@/pages/ActivityDetailPage';
import { TrainingPage } from '@/pages/TrainingPage';

// ── Platzhalter-Seiten (werden in späteren Schritten ersetzt) ──────────────

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
      {title} — kommt in einem späteren Schritt
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────

// HashRouter ist nötig, weil GitHub Pages kein server-seitiges Routing unterstützt.
// Alle Routen laufen unter /athlete-coach/app/#/<route>.
function App() {
  return (
    <Routes>
      {/* Öffentliche Routen (kein Layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Geschützte Routen mit App-Shell (Sidebar / BottomNav) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Placeholder title="Dashboard" />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/activities/:id" element={<ActivityDetailPage />} />
          <Route path="/events" element={<Placeholder title="Events" />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/coach" element={<Placeholder title="Coach" />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/settings" element={<Placeholder title="Einstellungen" />} />
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
        <App />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
