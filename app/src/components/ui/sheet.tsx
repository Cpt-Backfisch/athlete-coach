import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function Sheet({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  title,
  ...props
}: DialogPrimitive.Popup.Props & { title?: string }) {
  return (
    <DialogPrimitive.Portal>
      <SheetOverlay />
      <DialogPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-xl border-l border-border',
          'flex flex-col',
          'data-open:animate-in data-open:slide-in-from-right data-open:duration-300',
          'data-closed:animate-out data-closed:slide-out-to-right data-closed:duration-200',
          className
        )}
        {...props}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
            <h2 className="font-semibold text-base">{title}</h2>
            <DialogPrimitive.Close className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <XIcon size={16} />
              <span className="sr-only">Schließen</span>
            </DialogPrimitive.Close>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

export { Sheet, SheetContent, SheetTrigger };
