import { useEffect, type ReactNode } from 'react';
import { useToastStore, type ToastOptions } from '../../stores/toastStore';
import { Button } from './Button';

export interface ToastProps {
  message: string;
  undo?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export function useToast() {
  const showToast = useToastStore((state) => state.showToast);
  const hideToast = useToastStore((state) => state.hideToast);

  return { showToast, hideToast };
}

export function Toast({ message, undo, duration = 4000 }: ToastProps) {
  const hideToast = useToastStore((state) => state.hideToast);

  useEffect(() => {
    const timeoutId = window.setTimeout(hideToast, duration);
    return () => window.clearTimeout(timeoutId);
  }, [duration, hideToast, message]);

  const handleUndo = () => {
    undo?.onClick();
    hideToast();
  };

  return (
    <div
      role="status"
      className="fixed right-4 bottom-20 left-4 z-50 mx-auto flex max-w-[520px] items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-text-primary shadow-overlay"
    >
      <span className="font-body text-[14px] leading-[1.5]">{message}</span>
      {undo ? (
        <Button type="button" variant="ghost" size="sm" onClick={handleUndo}>
          {undo.label}
        </Button>
      ) : null}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useToastStore((state) => state.toast as ToastOptions | null);

  return (
    <>
      {children}
      {toast ? <Toast message={toast.message} undo={toast.undo} duration={toast.duration} /> : null}
    </>
  );
}
