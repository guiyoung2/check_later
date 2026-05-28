import { useId, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export function Textarea({ error, className, id, 'aria-describedby': ariaDescribedBy, ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;

  return (
    <div className="grid gap-2">
      <textarea
        id={textareaId}
        className={joinClasses(
          'min-h-[120px] resize-y rounded-sm border border-border bg-surface px-3 py-2 font-body text-[16px] leading-[1.6] text-text-primary transition-[background-color,border-color,box-shadow,opacity] duration-200 ease-out placeholder:text-text-muted hover:border-border-strong focus:border-border-strong focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none disabled:pointer-events-none disabled:bg-surface-sub disabled:opacity-50',
          error && 'border-error focus:border-error focus-visible:ring-error',
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : ariaDescribedBy}
        {...props}
      />
      {error ? (
        <p id={errorId} className="font-body text-[13px] leading-[1.2] font-medium tracking-[0.02em] text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
