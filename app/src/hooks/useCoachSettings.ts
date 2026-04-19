import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const DEFAULT_SYSTEM_PROMPT =
  'Du bist ein erfahrener Ausdauer-Coach. Analysiere die Trainingsdaten des Athleten und gib konkrete, motivierende Empfehlungen. Antworte auf Deutsch. Sei präzise und direkt — keine langen Einleitungen.';

// ── Settings aus Supabase laden und speichern ──────────────────────────────
// Die settings-Tabelle hat pro User eine Zeile mit einem JSON-data-Blob.

async function ladeSettings(): Promise<Record<string, unknown>> {
  const { data } = await supabase.from('settings').select('data').maybeSingle();
  if (!data) return {};
  return JSON.parse((data as { data: string }).data ?? '{}');
}

async function speichereSettings(patch: Record<string, unknown>): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');

  const vorher = await ladeSettings();
  const neu = { ...vorher, ...patch };

  await supabase
    .from('settings')
    .upsert({ user_id: user.id, data: JSON.stringify(neu) }, { onConflict: 'user_id' });
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useCoachSettings() {
  const [contextWeeks, setContextWeeks] = useState<number>(8);
  const [systemPrompt, setSystemPrompt] = useState<string>(DEFAULT_SYSTEM_PROMPT);
  const [athleteName, setAthleteName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ladeSettings().then((cfg) => {
      if (typeof cfg.coach_context_weeks === 'number') setContextWeeks(cfg.coach_context_weeks);
      if (typeof cfg.coach_system_prompt === 'string') setSystemPrompt(cfg.coach_system_prompt);
      if (typeof cfg.athlete_name === 'string') setAthleteName(cfg.athlete_name);
      setIsLoading(false);
    });
  }, []);

  const updateContextWeeks = useCallback(async (weeks: number) => {
    setContextWeeks(weeks);
    await speichereSettings({ coach_context_weeks: weeks });
  }, []);

  const updateSystemPrompt = useCallback(async (prompt: string) => {
    setSystemPrompt(prompt);
    await speichereSettings({ coach_system_prompt: prompt });
  }, []);

  const updateAthleteName = useCallback(async (name: string) => {
    setAthleteName(name);
    await speichereSettings({ athlete_name: name });
  }, []);

  return {
    contextWeeks,
    systemPrompt,
    athleteName,
    updateContextWeeks,
    updateSystemPrompt,
    updateAthleteName,
    isLoading,
  };
}
