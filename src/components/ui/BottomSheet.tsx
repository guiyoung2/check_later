import type { ReactNode } from 'react';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  dragHandle?: boolean;
  children: ReactNode;
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function BottomSheet({ open, onClose, dragHandle = false, children }: BottomSheetProps) {
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Close sheet"
        data-testid="bottom-sheet-overlay"
        onClick={onClose}
        className={joinClasses(
          'fixed inset-0 z-40 bg-text-primary/20 transition-opacity duration-200 ease-out',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={joinClasses(
          'fixed right-0 bottom-0 left-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-lg border border-border bg-surface shadow-modal transition-transform duration-200 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        {dragHandle ? (
          <div className="flex justify-center pt-3">
            <span data-testid="bottom-sheet-drag-handle" className="h-1 w-3 rounded-full bg-border" />
          </div>
        ) : null}
        <div className="px-4 pt-4 pb-6">{children}</div>
      </div>
    </div>
  );
}
