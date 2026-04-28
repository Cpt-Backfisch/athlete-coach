import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

function Pulse({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />;
}

export function BarChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="flex items-end gap-2 w-full" style={{ height }}>
      {[65, 45, 80, 55, 70, 40, 90, 60, 75, 50, 85, 45].map((h, i) => (
        <Pulse key={i} className="flex-1" style={{ height: `${h}%` } as React.CSSProperties} />
      ))}
    </div>
  );
}

export function LineChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="w-full space-y-3" style={{ height }}>
      <Pulse className="h-full w-full" />
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-[12px] bg-card border border-border px-4 py-4 space-y-3">
      <div className="flex items-center gap-1.5">
        <Pulse className="w-2.5 h-2.5 rounded-full" />
        <Pulse className="h-3 w-16" />
      </div>
      <Pulse className="h-8 w-24" />
      <Pulse className="h-3 w-32" />
    </div>
  );
}
