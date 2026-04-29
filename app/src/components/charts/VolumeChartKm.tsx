import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { BarShapeProps } from 'recharts';
import { getMonthlyVolumeKm } from '@/lib/utils/dashboardStats';
import { ChartTooltip } from './ChartTooltip';
import { SportGradientDefs } from './SportGradientDefs';
import { formatDistanceKm } from '@/lib/format';
import type { Activity } from '@/lib/activities';

function roundedBarPath(x: number, y: number, width: number, height: number, r: number): string {
  const rr = Math.min(r, width / 2);
  if (rr <= 0 || height <= 0) return `M${x},${y}h${width}v${height}h${-width}Z`;
  return `M${x + rr},${y} h${width - 2 * rr} a${rr},${rr} 0 0 1 ${rr},${rr} v${height - rr} h${-width} v${-(height - rr)} a${rr},${rr} 0 0 1 ${rr},${-rr} Z`;
}

function roundedTop(sportsAbove: string[]): (props: BarShapeProps) => ReactElement | null {
  return function Shape({ x, y, width, height, fill, fillOpacity, payload }: BarShapeProps) {
    if (!height || height <= 0) return null;
    const row = payload as Record<string, number> | undefined;
    const isTop = sportsAbove.every((s) => !row?.[s]);
    return (
      <path
        d={roundedBarPath(x, y, width, height, isTop ? 4 : 0)}
        fill={fill as string}
        fillOpacity={(fillOpacity as number) ?? 1}
      />
    );
  };
}

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
        <Bar
          dataKey="run"
          name="run"
          stackId="a"
          fill="url(#gradient-run)"
          shape={roundedTop(['bike', 'swim'])}
        />
        <Bar
          dataKey="bike"
          name="bike"
          stackId="a"
          fill="url(#gradient-bike)"
          shape={roundedTop(['swim'])}
        />
        <Bar
          dataKey="swim"
          name="swim"
          stackId="a"
          fill="url(#gradient-swim)"
          shape={roundedTop([])}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
