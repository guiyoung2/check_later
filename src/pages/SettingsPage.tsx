import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/ui/BottomNav';
import { Button } from '../components/ui/Button';
import { Divider } from '../components/ui/Divider';
import { TopAppBar } from '../components/ui/TopAppBar';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { itemsService } from '../services/itemsService';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

type ThemePreference = 'system' | 'light' | 'dark';

const themeStorageKey = 'check-later-theme';
const themeOptions: Array<{ value: ThemePreference; label: string }> = [
  { value: 'system', label: '시스템' },
  { value: 'light', label: '라이트' },
  { value: 'dark', label: '다크' },
];
const numberFormatter = new Intl.NumberFormat('ko-KR');

function getStoredTheme(): ThemePreference {
  const value = localStorage.getItem(themeStorageKey);
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

function prefersDarkMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyThemePreference(theme: ThemePreference) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'dark' || (theme === 'system' && prefersDarkMode())) {
    root.classList.add('dark');
    return;
  }

  if (theme === 'light') {
    root.classList.add('light');
  }
}

function isAppInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as NavigatorWithStandalone).standalone)
  );
}

function SectionHeader({ children }: { children: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-mono text-[12px] leading-[1.2] font-medium tracking-[0.08em] text-text-muted uppercase">
        {children}
      </h2>
      <Divider />
    </div>
  );
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

// 설정 페이지: 계정, 설치, 테마, 데이터 상태
export default function SettingsPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(isAppInstalled);
  const [theme, setTheme] = useState<ThemePreference>(getStoredTheme);
  const { data: items } = useQuery({
    queryKey: ['items', 'settings-count'],
    queryFn: () => itemsService.list(),
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    localStorage.setItem(themeStorageKey, theme);
    applyThemePreference(theme);

    if (theme !== 'system') return undefined;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyThemePreference('system');
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [theme]);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
    setIsInstalled(isAppInstalled());
  }

  // 로그아웃 후 루트에서 비인증 랜딩을 보여준다
  async function handleSignOut() {
    navigate('/', { replace: true });
    await supabase.auth.signOut();
  }

  const itemCount = numberFormatter.format(items?.length ?? 0);

  return (
    <div className="min-h-screen bg-bg pb-16">
      <TopAppBar title="Settings" />

      <main className="mx-auto flex max-w-[600px] flex-col gap-8 px-6 py-6">
        <section className="flex flex-col gap-4" aria-labelledby="settings-account">
          <SectionHeader>ACCOUNT</SectionHeader>
          <div className="flex min-h-[44px] items-center justify-between gap-4">
            <p id="settings-account" className="truncate font-body text-[14px] leading-[1.5] text-text-primary">
              {user?.email ?? '로그인 정보 없음'}
            </p>
            <Button type="button" variant="secondary" size="sm" onClick={handleSignOut}>
              로그아웃
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="settings-app">
          <SectionHeader>APP</SectionHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h3 id="settings-app" className="font-body text-[16px] leading-[1.6] font-medium text-text-primary">
                앱 설치
              </h3>
              <p className="font-body text-[14px] leading-[1.5] text-text-muted">
                홈 화면에 추가하면 더 빠르게 사용할 수 있어요
              </p>
            </div>
            {isInstalled ? (
              <p className="font-body text-[14px] leading-[1.5] text-text-muted">이미 설치되어 있어요</p>
            ) : (
              <Button type="button" variant="secondary" size="sm" className="self-start" onClick={handleInstall}>
                홈 화면에 추가
              </Button>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="settings-theme">
          <SectionHeader>THEME</SectionHeader>
          <div id="settings-theme" className="grid grid-cols-3 rounded-sm border border-border bg-surface p-1">
            {themeOptions.map((option) => {
              const isSelected = theme === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  aria-pressed={isSelected}
                  className={joinClasses(
                    'min-h-[44px] rounded-xs px-3 font-body text-[13px] leading-[1.2] font-medium tracking-[0.02em] transition-[background-color,color,box-shadow] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none',
                    isSelected ? 'bg-text-primary text-bg' : 'text-text-muted hover:bg-surface-sub hover:text-text-primary',
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="settings-data">
          <SectionHeader>DATA</SectionHeader>
          <div className="flex min-h-[44px] items-center justify-between gap-4">
            <p id="settings-data" className="font-body text-[14px] leading-[1.5] text-text-primary">
              저장된 항목
            </p>
            <p className="font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-text-muted">
              {itemCount}개
            </p>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
