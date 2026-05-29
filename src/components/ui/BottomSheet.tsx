import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

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
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    const firstFocusable = dialog?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    (firstFocusable ?? dialog)?.focus();

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1);

    if (focusable.length === 0) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
        className={joinClasses(
          'fixed right-0 bottom-0 left-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-lg border border-border bg-surface shadow-modal transition-transform duration-200 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <h2 id={titleId} className="sr-only">작업 메뉴</h2>
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
