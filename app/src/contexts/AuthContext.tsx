/* eslint-disable react-refresh/only-export-components */
// AuthProvider und useAuth absichtlich in einer Datei — übliches Context-Muster
import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// ── Typen ──────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  // true solange die Session beim App-Start noch geprüft wird → verhindert Flackern
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Session beim App-Start wiederherstellen (Feature 1.4)
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });

    // Auth-State-Änderungen (Login, Logout, Token-Refresh) in Echtzeit lauschen
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Email/Passwort-Login (Feature 1.2) — Fehler werden an den Aufrufer weitergegeben
  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  // Logout (Feature 1.5)
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Passwort-Reset-E-Mail anfordern (Feature 1.6, Schritt A)
  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/athlete-coach/app/#/reset-password',
    });
    if (error) throw error;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Custom Hook ────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden');
  return ctx;
}
