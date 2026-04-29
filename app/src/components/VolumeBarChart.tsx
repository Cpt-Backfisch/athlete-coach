import type { ReactElement } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { SportGradientDefs } from '@/components/charts/SportGradientDefs';
import { formatDuration } from '@/lib/format';
import type { VolumeBarData } from '@/lib/utils/dashboardStats';

interface VolumeBarChartProps {
  data: VolumeBarData[];
  sport: string; // aktiver Sportart-Filter ('all' = kein Dimming)
  yearChangeLabels?: string[];
  yearChangeIndices?: number[]; // 0-basierte Indizes für präzise Linienpositionierung
  onSportClick?: (sport: string) => void; // F8: Balken-Klick setzt globalen Filter
}

function roundedBarPath(x: number, y: number, width: number, height: number, r: number): string {
  const rr = Math.min(r, width / 2);
  if (rr <= 0 || height <= 0) return `M${x},${y}h${width}v${height}h${-width}Z`;
  return `M${x + rr},${y} h${width - 2 * rr} a${rr},${rr} 0 0 1 ${rr},${rr} v${height - rr} h${-width} v${-(height - rr)} a${rr},${rr} 0 0 1 ${rr},${-rr} Z`;
}

function roundedTop(
  sportsAbove: string[]
): (props: Record<string, unknown>) => ReactElement | null {
  return function Shape(props) {
    const { x, y, width, height, fill, fillOpacity, payload } = props as {
      x: number;
      y: number;
      width: number;
      height: number;
      fill: string;
      fillOpacity: number;
      payload: Record<string, number>;
    };
    if (!height || height <= 0) return null;
    const isTop = sportsAbove.every((s) => !payload?.[s]);
    return (
      <path
        d={roundedBarPath(x, y, width, height, isTop ? 4 : 0)}
        fill={fill}
        fillOpacity={fillOpacity ?? 1}
      />
    );
  };
}

const SPORT_FARBEN = {
  run: 'url(#gradient-run)',
  bike: 'url(#gradient-bike)',
  swim: 'url(#gradient-swim)',
  misc: 'url(#gradient-misc)',
};

const SPORT_LABELS: Record<string, string> = {
  run: 'Laufen',
  bike: 'Rad',
  swim: 'Schwimmen',
  misc: 'Sonstiges',
};

function formatStunden(v: number): string {
  if (!v) return '0';
  if (Number.isInteger(v)) return String(v);
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(v);
}

function barOpacity(barSport: string, aktiverFilter: string): number {
  return aktiverFilter === 'all' || aktiverFilter === barSport ? 1 : 0.3;
}

export function VolumeBarChart({
  data,
  sport,
  yearChangeLabels = [],
  yearChangeIndices = [],
  onSportClick,
}: VolumeBarChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Keine Aktivitäten im gewählten Zeitraum
      </p>
    );
  }

  const cursor = onSportClick ? 'pointer' : 'default';

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <SportGradientDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
        />
        {/* Versteckte numerische Achse für präzise ReferenceLine-Positionierung zwischen Balken */}
        <XAxis xAxisId="numeric" type="number" domain={[0, data.length]} hide />
        <YAxis
          tickFormatter={formatStunden}
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          unit=" Std"
          width={44}
        />
        <Tooltip
          content={
            <ChartTooltip
              showTotal
              formatter={(v, name) => {
                const label = SPORT_LABELS[name as string] ?? name;
                return `${label}: ${formatDuration(v)}`;
              }}
            />
          }
          cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
        />
        <Legend
          formatter={(v) => SPORT_LABELS[v as string] ?? v}
          wrapperStyle={{ fontSize: '11px' }}
        />

        {/* Jahrestrenner — x=Index positioniert die Linie genau zwischen Dez und Jan */}
        {yearChangeIndices.map((idx, i) => (
          <ReferenceLine
            key={idx}
            xAxisId="numeric"
            x={idx}
            stroke="rgba(255,255,255,0.2)"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: (yearChangeLabels[i] ?? '').replace(/^KW \d+ /, ''),
              position: 'top',
              fontSize: 10,
              fill: 'var(--muted-foreground)',
            }}
          />
        ))}

        {/* Immer gestapelt — alle 4 Sportarten, mit Opacity-Dimming je aktivem Filter */}
        <Bar
          dataKey="run"
          name="run"
          stackId="a"
          fill={SPORT_FARBEN.run}
          fillOpacity={barOpacity('run', sport)}
          shape={roundedTop(['bike', 'swim', 'misc'])}
          cursor={cursor}
          onClick={() => onSportClick?.('run')}
        />
        <Bar
          dataKey="bike"
          name="bike"
          stackId="a"
          fill={SPORT_FARBEN.bike}
          fillOpacity={barOpacity('bike', sport)}
          shape={roundedTop(['swim', 'misc'])}
          cursor={cursor}
          onClick={() => onSportClick?.('bike')}
        />
        <Bar
          dataKey="swim"
          name="swim"
          stackId="a"
          fill={SPORT_FARBEN.swim}
          fillOpacity={barOpacity('swim', sport)}
          shape={roundedTop(['misc'])}
          cursor={cursor}
          onClick={() => onSportClick?.('swim')}
        />
        <Bar
          dataKey="misc"
          name="misc"
          stackId="a"
          fill={SPORT_FARBEN.misc}
          fillOpacity={barOpacity('misc', sport)}
          shape={roundedTop([])}
          cursor={cursor}
          onClick={() => onSportClick?.('misc')}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
