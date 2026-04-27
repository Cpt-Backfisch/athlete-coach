interface TooltipEntry {
  name: string;
  value: number;
  fill?: string;
  stroke?: string;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  unit?: string;
  showTotal?: boolean;
  totalLabel?: string;
  formatter?: (value: number, name: string) => string;
  filter?: (entry: TooltipEntry) => boolean;
}

/**
 * Wiederverwendbarer Recharts-Tooltip im Design-System-Stil.
 * Übergabe via content={<ChartTooltip />} auf Recharts <Tooltip>.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  unit = '',
  showTotal = false,
  totalLabel = 'Gesamt',
  formatter,
  filter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const sichtbar = filter ? payload.filter(filter) : payload.filter((p) => (p.value ?? 0) > 0);

  if (!sichtbar.length && !showTotal) return null;

  const total = sichtbar.reduce((s, p) => s + (p.value ?? 0), 0);
  const farbe = (p: TooltipEntry) => p.fill ?? p.stroke ?? p.color ?? 'currentColor';

  return (
    <div className="rounded-xl bg-card border border-border/50 px-3 py-2.5 text-sm space-y-1 shadow-lg">
      {label && <p className="font-medium text-foreground">{label}</p>}
      {sichtbar.map((p) => (
        <p key={p.name} style={{ color: farbe(p) }}>
          {formatter
            ? formatter(p.value, p.name)
            : `${p.name}: ${p.value?.toFixed(1)}${unit ? ' ' + unit : ''}`}
        </p>
      ))}
      {showTotal && sichtbar.length > 1 && total > 0 && (
        <p className="text-muted-foreground border-t border-border pt-1 mt-1">
          {formatter
            ? formatter(total, totalLabel)
            : `${totalLabel}: ${total.toFixed(1)}${unit ? ' ' + unit : ''}`}
        </p>
      )}
    </div>
  );
}
