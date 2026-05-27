import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// 설정 페이지: 계정 정보, 로그아웃, PWA 설치
export default function SettingsPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  // lazy initializer로 초기값 설정 → useEffect 안에서 setState 호출 불필요
  const [isInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches
  );

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // PWA 설치 프롬프트 호출
  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
  }

  // 로그아웃: signOut 후 AuthProvider가 자동으로 /login으로 리다이렉트
  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-10 bg-[var(--color-bg)] border-b border-[var(--color-border)] flex items-center px-4 h-14">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="flex items-center justify-center w-9 h-9 rounded-[8px] text-[var(--color-text-sub)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
        >
          ←
        </button>
        <span className="ml-3 text-base font-semibold text-[var(--color-text-primary)]">설정</span>
      </header>

      <div className="px-4 py-5 max-w-lg mx-auto flex flex-col gap-6">
        {/* 계정 정보 섹션 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-medium text-[var(--color-text-sub)] uppercase tracking-wide">계정</h2>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[6px] px-4 py-3 flex flex-col gap-3">
            <p className="text-sm text-[var(--color-text-primary)]">{user?.email ?? '—'}</p>
            <button
              type="button"
              onClick={handleSignOut}
              className="self-start px-3 py-1.5 rounded-[8px] border border-[var(--color-border)] text-sm text-[var(--color-text-sub)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] transition-colors"
            >
              로그아웃
            </button>
          </div>
        </section>

        {/* PWA 설치 섹션 */}
        {(deferredPrompt || isInstalled) && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-medium text-[var(--color-text-sub)] uppercase tracking-wide">앱 설치</h2>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[6px] px-4 py-3 flex flex-col gap-3">
              {isInstalled ? (
                <p className="text-sm text-[var(--color-text-sub)]">이미 홈 화면에 설치되어 있어요</p>
              ) : (
                <>
                  <p className="text-sm text-[var(--color-text-sub)]">홈 화면에 추가하면 앱처럼 빠르게 열 수 있어요</p>
                  <button
                    type="button"
                    onClick={handleInstall}
                    className="self-start px-3 py-1.5 rounded-[8px] bg-[var(--color-accent)] text-white text-sm font-medium"
                  >
                    홈 화면에 추가
                  </button>
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
