import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getMonthlyVolumeKm } from '@/lib/utils/dashboardStats';
import { ChartTooltip } from './ChartTooltip';
import { SportGradientDefs } from './SportGradientDefs';
import { formatDistanceKm } from '@/lib/format';
import type { Activity } from '@/lib/activities';

const SPORT_LABELS: Record<string, string> = {
  run: 'Laufen',
  bike: 'Rad',
  swim: 'Schwimmen',
};

interface Props {
  activities: Activity[];
  year: number;
}

export function VolumeChartKm({ activities, year }: Props) {
  const data = useMemo(() => getMonthlyVolumeKm(activities, year), [activities, year]);
  const hatDaten = data.some((d) => d.run + d.bike + d.swim > 0);

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
          unit=" km"
          width={40}
        />
        <Tooltip
          content={
            <ChartTooltip
              showTotal
              formatter={(v, name) => {
                const label = SPORT_LABELS[name] ?? name;
                return `${label}: ${formatDistanceKm(v)}`;
              }}
            />
          }
          cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
        />
        {/* Swim ist das oberste Segment → erhält abgerundeten Radius */}
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
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
