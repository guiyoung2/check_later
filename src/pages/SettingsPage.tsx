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

// iOS Safari 여부 감지
function isIOSSafari() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
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
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const isIOS = isIOSSafari();
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
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
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
            ) : isIOS || deferredPrompt ? (
              <Button type="button" variant="secondary" size="sm" className="self-start" onClick={handleInstall}>
                홈 화면에 추가
              </Button>
            ) : (
              <p className="font-body text-[14px] leading-[1.5] text-text-muted">
                브라우저 주소창의 설치 아이콘을 눌러 설치하세요
              </p>
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

      {/* iOS 홈 화면 추가 안내 모달 */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 pb-safe"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-[480px] rounded-t-2xl bg-bg px-6 pb-8 pt-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-body text-[16px] font-medium leading-[1.6] text-text-primary">
                홈 화면에 추가하기
              </h2>
              <button
                type="button"
                className="font-body text-[14px] leading-[1.5] text-text-muted"
                onClick={() => setShowIOSGuide(false)}
              >
                닫기
              </button>
            </div>
            <ol className="flex flex-col gap-3">
              <li className="flex gap-3">
                <span className="font-mono text-[12px] font-medium leading-[1.8] tracking-[0.08em] text-text-muted">01</span>
                <p className="font-body text-[14px] leading-[1.5] text-text-primary">
                  Safari 하단의 <strong>공유 버튼</strong> (□↑)을 탭하세요
                </p>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[12px] font-medium leading-[1.8] tracking-[0.08em] text-text-muted">02</span>
                <p className="font-body text-[14px] leading-[1.5] text-text-primary">
                  메뉴를 아래로 스크롤해 <strong>홈 화면에 추가</strong>를 탭하세요
                </p>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[12px] font-medium leading-[1.8] tracking-[0.08em] text-text-muted">03</span>
                <p className="font-body text-[14px] leading-[1.5] text-text-primary">
                  오른쪽 상단 <strong>추가</strong>를 탭하면 완료됩니다
                </p>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
