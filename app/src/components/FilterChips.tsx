import { ACCENT } from '@/lib/theme';

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
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex-shrink-0 px-3 py-1 text-sm font-medium transition-colors border"
            style={{
              borderRadius: '999px',
              backgroundColor: aktiv ? ACCENT : 'transparent',
              color: aktiv ? '#fff' : 'var(--muted-foreground)',
              borderColor: aktiv ? ACCENT : 'var(--border)',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
