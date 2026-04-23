import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getMonthlyVolumeHours } from '@/lib/utils/dashboardStats';
import type { Activity } from '@/lib/activities';

const FARBEN = {
  run: '#8E6FE0',
  bike: '#FF7A1A',
  swim: '#3359C4',
  misc: '#B54A2E',
};

interface Props {
  activities: Activity[];
  year: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: { value: number }) => s + (p.value ?? 0), 0);
  return (
    <div className="rounded-[8px] bg-popover border border-border px-3 py-2 text-xs space-y-1 shadow-lg">
      <p className="font-medium text-foreground">{label}</p>
      {payload.map(
        (p: { name: string; value: number; fill: string }) =>
          p.value > 0 && (
            <p key={p.name} style={{ color: p.fill }}>
              {p.name}: {p.value.toFixed(1)} h
            </p>
          )
      )}
      {total > 0 && (
        <p className="text-muted-foreground border-t border-border pt-1 mt-1">
          Gesamt: {total.toFixed(1)} h
        </p>
      )}
    </div>
  );
}

export function VolumeChartHours({ activities, year }: Props) {
  const data = useMemo(() => getMonthlyVolumeHours(activities, year), [activities, year]);
  const hatDaten = data.some((d) => d.run + d.bike + d.swim + d.misc > 0);

  if (!hatDaten) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Keine Daten für {year}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={14} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          unit=" h"
          width={32}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
        <Bar dataKey="run" name="Laufen" stackId="a" fill={FARBEN.run} radius={[0, 0, 0, 0]} />
        <Bar dataKey="bike" name="Rad" stackId="a" fill={FARBEN.bike} />
        <Bar dataKey="swim" name="Schwimmen" stackId="a" fill={FARBEN.swim} />
        <Bar dataKey="misc" name="Sonstiges" stackId="a" fill={FARBEN.misc} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
