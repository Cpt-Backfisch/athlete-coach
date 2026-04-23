import { SPORT_COLORS } from '@/lib/theme';

// Sportart-Farben für aktive Filter-Buttons
const SPORT_FILTER_COLORS: Record<string, string> = {
  run: SPORT_COLORS.run.dark,
  bike: SPORT_COLORS.bike.dark,
  swim: SPORT_COLORS.swim.dark,
  misc: SPORT_COLORS.misc.dark,
};

interface FilterChipsProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

// Horizontale Chip-Leiste — auf Mobile scrollbar, kein Umbruch.
export function FilterChips({ options, value, onChange }: FilterChipsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      style={{ scrollbarWidth: 'none' }}
    >
      {options.map((opt) => {
        const aktiv = opt.value === value;
        const sportFarbe = SPORT_FILTER_COLORS[opt.value];

        // Aktiver Sportart-Filter: Farbe in Border + Text + leichter Hintergrund
        const aktivStyle = sportFarbe
          ? {
              backgroundColor: `${sportFarbe}22`,
              color: sportFarbe,
              borderColor: sportFarbe,
            }
          : {
              // "Alle" und Zeitraum-Filter: Primary-Akzent (Purple)
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderColor: 'var(--primary)',
            };

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex-shrink-0 px-3 py-1 text-sm font-medium transition-all border"
            style={{
              borderRadius: '999px',
              ...(aktiv
                ? aktivStyle
                : {
                    backgroundColor: 'transparent',
                    color: 'var(--muted-foreground)',
                    borderColor: 'var(--border)',
                  }),
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
