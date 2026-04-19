import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';

// ── Dashboard-Platzhalter (wird in Schritt 8 ersetzt) ──────────────────────

function DashboardPlaceholder() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">Dashboard kommt in Schritt 8.</p>
      <button
        onClick={handleSignOut}
        className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
      >
        Abmelden
      </button>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────

// HashRouter ist nötig, weil GitHub Pages kein server-seitiges Routing unterstützt.
// Alle Routen laufen unter /athlete-coach/app/#/<route>.
export default function App() {
  const { isLoading } = useAuth();

  // Während die Session geprüft wird → keine Routes rendern (verhindert Redirect-Flackern)
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Laden…
      </div>
    );
  }

  return (
    <Routes>
      {/* Öffentliche Routen */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Geschützte Routen */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPlaceholder />} />
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
