import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { getCumulativeTime } from '@/lib/utils/dashboardStats';
import type { Activity } from '@/lib/activities';

const JAHRES_FARBEN: Record<string, string> = {
  2024: '#3359C4',
  2025: '#FF7A1A',
  2026: '#8E6FE0',
};

interface Props {
  activities: Activity[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[8px] bg-popover border border-border px-3 py-2 text-xs space-y-1 shadow-lg">
      <p className="text-muted-foreground">{label}</p>
      {payload.map(
        (p: { name: string; value: number; stroke: string }) =>
          p.value !== undefined && (
            <p key={p.name} style={{ color: p.stroke }}>
              {p.name}: {p.value.toFixed(1)} h
            </p>
          )
      )}
    </div>
  );
}

export function CumulativeTime({ activities }: Props) {
  const data = useMemo(() => getCumulativeTime(activities), [activities]);

  // Nur Monatsstartpunkte für X-Achse zeigen
  const ticks = useMemo(
    () =>
      data.filter((d, i, arr) => i === 0 || d.label !== arr[i - 1].label).map((d) => d.dayOfYear),
    [data]
  );

  const hatDaten = data.length > 0;

  if (!hatDaten) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Keine Daten</p>;
  }

  // Welche Jahre haben Daten?
  const activeYears = ['2024', '2025', '2026'].filter((y) =>
    data.some((d) => (d[y] as number | undefined) !== undefined && (d[y] as number) > 0)
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          dataKey="dayOfYear"
          ticks={ticks}
          tickFormatter={(doy) => {
            const point = data.find((d) => d.dayOfYear === doy);
            return point?.label ?? '';
          }}
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          unit=" h"
          width={36}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '11px', color: 'var(--muted-foreground)' }}
          iconType="circle"
          iconSize={8}
        />
        {activeYears.map((y) => (
          <Line
            key={y}
            type="monotone"
            dataKey={y}
            name={y}
            stroke={JAHRES_FARBEN[y]}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
