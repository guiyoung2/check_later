import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const INTRO_STEPS = [
  { title: '저장', line1: '공유 메뉴', line2: '한 번으로' },
  { title: '분류', line1: '유형·상태', line2: '자동분류' },
  { title: '조회', line1: '필터+정렬', line2: '30초 내' },
];

// 비인증 사용자용 1-viewport 랜딩 페이지
export default function LandingPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-10 text-text-primary">
      <section className="flex w-full max-w-[800px] flex-col items-center gap-10 text-center">
        <h1 className="max-w-[12ch] text-[26px] leading-[1.3] font-semibold text-text-primary sm:max-w-[16ch] sm:text-[32px] sm:leading-[1.2]">
          공유 한 번이면 끝, 30초 안에 찾는다
        </h1>

        <div className="grid w-full gap-3 sm:grid-cols-3">
          {INTRO_STEPS.map((step) => (
            <article
              key={step.title}
              className="flex min-h-[136px] flex-col justify-between rounded-md border border-border bg-surface px-4 py-5 text-left shadow-card"
            >
              <h2 className="text-[18px] leading-[1.5] font-medium text-text-primary">
                {step.title}
              </h2>
              <p className="text-[14px] leading-[1.5] text-text-muted">
                {step.line1}
                <br />
                {step.line2}
              </p>
            </article>
          ))}
        </div>

        <Button
          type="button"
          aria-label="시작하기 →"
          onClick={() => navigate('/login')}
          rightIcon={<span aria-hidden="true">→</span>}
        >
          시작하기
        </Button>
      </section>
    </main>
  );
}
