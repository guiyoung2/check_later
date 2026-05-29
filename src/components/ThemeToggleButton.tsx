import type { JSX } from 'react';
import { useState } from 'react';
import { isDarkActive, setThemePreference, type ThemePreference } from '../lib/theme';

interface ThemeToggleButtonProps {
  className?: string;
}

// 다크/라이트 토글 버튼 (설정과 동일한 영속 저장을 공유)
export function ThemeToggleButton({ className = '' }: ThemeToggleButtonProps): JSX.Element {
  const [dark, setDark] = useState(isDarkActive);
  const label = dark ? '라이트 모드로 전환' : '다크 모드로 전환';

  function handleToggle() {
    const next: ThemePreference = dark ? 'light' : 'dark';
    setThemePreference(next);
    setDark(next === 'dark');
  }

  const baseClassName =
    'flex h-11 w-11 items-center justify-center rounded-sm text-text-muted transition-[background-color,color] duration-200 ease-out hover:bg-surface-sub hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none';

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={label}
      className={`${baseClassName} ${className}`.trim()}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
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
