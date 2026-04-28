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
  onSportClick?: (sport: string) => void; // F8: Balken-Klick setzt globalen Filter
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

        {/* Jahrestrenner */}
        {yearChangeLabels.map((lbl) => (
          <ReferenceLine
            key={lbl}
            x={lbl}
            stroke="rgba(255,255,255,0.2)"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: lbl.replace(/^KW \d+ /, ''),
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
          radius={[0, 0, 0, 0]}
          cursor={cursor}
          onClick={() => onSportClick?.('run')}
        />
        <Bar
          dataKey="bike"
          name="bike"
          stackId="a"
          fill={SPORT_FARBEN.bike}
          fillOpacity={barOpacity('bike', sport)}
          radius={[0, 0, 0, 0]}
          cursor={cursor}
          onClick={() => onSportClick?.('bike')}
        />
        <Bar
          dataKey="swim"
          name="swim"
          stackId="a"
          fill={SPORT_FARBEN.swim}
          fillOpacity={barOpacity('swim', sport)}
          radius={[0, 0, 0, 0]}
          cursor={cursor}
          onClick={() => onSportClick?.('swim')}
        />
        <Bar
          dataKey="misc"
          name="misc"
          stackId="a"
          fill={SPORT_FARBEN.misc}
          fillOpacity={barOpacity('misc', sport)}
          radius={[6, 6, 0, 0]}
          cursor={cursor}
          onClick={() => onSportClick?.('misc')}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
