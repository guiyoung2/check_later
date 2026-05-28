import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
}

const baseClasses =
  'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-sm font-body font-medium transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50';

const variantClasses = {
  primary: 'bg-text-primary text-bg hover:opacity-80 active:opacity-70',
  secondary: 'border border-border bg-surface text-text-primary hover:bg-surface-sub active:bg-surface-sub',
  ghost: 'bg-transparent text-text-primary hover:bg-surface-sub active:bg-surface-sub',
  danger: 'bg-error text-bg hover:opacity-80 active:opacity-70',
};

const sizeClasses = {
  sm: 'px-3 py-2 text-[13px] leading-[1.2] tracking-[0.02em]',
  md: 'px-4 py-2.5 text-[14px] leading-[1.5]',
};

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={joinClasses(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </button>
  );
}
