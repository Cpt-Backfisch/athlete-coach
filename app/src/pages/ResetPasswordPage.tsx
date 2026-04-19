import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  // Zustand B: Supabase setzt nach Klick auf den E-Mail-Link eine aktive Session
  const [hasActiveSession, setHasActiveSession] = useState(false);

  // Zustand A — E-Mail eingeben
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);

  // Zustand B — Neues Passwort setzen
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  useEffect(() => {
    // Prüfen ob Supabase nach dem Reset-Link-Klick eine aktive Session gesetzt hat.
    // Der URL-Hash enthält in diesem Fall #access_token=...
    const hasToken = window.location.hash.includes('access_token');
    if (!hasToken) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setHasActiveSession(true);
    });
  }, []);

  // Zustand A: Reset-E-Mail anfordern
  async function handleRequestLink(e: React.FormEvent) {
    e.preventDefault();
    setEmailError('');
    setIsEmailSubmitting(true);

    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch {
      setEmailError('Fehler beim Senden. Bitte versuche es erneut.');
    } finally {
      setIsEmailSubmitting(false);
    }
  }

  // Zustand B: Neues Passwort speichern
  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');

    // Clientseitige Validierung
    if (newPassword.length < 8) {
      setPasswordError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Die Passwörter stimmen nicht überein.');
      return;
    }

    setIsPasswordSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSaved(true);
      // Nach 2 Sekunden zur Login-Seite weiterleiten
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setPasswordError('Fehler beim Speichern. Bitte versuche es erneut.');
    } finally {
      setIsPasswordSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="pb-4">
          <h1 className="text-center text-2xl font-semibold tracking-tight">
            Passwort zurücksetzen
          </h1>
        </CardHeader>

        <CardContent>
          {/* ── Zustand B: Neues Passwort setzen ── */}
          {hasActiveSession ? (
            passwordSaved ? (
              <p className="text-center text-sm text-muted-foreground">
                Passwort gespeichert! Du wirst weitergeleitet…
              </p>
            ) : (
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Neues Passwort</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isPasswordSubmitting}>
                  {isPasswordSubmitting ? 'Wird gespeichert…' : 'Passwort speichern'}
                </Button>

                {passwordError && (
                  <p className="text-center text-sm text-destructive">{passwordError}</p>
                )}
              </form>
            )
          ) : /* ── Zustand A: E-Mail eingeben ── */
          emailSent ? (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Schau in dein Postfach — du erhältst gleich einen Link.
              </p>
              <p className="text-center text-sm">
                <Link
                  to="/login"
                  className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Zurück zum Login
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleRequestLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isEmailSubmitting}>
                {isEmailSubmitting ? 'Wird gesendet…' : 'Link anfordern'}
              </Button>

              {emailError && <p className="text-center text-sm text-destructive">{emailError}</p>}

              <p className="text-center text-sm">
                <Link
                  to="/login"
                  className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Zurück zum Login
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
