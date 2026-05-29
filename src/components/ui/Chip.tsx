import type { ReactNode } from 'react';

export interface ChipProps {
  variant?: 'type' | 'status' | 'count';
  leftIcon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
}

const variantClasses = {
  type: 'rounded-xs font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em]',
  status: 'rounded-full font-body text-[13px] leading-[1.2] font-medium tracking-[0.02em]',
  count: 'rounded-full font-mono text-[13px] leading-[1.2] font-medium tracking-[0.02em]',
};

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export function Chip({ variant = 'status', leftIcon, children, onClick, active = false }: ChipProps) {
  // active는 색이 아니라 fill로 강조 (bg-text-primary text-bg)
  const colorClasses = active ? 'bg-text-primary text-bg' : 'bg-surface-sub text-text-secondary';
  const interactiveClasses = onClick
    ? joinClasses(
        'min-h-[44px] min-w-[44px] cursor-pointer justify-center active:translate-y-px focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        active ? 'hover:opacity-90' : 'hover:bg-surface hover:text-text-primary',
      )
    : '';
  const className = joinClasses(
    'inline-flex items-center gap-1.5 px-2.5 py-1.5 transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out',
    variantClasses[variant],
    colorClasses,
    interactiveClasses,
  );

  if (onClick) {
    return (
      <button type="button" className={className} aria-pressed={active} onClick={onClick}>
        {leftIcon}
        <span>{children}</span>
      </button>
    );
  }

  return (
    <span className={className} aria-pressed={active}>
      {leftIcon}
      {children}
    </span>
  );
}
