interface LoadLightProps {
  status: 'green' | 'yellow' | 'red';
  message: string;
}

const FARBEN: Record<LoadLightProps['status'], string> = {
  green: '#22C55E',
  yellow: '#EAB308',
  red: '#EF4444',
};

// Belastungsampel: farbiger Kreis + Statustext.
export function LoadLight({ status, message }: LoadLightProps) {
  const farbe = FARBEN[status];

  return (
    <div className="flex items-center gap-2">
      <span
        className="w-4 h-4 rounded-full flex-shrink-0"
        style={{ backgroundColor: farbe, boxShadow: `0 0 6px ${farbe}66` }}
      />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}
