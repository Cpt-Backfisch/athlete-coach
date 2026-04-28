import { cn } from '@/lib/utils';

interface SegmentedControlProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

// Zusammenhängender Segmented Control — ersetzt die einzelnen Zeitraum-Pills
export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <div className="overflow-x-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
      <div className="flex bg-muted rounded-[10px] p-1 w-max gap-0.5">
        {options.map((opt) => {
          const aktiv = opt.value === value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                'flex-shrink-0 px-3 text-sm transition-all duration-150 rounded-[8px]',
                'min-h-[44px] min-w-[36px]',
                aktiv
                  ? 'bg-background shadow-sm font-semibold text-foreground'
                  : 'bg-transparent font-normal text-muted-foreground hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
