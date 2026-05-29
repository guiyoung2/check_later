import type { ReactNode } from 'react';

export interface TopAppBarProps {
  title?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
}

export function TopAppBar({ title, leftAction, rightAction }: TopAppBarProps) {
  return (
    <header role="banner" className="sticky top-0 z-30 grid h-16 grid-cols-[64px_1fr_64px] items-center border-b border-border bg-surface px-2">
      <div className="flex items-center justify-start">{leftAction}</div>
      {title ? <h1 className="truncate text-center font-body text-[24px] leading-[1.4] font-semibold text-text-primary">{title}</h1> : <div />}
      <div className="flex items-center justify-end">{rightAction}</div>
    </header>
  );
}
