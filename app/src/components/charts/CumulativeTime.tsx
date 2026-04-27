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
import { ChartTooltip } from './ChartTooltip';
import { formatDuration } from '@/lib/format';
import type { Activity } from '@/lib/activities';

const JAHRES_FARBEN: Record<string, string> = {
  2024: '#3359C4',
  2025: '#FF7A1A',
  2026: '#8E6FE0',
};

interface Props {
  activities: Activity[];
}

export function CumulativeTime({ activities }: Props) {
  const data = useMemo(() => getCumulativeTime(activities), [activities]);

  const ticks = useMemo(
    () =>
      data.filter((d, i, arr) => i === 0 || d.label !== arr[i - 1].label).map((d) => d.dayOfYear),
    [data]
  );

  const hatDaten = data.length > 0;

  if (!hatDaten) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Keine Daten</p>;
  }

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
          unit=" Std"
          width={40}
        />
        <Tooltip
          content={<ChartTooltip formatter={(v, name) => `${name}: ${formatDuration(v)}`} />}
        />
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
