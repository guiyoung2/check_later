import type { ReactNode } from 'react';

export interface CardProps {
  hoverable?: boolean;
  as?: 'article' | 'a' | 'div';
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export function Card({ hoverable = false, as = 'div', href, onClick, children, className }: CardProps) {
  const classes = joinClasses(
    'block rounded-md border border-border bg-surface transition-[background-color,border-color,box-shadow,opacity,transform] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none active:translate-y-px',
    hoverable && 'hover:shadow-card',
    onClick && 'cursor-pointer',
    className,
  );

  if (as === 'a') {
    return (
      <a className={classes} href={href} onClick={onClick}>
        {children}
      </a>
    );
  }

  if (as === 'article') {
    return (
      <article className={classes} onClick={onClick}>
        {children}
      </article>
    );
  }

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}
