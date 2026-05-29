import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/ui/BottomNav';
import { Button } from '../components/ui/Button';
import { Divider } from '../components/ui/Divider';
import { SideNav } from '../components/ui/SideNav';
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

const numberFormatter = new Intl.NumberFormat('ko-KR');

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

// 설정 페이지: 계정, 설치, 데이터 상태
export default function SettingsPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(isAppInstalled);
  const { data: items, isLoading: isCountLoading, isError: isCountError } = useQuery({
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

  const itemCount = isCountLoading || isCountError ? '—' : `${numberFormatter.format(items?.length ?? 0)}개`;

  return (
    <div className="min-h-screen bg-bg pb-16 md:pl-60">
      <SideNav />
      <TopAppBar title="설정" />

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

        <section className="flex flex-col gap-4" aria-labelledby="settings-data">
          <SectionHeader>DATA</SectionHeader>
          <div className="flex min-h-[44px] items-center justify-between gap-4">
            <p id="settings-data" className="font-body text-[14px] leading-[1.5] text-text-primary">
              저장된 항목
            </p>
            <p className="font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-text-muted">
              {itemCount}
            </p>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
