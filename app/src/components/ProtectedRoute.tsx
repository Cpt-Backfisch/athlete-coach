import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Schützt alle Routen, die einen eingeloggten User erfordern.
export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  // Solange die Session beim Start noch geprüft wird → Ladetext zeigen, kein Redirect
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Laden…
      </div>
    );
  }

  // Kein User → zur Login-Seite weiterleiten (replace = kein Eintrag im Browser-Verlauf)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
