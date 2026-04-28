import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { fetchActivities } from '@/lib/activities';
import { fetchPastResults } from '@/lib/events';
import { getSetting, setSetting } from '@/lib/settings';
import { formatRacePace } from '@/lib/format';
import { SPORT_COLORS } from '@/lib/theme';
import { toast } from 'sonner';
import type { Activity } from '@/lib/activities';
import type { PastResult } from '@/lib/events';

// ── Typen ──────────────────────────────────────────────────────────────────

interface Skills {
  running: number;
  cycling: number;
  swimming: number;
  transitions: number;
}

interface PersonalBest {
  time: string;
  pace?: string;
}

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

// ── Strichmännchen-Platzhalter ─────────────────────────────────────────────

function AvatarPlaceholder() {
  return (
    <svg
      viewBox="0 0 100 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label="Athleten-Avatar"
    >
      {/* Kopf */}
      <circle cx="58" cy="18" r="12" stroke="#8E6FE0" strokeWidth="3.5" />
      {/* Körper */}
      <line
        x1="58"
        y1="30"
        x2="55"
        y2="68"
        stroke="#8E6FE0"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Linker Arm (zurück) */}
      <line
        x1="56"
        y1="42"
        x2="33"
        y2="58"
        stroke="#8E6FE0"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Rechter Arm (vor) */}
      <line
        x1="56"
        y1="42"
        x2="76"
        y2="32"
        stroke="#8E6FE0"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Linkes Bein (hoch) */}
      <line
        x1="55"
        y1="68"
        x2="38"
        y2="90"
        stroke="#8E6FE0"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="38"
        y1="90"
        x2="22"
        y2="86"
        stroke="#8E6FE0"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Rechtes Bein (vorne/unten) */}
      <line
        x1="55"
        y1="68"
        x2="70"
        y2="92"
        stroke="#8E6FE0"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="70"
        y1="92"
        x2="85"
        y2="105"
        stroke="#8E6FE0"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Hilfsfunktionen ────────────────────────────────────────────────────────

function timeToSeconds(s: string | null | undefined): number {
  if (!s) return Infinity;
  const parts = s.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Infinity;
}

function extractPersonalBests(results: PastResult[]): Record<string, PersonalBest | null> {
  let hm: PersonalBest | null = null;
  let marathon: PersonalBest | null = null;
  let triathlonOlympic: PersonalBest | null = null;
  let triathlonMiddle: PersonalBest | null = null;

  for (const r of results) {
    if (!r.actual_time) continue;
    const secs = timeToSeconds(r.actual_time);

    if (r.sport_type === 'run') {
      const nl = r.name.toLowerCase();
      if (nl.includes('halb') || nl.includes('half') || nl.includes('21')) {
        if (secs < timeToSeconds(hm?.time)) {
          hm = { time: r.actual_time, pace: formatRacePace(r.actual_time, 21.097) };
        }
      } else if (nl.includes('marathon')) {
        if (secs < timeToSeconds(marathon?.time)) {
          marathon = { time: r.actual_time, pace: formatRacePace(r.actual_time, 42.195) };
        }
      }
    } else if (r.sport_type === 'triathlon') {
      const fl = (r.format_desc ?? '').toLowerCase();
      const nl = r.name.toLowerCase();
      const isMittel =
        fl.includes('2,0/80') ||
        nl.includes('mittel') ||
        nl.includes('middle') ||
        nl.includes('70.3') ||
        nl.includes('ffm mittel');
      if (isMittel) {
        if (secs < timeToSeconds(triathlonMiddle?.time)) {
          triathlonMiddle = { time: r.actual_time };
        }
      } else {
        if (secs < timeToSeconds(triathlonOlympic?.time)) {
          triathlonOlympic = { time: r.actual_time };
        }
      }
    }
  }

  return { hm, marathon, triathlonOlympic, triathlonMiddle };
}

// ── Skill-Balken ───────────────────────────────────────────────────────────

interface SkillBarProps {
  label: string;
  value: number;
  color: string;
  onChange?: (v: number) => void;
  readonly?: boolean;
}

