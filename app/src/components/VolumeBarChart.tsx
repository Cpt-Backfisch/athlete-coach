import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { WeekBarData } from '@/lib/utils/dashboardStats';

interface VolumeBarChartProps {
  data: WeekBarData[];
  sport: string; // 'all' oder SportType
}

// Farben aus dem Design-System — Dark-Mode-Werte
const SPORT_FARBEN = {
  run: '#8E6FE0',
  bike: '#FF7A1A',
  swim: '#3359C4',
  misc: '#B54A2E',
};

const SPORT_LABELS = {
  run: 'Laufen',
  bike: 'Rad',
  swim: 'Schwimmen',
  misc: 'Sonstiges',
};

// Y-Achse: Stunden-Formatierung ohne unnötige Dezimalstellen
function formatStunden(v: number): string {
  return Number.isInteger(v) ? `${v}` : v.toFixed(1);
}

export function VolumeBarChart({ data, sport }: VolumeBarChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Keine Aktivitäten im gewählten Zeitraum
      </p>
    );
  }

  const alleSporten = sport === 'all';
  const tooltipStyle = {
    backgroundColor: 'var(--popover)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: 12,
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="weekLabel"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={formatStunden}
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          unit=" h"
          width={40}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value, name) => {
            const v = typeof value === 'number' ? value : Number(value);
            const n = String(name ?? '');
            return [`${formatStunden(v)} h`, SPORT_LABELS[n as keyof typeof SPORT_LABELS] ?? n];
          }}
        />
        {alleSporten && (
          <Legend formatter={(v) => SPORT_LABELS[v as keyof typeof SPORT_LABELS] ?? v} />
        )}

        {alleSporten ? (
          // Gestapelte Bars für alle Sportarten
          <>
            <Bar dataKey="run" stackId="a" fill={SPORT_FARBEN.run} radius={[0, 0, 0, 0]} />
            <Bar dataKey="bike" stackId="a" fill={SPORT_FARBEN.bike} radius={[0, 0, 0, 0]} />
            <Bar dataKey="swim" stackId="a" fill={SPORT_FARBEN.swim} radius={[0, 0, 0, 0]} />
            <Bar dataKey="misc" stackId="a" fill={SPORT_FARBEN.misc} radius={[4, 4, 0, 0]} />
          </>
        ) : (
          // Einzelne Bar für gewählte Sportart
          <Bar
            dataKey={sport}
            fill={SPORT_FARBEN[sport as keyof typeof SPORT_FARBEN] ?? '#8E6FE0'}
            radius={[4, 4, 0, 0]}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
