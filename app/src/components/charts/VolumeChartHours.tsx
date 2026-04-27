import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getMonthlyVolumeHours } from '@/lib/utils/dashboardStats';
import { ChartTooltip } from './ChartTooltip';
import { SportGradientDefs } from './SportGradientDefs';
import { formatDuration } from '@/lib/format';
import type { Activity } from '@/lib/activities';

const SPORT_LABELS: Record<string, string> = {
  run: 'Laufen',
  bike: 'Rad',
  swim: 'Schwimmen',
  misc: 'Sonstiges',
};

interface Props {
  activities: Activity[];
  year: number;
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
        <SportGradientDefs />
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
          unit=" Std"
          width={36}
        />
        <Tooltip
          content={
            <ChartTooltip
              showTotal
              formatter={(v, name) => {
                const label = SPORT_LABELS[name] ?? name;
                return `${label}: ${formatDuration(v)}`;
              }}
            />
          }
          cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
        />
        {/* Nur das oberste Segment (misc) erhält den abgerundeten Radius */}
        <Bar dataKey="run" name="run" stackId="a" fill="url(#gradient-run)" radius={[0, 0, 0, 0]} />
        <Bar
          dataKey="bike"
          name="bike"
          stackId="a"
          fill="url(#gradient-bike)"
          radius={[0, 0, 0, 0]}
        />
        <Bar
          dataKey="swim"
          name="swim"
          stackId="a"
          fill="url(#gradient-swim)"
          radius={[0, 0, 0, 0]}
        />
        <Bar
          dataKey="misc"
          name="misc"
          stackId="a"
          fill="url(#gradient-misc)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
