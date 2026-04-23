interface MetaCardProps {
  label: string;
  value: string;
  unit?: string;
}

// Einzelne Metadaten-Kachel für die Detailansicht.
export function MetaCard({ label, value, unit }: MetaCardProps) {
  return (
    <div className="rounded-[12px] bg-card border border-border px-4 py-3 space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </p>
      <p className="text-xl font-semibold tabular-nums leading-none">
        {value}
        {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
      </p>
    </div>
  );
}
