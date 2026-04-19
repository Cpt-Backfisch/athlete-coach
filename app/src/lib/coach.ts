import { supabase } from './supabase';
import { fetchActivities } from './activities';
import { fetchUpcomingRaces } from './events';
import { fetchWeekPlan } from './weekFrame';
import type { Activity } from './activities';
import type { Race } from './events';
import type { WeekGoals } from './weekFrame';

const VERCEL_PROXY_URL = 'https://athlete-coach-proxy-rnuy.vercel.app';

// ── Typen ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CoachContext {
  recentActivities: Activity[];
  upcomingRaces: Race[];
  weekGoals: WeekGoals;
  athleteName: string;
  contextWeeks: number;
}

// ── Hilfsfunktionen ────────────────────────────────────────────────────────

// Pace für Laufen: m/s → „mm:ss /km"
function formatPaceRun(speedMs: number): string {
  if (!speedMs) return '';
  const secsPerKm = 1000 / speedMs;
  const min = Math.floor(secsPerKm / 60);
  const sek = Math.round(secsPerKm % 60);
  return `${min}:${String(sek).padStart(2, '0')} /km`;
}

// Dauer in Sekunden → „h:mm" oder „mm min"
function formatDauer(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')} h`;
  return `${m} min`;
}

// ── Kontext aufbauen ───────────────────────────────────────────────────────

export async function buildCoachContext(contextWeeks: number): Promise<CoachContext> {
  const cutoff = new Date(Date.now() - contextWeeks * 7 * 24 * 60 * 60 * 1000);

  const [alleAktivitaeten, upcomingRaces, weekPlan, settingsRes] = await Promise.all([
    fetchActivities(),
    fetchUpcomingRaces(),
    fetchWeekPlan(),
    supabase.from('settings').select('data').maybeSingle(),
  ]);

  const cfg = JSON.parse((settingsRes.data as { data?: string } | null)?.data ?? '{}');
  const athleteName: string = cfg.athlete_name ?? '';

  const recentActivities = alleAktivitaeten.filter((a) => new Date(a.date) >= cutoff);

  return {
    recentActivities,
    upcomingRaces,
    weekGoals: weekPlan.goals,
    athleteName,
    contextWeeks,
  };
}

// ── Kontext als Text formatieren ───────────────────────────────────────────

export function formatContextForClaude(ctx: CoachContext): string {
  const { recentActivities, upcomingRaces, weekGoals, athleteName, contextWeeks } = ctx;

  const sportLabel: Record<string, string> = {
    run: 'Laufen',
    bike: 'Rad',
    swim: 'Schwimmen',
    misc: 'Sonstiges',
  };

  // Aktivitäten-Zeilen
  const aktZeilen = recentActivities
    .slice(0, 50)
    .map((a) => {
      const sport = sportLabel[a.sport_type] ?? a.sport_type;
      const distKm = a.distance ? (a.distance / 1000).toFixed(1) + ' km' : '';
      const dur = a.duration ? formatDauer(a.duration) : '';
      const speedMs = a.distance && a.duration ? a.distance / a.duration : 0;
      const pace = a.sport_type === 'run' && speedMs ? formatPaceRun(speedMs) : '';
      const speed = a.sport_type === 'bike' && speedMs ? (speedMs * 3.6).toFixed(1) + ' km/h' : '';
      const hr = a.avg_hr ? `HF ${Math.round(a.avg_hr)}` : '';
      const teile = [distKm, dur, pace || speed, hr].filter(Boolean).join(' · ');
      return `• ${a.date} — ${sport} — ${a.name || ''}${teile ? ' — ' + teile : ''}`;
    })
    .join('\n');

  // Wochensummen (nur aktuelle Woche)
  const heute = new Date();
  const wochentag = heute.getDay() || 7;
  const montag = new Date(heute);
  montag.setDate(heute.getDate() - (wochentag - 1));
  montag.setHours(0, 0, 0, 0);

  const dieseWoche = recentActivities.filter((a) => new Date(a.date) >= montag);
  const summen: Record<string, { km: number; m: number; h: number; n: number }> = {};
  for (const a of dieseWoche) {
    if (!summen[a.sport_type]) summen[a.sport_type] = { km: 0, m: 0, h: 0, n: 0 };
    if (a.sport_type === 'swim') summen[a.sport_type].m += a.distance;
    else summen[a.sport_type].km += a.distance / 1000;
    summen[a.sport_type].h += a.duration / 3600;
    summen[a.sport_type].n++;
  }
  const wochenZeilen = Object.entries(summen)
    .map(([s, v]) => {
      const sport = sportLabel[s] ?? s;
      const dist = s === 'swim' ? `${Math.round(v.m)} m` : `${v.km.toFixed(1)} km`;
      return `${sport}: ${dist} · ${v.h.toFixed(1)} h · ${v.n} Einheiten`;
    })
    .join('\n');

  // Wochenziele
  const zielZeilen = [
    weekGoals.run_km ? `Laufen: ${weekGoals.run_km} km Ziel` : null,
    weekGoals.run_sessions ? `Laufen: ${weekGoals.run_sessions} Sessions Ziel` : null,
    weekGoals.bike_km ? `Rad: ${weekGoals.bike_km} km Ziel` : null,
    weekGoals.bike_sessions ? `Rad: ${weekGoals.bike_sessions} Sessions Ziel` : null,
    weekGoals.swim_m ? `Schwimmen: ${weekGoals.swim_m} m Ziel` : null,
    weekGoals.swim_sessions ? `Schwimmen: ${weekGoals.swim_sessions} Sessions Ziel` : null,
    weekGoals.total_hours ? `Gesamt: ${weekGoals.total_hours} h Ziel` : null,
  ]
    .filter(Boolean)
    .join('\n');

  // Wettkämpfe
  const raceZeilen = upcomingRaces
    .slice(0, 5)
    .map((r) => {
      const tage = Math.round((new Date(r.date).getTime() - Date.now()) / 86400000);
      return `• ${r.date} — ${r.name}${r.goal ? ' — Ziel: ' + r.goal : ''} (in ${tage} Tagen)`;
    })
    .join('\n');

  return [
    `Athlet: ${athleteName || 'unbekannt'}`,
    `Zeitraum: letzte ${contextWeeks} Wochen`,
    '',
    'Trainingsübersicht:',
    aktZeilen || '(keine Aktivitäten)',
    '',
    'Wochensummen (aktuelle Woche):',
    wochenZeilen || '(noch keine Einheiten diese Woche)',
    '',
    'Wochenziele:',
    zielZeilen || '(keine Ziele gesetzt)',
    '',
    'Nächste Wettkämpfe:',
    raceZeilen || '(keine)',
  ].join('\n');
}

// ── Chat-Nachricht senden ──────────────────────────────────────────────────

export async function sendChatMessage(
  messages: ChatMessage[],
  systemPrompt: string,
  contextWeeks: number
): Promise<string> {
  const ctx = await buildCoachContext(contextWeeks);
  const context = formatContextForClaude(ctx);

  const res = await fetch(`${VERCEL_PROXY_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt, context }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.content as string;
}
