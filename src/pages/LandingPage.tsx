import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ThemeToggleButton } from '../components/ThemeToggleButton';

const FEATURES = [
  {
    no: '01',
    title: '저장',
    desc: '공유 메뉴에서 한 번으로. 링크, 메모, 스크린샷 모두 받습니다.',
  },
  {
    no: '02',
    title: '분류',
    desc: '영상·글·메모·캡처로 자동 구분되고, 상태도 직접 바꿀 수 있습니다.',
  },
  {
    no: '03',
    title: '조회',
    desc: '유형과 상태로 필터하면 30초 안에 원하는 항목을 꺼냅니다.',
  },
];

const MOCK_ITEMS = [
  { badge: '영상', title: 'React 18 동시성 모드 완벽 정리', status: '안 봤음' },
  { badge: '글', title: '디자인 시스템 설계 가이드', status: '봤음' },
  { badge: '메모', title: '주간 회고 - 이번 주 배운 것들', status: '보관' },
] as const;

// 소형 앱 화면 목업 (정적, 기존 토큰 사용)
function MiniPreview(): JSX.Element {
  const tabs = ['전체', '영상', '글'] as const;

  return (
    <div className="w-full max-w-[340px] overflow-hidden rounded-md border border-border bg-surface shadow-overlay">
      <div className="flex gap-2 border-b border-border px-4 py-2.5">
        {tabs.map((label, i) => (
          <span
            key={label}
            className={
              i === 0
                ? 'rounded-full bg-surface-sub px-2.5 py-1 text-[12px] font-medium leading-[1.2] text-text-primary'
                : 'rounded-full px-2.5 py-1 text-[12px] font-medium leading-[1.2] text-text-muted'
            }
          >
            {label}
          </span>
        ))}
      </div>
      <ul>
        {MOCK_ITEMS.map((item) => (
          <li
            key={item.title}
            className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
          >
            <span className="flex h-7 w-8 flex-shrink-0 items-center justify-center rounded-xs bg-surface-sub font-mono text-[11px] font-medium text-text-muted">
              {item.badge[0]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium leading-[1.4] text-text-primary">
                {item.title}
              </p>
              <p className="text-[11px] leading-[1.4] text-text-muted">{item.status}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 비인증 사용자용 첫 화면 (랜딩)
export default function LandingPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text-primary">
      {/* 상단바: 브랜드 + 테마 토글 + Login */}
      <header className="flex h-16 items-center justify-between px-4 md:px-6">
        <span className="font-body text-[20px] leading-[1.4] font-semibold text-text-primary">
          Check Later
        </span>
        <div className="flex items-center gap-1">
          <ThemeToggleButton />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-12 md:py-16">
        {/* 히어로: 텍스트(left) + 소형 프리뷰(right) */}
        <section className="w-full max-w-[800px]">
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:gap-16">
            <div className="flex flex-col gap-6 md:flex-1">
              <div className="flex flex-col gap-3">
                <h1 className="text-[28px] leading-[1.25] font-semibold text-text-primary sm:text-[40px]">
                  나중에 볼 것들,
                  <br />
                  한 곳에
                </h1>
                <p className="max-w-[36ch] text-[16px] leading-[1.6] text-text-secondary">
                  공유 메뉴에서 바로 저장하고, 유형과 상태로 필터해 꺼내 봅니다.
                </p>
              </div>
              <Button
                type="button"
                aria-label="시작하기 →"
                onClick={() => navigate('/login')}
                rightIcon={<span aria-hidden="true">→</span>}
                className="w-full sm:w-auto"
              >
                시작하기
              </Button>
            </div>

            <div className="flex w-full justify-center md:flex-1 md:justify-end">
              <MiniPreview />
            </div>
          </div>
        </section>

        {/* 기능 소개 3블록 */}
        <section className="mt-16 w-full max-w-[800px] md:mt-20">
          <ol className="grid w-full gap-3 sm:grid-cols-3">
            {FEATURES.map((feat) => (
              <li
                key={feat.title}
                className="flex min-h-[140px] flex-col justify-between rounded-md border border-border bg-surface px-5 py-5 text-left shadow-card"
              >
                <span className="font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-text-muted">
                  {feat.no}
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[18px] leading-[1.5] font-medium text-text-primary">
                    {feat.title}
                  </h2>
                  <p className="text-[14px] leading-[1.5] text-text-muted">{feat.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
