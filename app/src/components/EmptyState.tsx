import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  cta?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
      <div className="rounded-full bg-muted p-3">
        <Icon size={40} className="text-muted-foreground" strokeWidth={1.5} />
      </div>
      <p className="font-semibold text-sm">{title}</p>
      {description && <p className="text-sm text-muted-foreground max-w-xs">{description}</p>}
      {cta && (
        <Button size="sm" className="mt-1" onClick={cta.onClick}>
          {cta.label}
        </Button>
      )}
    </div>
  );
}
