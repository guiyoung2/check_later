import type { ButtonHTMLAttributes } from 'react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md';
  'aria-label': string;
}

const sizeClasses = {
  sm: 'h-11 w-11',
  md: 'h-12 w-12',
};

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function IconButton({ size = 'md', className, children, ...props }: IconButtonProps) {
  return (
    <button
      className={joinClasses(
        'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm border border-transparent bg-transparent text-text-primary transition-[background-color,border-color,box-shadow,opacity,transform] duration-200 ease-out hover:bg-surface-sub active:translate-y-px active:bg-surface-sub focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
