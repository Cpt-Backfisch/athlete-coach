/* eslint-disable react-refresh/only-export-components */
// ShareProvider und useShare absichtlich in einer Datei — übliches Context-Muster
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// ── Typen ──────────────────────────────────────────────────────────────────

interface ShareContextType {
  isShareMode: boolean;
  shareToken: string | null;
  ownerUserId: string | null;
  isLoading: boolean;
}

// ── Context ────────────────────────────────────────────────────────────────

const ShareContext = createContext<ShareContextType>({
  isShareMode: false,
  shareToken: null,
  ownerUserId: null,
  isLoading: true,
});

// ── Token aus URL-Hash extrahieren ─────────────────────────────────────────

// URL-Format: /#/share?token=XXX
function extractShareToken(): string | null {
  const hash = window.location.hash; // z.B. "#/share?token=abc123"
  if (!hash.startsWith('#/share')) return null;
  const qIndex = hash.indexOf('?');
  if (qIndex === -1) return null;
  const params = new URLSearchParams(hash.slice(qIndex + 1));
  return params.get('token');
}

// ── Provider ───────────────────────────────────────────────────────────────

export function ShareProvider({ children }: { children: React.ReactNode }) {
  const [isShareMode, setIsShareMode] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [ownerUserId, setOwnerUserId] = useState<string | null>(null);
  // Startwert: true wenn ein Token in der URL steht (dann muss geladen werden), sonst false
  const [isLoading, setIsLoading] = useState(() => extractShareToken() !== null);

  useEffect(() => {
    const token = extractShareToken();

    if (!token) {
      return;
    }

    // Owner-User-ID aus public_shares laden
    supabase
      .from('public_shares')
      .select('user_id')
      .eq('token', token)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.user_id) {
          setIsShareMode(true);
          setShareToken(token);
          setOwnerUserId((data as { user_id: string }).user_id);
        }
        // Kein Eintrag → ungültiger Token, isShareMode bleibt false
        setIsLoading(false);
      });
  }, []);

  return (
    <ShareContext.Provider value={{ isShareMode, shareToken, ownerUserId, isLoading }}>
      {children}
    </ShareContext.Provider>
  );
}

export function useShare() {
  return useContext(ShareContext);
}
