import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { StreamPoint } from '@/lib/streams';

interface StreamChartProps {
  data: StreamPoint[];
  dataKey: keyof StreamPoint;
  label: string;
  color: string;
  formatY?: (value: number) => string;
  unit?: string;
}

// Wiederverwendbarer Linien-Chart für Strava-Stream-Daten.
export function StreamChart({ data, dataKey, label, color, formatY, unit }: StreamChartProps) {
  // Chart nicht rendern wenn alle Werte für den Key fehlen
  const hatDaten = data.some((p) => p[dataKey] !== undefined && p[dataKey] !== null);
  if (!hatDaten) return null;

  // Datenpunkte auf max. 500 ausdünnen — verhindert Performance-Probleme bei langen Einheiten
  const gedünnt =
    data.length > 500 ? data.filter((_, i) => i % Math.ceil(data.length / 500) === 0) : data;

  // X-Achsen-Werte in Minuten umrechnen
  const chartDaten = gedünnt.map((p) => ({
    ...p,
    minuteX: Math.round(p.time / 60),
  }));

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartDaten} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="minuteX"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            unit=" min"
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatY}
            width={48}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: 12,
            }}
            labelFormatter={(v) => `${v} min`}
            formatter={(value) => {
              const v = typeof value === 'number' ? value : Number(value);
              return [formatY ? formatY(v) : v, unit ?? label];
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey as string}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
