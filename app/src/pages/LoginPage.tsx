import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      navigate('/');
    } catch {
      setError('E-Mail oder Passwort falsch.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="space-y-1 pb-4">
          <h1 className="text-center text-3xl font-semibold tracking-tight">athlete.coach</h1>
          <p className="text-center text-sm text-muted-foreground">
            Melde dich an, um dein Training zu sehen
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Anmelden…' : 'Anmelden'}
            </Button>

            {error && <p className="text-center text-sm text-destructive">{error}</p>}

            <p className="text-center text-sm">
              <Link
                to="/reset-password"
                className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Passwort vergessen?
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
