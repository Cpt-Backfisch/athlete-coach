import { supabase } from './supabase';
import { blobLoadOne, blobSave } from './jsonBlobStore';

// ── Typen ──────────────────────────────────────────────────────────────────

export type SportTag =
  | 'run-easy'
  | 'run-medium'
  | 'run-long'
  | 'run-intervals'
  | 'bike-easy'
  | 'bike-medium'
  | 'bike-long'
  | 'swim-easy'
  | 'swim-medium'
  | 'swim-long'
  | 'strength'
  | 'rest'
  | 'race'
  | 'misc';

export interface DayPlan {
  tags: SportTag[];
}

export interface WeekFrame {
  mon: DayPlan;
  tue: DayPlan;
  wed: DayPlan;
  thu: DayPlan;
  fri: DayPlan;
  sat: DayPlan;
  sun: DayPlan;
}

export interface WeekGoals {
  run_km: number | null;
  run_sessions: number | null;
  bike_km: number | null;
  bike_sessions: number | null;
  swim_m: number | null;
  swim_sessions: number | null;
  total_hours: number | null;
}

export interface WeekPlan {
  frame: WeekFrame;
  goals: WeekGoals;
}

// ── Leerplan-Konstanten ────────────────────────────────────────────────────

export const EMPTY_WEEK_FRAME: WeekFrame = {
  mon: { tags: [] },
  tue: { tags: [] },
  wed: { tags: [] },
  thu: { tags: [] },
  fri: { tags: [] },
  sat: { tags: [] },
  sun: { tags: [] },
};

export const EMPTY_WEEK_GOALS: WeekGoals = {
  run_km: null,
  run_sessions: null,
  bike_km: null,
  bike_sessions: null,
  swim_m: null,
  swim_sessions: null,
  total_hours: null,
};

// ── Sport-Tag-Konfiguration ────────────────────────────────────────────────

export const SPORT_TAG_CONFIG: Record<SportTag, { label: string; color: string }> = {
  'run-easy': { label: 'Laufen locker', color: '#8E6FE0' },
  'run-medium': { label: 'Laufen mittel', color: '#8E6FE0' },
  'run-long': { label: 'Laufen lang', color: '#8E6FE0' },
  'run-intervals': { label: 'Intervalle', color: '#8E6FE0' },
  'bike-easy': { label: 'Rad locker', color: '#FF7A1A' },
  'bike-medium': { label: 'Rad mittel', color: '#FF7A1A' },
  'bike-long': { label: 'Rad lang', color: '#FF7A1A' },
  'swim-easy': { label: 'Schwimmen locker', color: '#3359C4' },
  'swim-medium': { label: 'Schwimmen mittel', color: '#3359C4' },
  'swim-long': { label: 'Schwimmen lang', color: '#3359C4' },
  strength: { label: 'Kraft', color: '#B54A2E' },
  rest: { label: 'Ruhetag', color: '#6B7280' },
  race: { label: 'Wettkampf', color: '#EF4444' },
  misc: { label: 'Sonstiges', color: '#B54A2E' },
};

// ── Supabase CRUD ──────────────────────────────────────────────────────────

export async function fetchWeekPlan(): Promise<WeekPlan> {
  const stored = await blobLoadOne<WeekPlan>('week_frame');
  if (!stored) return { frame: EMPTY_WEEK_FRAME, goals: EMPTY_WEEK_GOALS };
  return {
    frame: stored.frame ?? EMPTY_WEEK_FRAME,
    goals: stored.goals ?? EMPTY_WEEK_GOALS,
  };
}

export async function saveWeekPlan(plan: WeekPlan): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Kein eingeloggter User');
  await blobSave('week_frame', user.id, plan);
}
