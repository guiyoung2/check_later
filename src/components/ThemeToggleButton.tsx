import type { JSX } from 'react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleButtonProps {
  className?: string;
}

export function ThemeToggleButton({ className = '' }: ThemeToggleButtonProps): JSX.Element {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? '라이트 모드로 전환' : '다크 모드로 전환';
  const baseClassName =
    'flex h-11 w-11 items-center justify-center rounded-[8px] text-[var(--color-text-sub)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] transition-colors';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      className={`${baseClassName} ${className}`.trim()}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon(): JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon(): JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.99 13.06A8 8 0 1 1 10.94 3.01 6.5 6.5 0 0 0 20.99 13.06Z" />
    </svg>
  );
}
