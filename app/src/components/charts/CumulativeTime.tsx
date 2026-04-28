import { useMemo, useState } from 'react';
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
import { cn } from '@/lib/utils';
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

  // F10: Lokale Jahr-Filter — Multi-Select, unabhängig vom globalen Filter
  const [versteckteJahre, setVersteckteJahre] = useState<Set<string>>(new Set());

  const ticks = useMemo(
    () =>
      data.filter((d, i, arr) => i === 0 || d.label !== arr[i - 1].label).map((d) => d.dayOfYear),
    [data]
  );

  const activeYears = useMemo(
    () =>
      ['2024', '2025', '2026'].filter((y) =>
        data.some((d) => (d[y] as number | undefined) !== undefined && (d[y] as number) > 0)
      ),
    [data]
  );

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Keine Daten</p>;
  }

  function toggleJahr(jahr: string) {
    setVersteckteJahre((prev) => {
      const next = new Set(prev);
      if (next.has(jahr)) next.delete(jahr);
      else next.add(jahr);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {/* Lokale Jahr-Pills — UNABHÄNGIG vom globalen Sportart-Filter */}
      <div className="flex flex-wrap gap-2">
        {activeYears.map((jahr) => {
          const sichtbar = !versteckteJahre.has(jahr);
          const farbe = JAHRES_FARBEN[jahr];
          return (
            <button
              key={jahr}
              onClick={() => toggleJahr(jahr)}
              className={cn(
                'flex items-center gap-1.5 px-3 text-xs font-medium rounded-full border transition-all duration-150',
                'min-h-[32px]' // Touch-Target ≥ 44px via padding auf Mobile ausreichend
              )}
              style={
                sichtbar
                  ? { borderColor: farbe, color: farbe, backgroundColor: `${farbe}22` }
                  : {
                      borderColor: 'var(--border)',
                      color: 'var(--muted-foreground)',
                      backgroundColor: 'transparent',
                    }
              }
              aria-pressed={sichtbar}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: sichtbar ? farbe : 'var(--muted-foreground)' }}
              />
              {jahr}
            </button>
          );
        })}
      </div>

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
              hide={versteckteJahre.has(y)}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
