import type { CSSProperties } from 'react';

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function toSize(value: string | number | undefined) {
  return typeof value === 'number' ? `${value}px` : value;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  const style: CSSProperties = {
    width: toSize(width),
    height: toSize(height),
  };

  return (
    <div
      data-testid="skeleton"
      className={joinClasses('animate-pulse rounded-md bg-surface-sub', className)}
      style={style}
      aria-hidden="true"
    />
  );
}
