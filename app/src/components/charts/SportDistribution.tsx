import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getSportDistribution } from '@/lib/utils/dashboardStats';
import type { Activity } from '@/lib/activities';

interface Props {
  activities: Activity[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-[8px] bg-popover border border-border px-3 py-2 text-xs shadow-lg">
      <p style={{ color: d.color }} className="font-medium">
        {d.name}
      </p>
      <p className="text-muted-foreground">{d.hours.toFixed(1)} h</p>
    </div>
  );
}

export function SportDistribution({ activities }: Props) {
  const data = useMemo(() => getSportDistribution(activities), [activities]);
  const total = data.reduce((s, d) => s + d.hours, 0);

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Keine Daten</p>;
  }

  return (
    <div className="flex items-center gap-6">
      {/* Pie */}
      <div className="w-32 h-32 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={56}
              startAngle={90}
              endAngle={-270}
              dataKey="hours"
              strokeWidth={2}
              stroke="var(--card)"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legende */}
      <div className="flex-1 space-y-2">
        {data.map((d) => (
          <div key={d.sport} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-sm truncate">{d.name}</span>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-sm tabular-nums">{d.hours.toFixed(1)} h</span>
              {total > 0 && (
                <span className="text-xs text-muted-foreground ml-1.5 tabular-nums">
                  {Math.round((d.hours / total) * 100)}%
                </span>
              )}
            </div>
          </div>
        ))}
        <div className="border-t border-border pt-2 flex justify-between text-xs text-muted-foreground">
          <span>Gesamt</span>
          <span className="tabular-nums">{total.toFixed(1)} h</span>
        </div>
      </div>
    </div>
  );
}
