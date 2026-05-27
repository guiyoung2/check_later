import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggleButton } from '../components/ThemeToggleButton';

const SAVE_TARGETS = [
  { label: 'URL', description: '읽을 글과 참고 링크를 그대로 둡니다.' },
  { label: '영상', description: 'YouTube 링크는 영상으로 먼저 분류합니다.' },
  { label: '메모', description: '짧은 생각만 있어도 저장할 수 있습니다.' },
];

const FLOW_STEPS = [
  '공유 메뉴에서 /new로 열기',
  '제목과 메모를 확인하기',
  '형태와 상태 필터로 다시 찾기',
];

// 비인증 사용자용 랜딩 페이지
export default function LandingPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4">
        <span className="min-w-0 truncate text-base font-semibold text-[var(--color-text-primary)]">
          Check Later
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggleButton />
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex min-h-11 items-center rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-medium text-[var(--color-text-sub)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            로그인
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-5 py-10 sm:px-6 sm:py-14">
        <section className="flex flex-col gap-6">
          <p className="text-xs font-medium text-[var(--color-accent)]">
            저장은 빠르게, 다시 찾기는 차분하게
          </p>
          <h1 className="max-w-xl text-xl font-semibold leading-snug text-[var(--color-text-primary)]">
            나중에 볼 URL, 영상, 메모를 한 곳에 두고 필요할 때 바로 꺼내세요.
          </h1>
          <p className="max-w-xl text-sm leading-6 text-[var(--color-text-sub)]">
            공유로 들어온 링크와 짧은 메모를 확인하고, 앱에서는 형태와 상태만 고르면 됩니다.
            태그나 폴더를 정리하지 않아도 최근순 목록에서 흐름을 잃지 않습니다.
          </p>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex min-h-11 self-start items-center rounded-[8px] bg-[var(--color-accent)] px-5 text-sm font-medium text-white"
          >
            시작하기
          </button>
        </section>

        <div className="border-t border-[var(--color-border)]" />

        <section className="grid gap-8 sm:grid-cols-[1fr_1.1fr]">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              저장할 수 있는 것
            </h2>
            <ul className="flex flex-col divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {SAVE_TARGETS.map((target) => (
                <li key={target.label} className="flex gap-3 py-3">
                  <span className="flex h-7 min-w-12 items-center justify-center rounded-full bg-[var(--color-accent-bg)] px-3 text-xs font-medium text-[var(--color-accent)]">
                    {target.label}
                  </span>
                  <span className="text-sm leading-6 text-[var(--color-text-sub)]">
                    {target.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              다시 찾는 흐름
            </h2>
            <ol className="flex flex-col gap-2">
              {FLOW_STEPS.map((step, index) => (
                <li
                  key={step}
                  className="flex items-center gap-3 rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 text-sm text-[var(--color-text-sub)]"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-bg)] text-xs font-medium text-[var(--color-accent)]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4">
          <p className="text-sm leading-6 text-[var(--color-text-sub)]">
            PWA로 홈 화면에 두면 앱처럼 열 수 있고, 모바일 공유 메뉴에서 바로 저장 화면으로
            들어갈 수 있습니다.
          </p>
        </section>
      </main>
    </div>
  );
}
