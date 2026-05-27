import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  'URL, 영상, 메모를 한 곳에 저장',
  '형태·상태 3축으로 분류',
  '필터로 30초 안에 다시 찾기',
];

// 비인증 사용자용 랜딩 페이지
export default function LandingPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-10 bg-[var(--color-bg)] border-b border-[var(--color-border)] flex items-center justify-between px-4 h-14">
        <span className="font-semibold text-[var(--color-text-primary)] text-base">
          Check Later
        </span>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="px-3 py-1.5 rounded-[8px] border border-[var(--color-border)] text-sm text-[var(--color-text-sub)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors"
        >
          로그인
        </button>
      </header>

      <main className="px-6 py-16 max-w-sm mx-auto flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)] leading-snug">
              나중에 볼 것들을 빠르게 저장하고,
              <br />
              원할 때 바로 찾아보세요.
            </h1>
            <p className="text-sm text-[var(--color-text-sub)]">
              URL, 영상, 메모를 던져두고, 필터로 30초 안에 다시 꺼내는 개인 보관함.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="self-start px-5 py-2.5 rounded-[8px] bg-[var(--color-accent)] text-white text-sm font-medium"
          >
            시작하기 →
          </button>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        <ul className="flex flex-col gap-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-text-sub)]">
              <span className="text-[var(--color-accent)] mt-px">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
