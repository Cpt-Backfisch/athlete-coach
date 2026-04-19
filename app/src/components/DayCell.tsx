import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SPORT_TAG_CONFIG } from '@/lib/weekFrame';
import type { DayPlan, SportTag } from '@/lib/weekFrame';

interface DayCellProps {
  day: string; // z.B. „Mo"
  plan: DayPlan;
  onChange: (plan: DayPlan) => void;
}

export function DayCell({ day, plan, onChange }: DayCellProps) {
  const [popoverOffen, setPopoverOffen] = useState(false);

  // Tag entfernen — klick auf bestehenden Tag
  function tagEntfernen(index: number) {
    const neueTags = plan.tags.filter((_, i) => i !== index);
    onChange({ tags: neueTags });
  }

  // Tag hinzufügen und Popover schließen
  function tagHinzufuegen(tag: SportTag) {
    onChange({ tags: [...plan.tags, tag] });
    setPopoverOffen(false);
  }

  return (
    <div className="flex flex-col gap-1.5 min-h-[80px] p-2 rounded-lg border border-border bg-card">
      {/* Tagesname */}
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {day}
      </span>

      {/* Bestehende Tags */}
      <div className="flex flex-wrap gap-1">
        {plan.tags.map((tag, i) => {
          const cfg = SPORT_TAG_CONFIG[tag];
          return (
            <button
              key={i}
              onClick={() => tagEntfernen(i)}
              title="Entfernen"
              className="px-2 py-0.5 text-[10px] font-medium leading-none rounded-full transition-opacity hover:opacity-70"
              style={{
                backgroundColor: `${cfg.color}25`,
                color: cfg.color,
                borderRadius: '999px',
              }}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* „+ Tag hinzufügen"-Button mit Popover */}
      <Popover open={popoverOffen} onOpenChange={setPopoverOffen}>
        <PopoverTrigger className="text-[10px] text-muted-foreground hover:text-foreground transition-colors text-left">
          + Tag
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" side="bottom" align="start">
          <div className="grid grid-cols-1 gap-1">
            {(
              Object.entries(SPORT_TAG_CONFIG) as [SportTag, { label: string; color: string }][]
            ).map(([tag, cfg]) => (
              <button
                key={tag}
                onClick={() => tagHinzufuegen(tag)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-muted transition-colors text-left"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cfg.color }}
                />
                {cfg.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