function SkillBar({ label, value, color, onChange, readonly: ro = false }: SkillBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold tabular-nums" style={{ color }}>
          {value}/10
        </span>
      </div>
      <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${(value / 10) * 100}%`, backgroundColor: color }}
        />
      </div>
      {!ro && onChange && (
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1 cursor-pointer opacity-0 absolute inset-0"
          style={{ accentColor: color }}
          aria-label={`${label} Skill`}
        />
      )}
    </div>
  );
}

// ── Saison-Stats ───────────────────────────────────────────────────────────

function saisonStats(activities: Activity[]) {
  const year = new Date().getFullYear();
  const diesJahr = activities.filter((a) => new Date(a.date).getFullYear() === year);
  const runKm = diesJahr
    .filter((a) => a.sport_type === 'run')
    .reduce((s, a) => s + a.distance / 1000, 0);
  const bikeKm = diesJahr
    .filter((a) => a.sport_type === 'bike')
    .reduce((s, a) => s + a.distance / 1000, 0);
  const swimKm = diesJahr
    .filter((a) => a.sport_type === 'swim')
    .reduce((s, a) => s + a.distance / 1000, 0);
  const gesamtStunden = diesJahr.reduce((s, a) => s + a.duration / 3600, 0);
  return { runKm, bikeKm, swimKm, gesamtStunden };
}

// ── ProfileModal ───────────────────────────────────────────────────────────

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pastResults, setPastResults] = useState<PastResult[]>([]);
  const [skills, setSkills] = useState<Skills>({
    running: 5,
    cycling: 5,
    swimming: 5,
    transitions: 5,
  });
  const [skillsLaden, setSkillsLaden] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchActivities().then(setActivities);
    fetchPastResults().then(setPastResults);
    getSetting('skills').then((raw) => {
      if (raw) {
        try {
          setSkills(JSON.parse(raw) as Skills);
        } catch {
          /* Fallback bleibt */
        }
      }
    });
  }, [open]);

  const pbs = useMemo(() => extractPersonalBests(pastResults), [pastResults]);
  const stats = useMemo(() => saisonStats(activities), [activities]);

  async function handleSkillChange(key: keyof Skills, value: number) {
    const next = { ...skills, [key]: value };
    setSkills(next);
    setSkillsLaden(true);
    try {
      await setSetting('skills', JSON.stringify(next));
    } catch {
      toast.error('Skills speichern fehlgeschlagen');
    } finally {
      setSkillsLaden(false);
    }
  }

  if (!open) return null;

  const DE_1 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
  const DE_1DEC = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[16px] bg-card border border-border mx-4 p-6 space-y-6">
        {/* Schließen */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Schließen"
        >
          <X size={18} />
        </button>

        <h2 className="text-base font-semibold">Athletenprofil</h2>

        {/* ── Hauptbereich: Drei Spalten (Desktop) / Vertikal (Mobile) ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_1fr] gap-6 items-start">
          {/* Links: Skills */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Stärken
            </p>
            <div className="space-y-4">
              <SkillBar
                label="Laufen"
                value={skills.running}
                color={SPORT_COLORS.run.dark}
                onChange={(v) => handleSkillChange('running', v)}
              />
              <SkillBar
                label="Rad"
                value={skills.cycling}
                color={SPORT_COLORS.bike.dark}
                onChange={(v) => handleSkillChange('cycling', v)}
              />
              <SkillBar
                label="Schwimmen"
                value={skills.swimming}
                color={SPORT_COLORS.swim.dark}
                onChange={(v) => handleSkillChange('swimming', v)}
              />
              <SkillBar
                label="Wechsel"
                value={skills.transitions}
                color="#0EA5A0"
                onChange={(v) => handleSkillChange('transitions', v)}
              />
            </div>
            {skillsLaden && (
              <p className="text-xs text-muted-foreground animate-pulse">Gespeichert…</p>
            )}
          </div>

          {/* Mitte: Avatar */}
          <div className="flex flex-col items-center gap-3 order-first md:order-none">
            <div
              className="w-32 h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center overflow-hidden border border-border"
              style={{ boxShadow: '0 0 48px 12px rgba(142,111,224,0.35)' }}
            >
              <AvatarPlaceholder />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm">Sebastian</p>
              <p className="text-xs text-muted-foreground">Triathlet · Frankfurt</p>
            </div>
          </div>

          {/* Rechts: Personal Bests */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Personal Bests
            </p>
            <div className="space-y-3">
              <PbRow label="Halbmarathon" pb={pbs.hm as PersonalBest | null} withPace />
              <PbRow label="Marathon" pb={pbs.marathon as PersonalBest | null} withPace />
              <PbRow label="Olymp. Triathlon" pb={pbs.triathlonOlympic as PersonalBest | null} />
              <PbRow label="Mitteldistanz" pb={pbs.triathlonMiddle as PersonalBest | null} />
            </div>
          </div>
        </div>

        {/* ── Saison-Stats ── */}
        <div className="border-t border-border pt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Saison {new Date().getFullYear()}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCell
              label="Lauf"
              value={`${DE_1.format(Math.round(stats.runKm))} km`}
              color={SPORT_COLORS.run.dark}
            />
            <StatCell
              label="Rad"
              value={`${DE_1.format(Math.round(stats.bikeKm))} km`}
              color={SPORT_COLORS.bike.dark}
            />
            <StatCell
              label="Schwimmen"
              value={`${DE_1.format(Math.round(stats.swimKm))} km`}
              color={SPORT_COLORS.swim.dark}
            />
            <StatCell
              label="Gesamt"
              value={`${DE_1DEC.format(stats.gesamtStunden)} Std`}
              color="var(--muted-foreground)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Teilkomponenten ────────────────────────────────────────────────────────

function PbRow({
  label,
  pb,
  withPace,
}: {
  label: string;
  pb: PersonalBest | null;
  withPace?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-muted-foreground leading-tight">{label}</span>
      <div className="text-right">
        {pb ? (
          <>
            <span className="text-xs font-semibold tabular-nums">{pb.time}</span>
            {withPace && pb.pace && (
              <span className="block text-[10px] text-muted-foreground tabular-nums">
                {pb.pace}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}

function StatCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-[10px] bg-muted/40 px-3 py-2.5 space-y-0.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-base font-semibold tabular-nums" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
