import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../hooks/useItems';
import { FilterBar } from '../components/FilterBar';
import { ItemCard } from '../components/ItemCard';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { supabase } from '../lib/supabase';

const EMPTY_STATE_POINTS = [
  '공유 메뉴나 + 버튼으로 URL, 영상, 메모를 저장하세요.',
  '저장한 항목은 형태와 상태 필터로 다시 찾을 수 있어요.',
  '봤으면 상태를 바꾸고, 필요 없으면 보관하세요.',
];

// 메인 목록 페이지
export default function HomePage(): JSX.Element {
  const { data: items, isLoading, isError } = useItems();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-10 bg-[var(--color-bg)] border-b border-[var(--color-border)] flex items-center justify-between px-4 h-14">
        <span className="font-semibold text-[var(--color-text-primary)] text-base">Check Later</span>
        <div className="flex items-center gap-1">
          <ThemeToggleButton />
          <Link
            to="/new"
            aria-label="새 항목 추가"
            className="flex items-center justify-center w-9 h-9 rounded-[8px] bg-[var(--color-accent)] text-white text-xl font-medium"
          >
            +
          </Link>
          <Link
            to="/settings"
            aria-label="설정"
            className="flex items-center justify-center w-9 h-9 rounded-[8px] text-[var(--color-text-sub)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </Link>
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="h-9 px-2 rounded-[8px] text-xs font-medium text-[var(--color-text-sub)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <FilterBar />

      <main className="px-4 py-2">
        {isLoading && (
          <p className="text-[var(--color-text-sub)] text-sm py-8 text-center">불러오는 중...</p>
        )}

        {isError && (
          <p className="text-[var(--color-text-sub)] text-sm py-8 text-center">
            잠시 후 다시 시도해주세요
          </p>
        )}

        {!isLoading && !isError && items?.length === 0 && (
          <div className="mx-auto flex max-w-sm flex-col gap-8 py-14">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium text-[var(--color-accent)]">아직 저장한 항목이 없어요</p>
              <h1 className="text-xl font-semibold leading-snug text-[var(--color-text-primary)]">
                나중에 볼 것들을 빠르게 저장하고, 원할 때 바로 찾아보세요.
              </h1>
              <p className="text-sm leading-6 text-[var(--color-text-sub)]">
                URL, 영상, 메모를 던져두고 필터로 다시 꺼내는 개인 보관함입니다.
              </p>
            </div>
            <Link
              to="/new"
              className="self-start px-5 py-2.5 rounded-[8px] bg-[var(--color-accent)] text-white text-sm font-medium"
            >
              첫 항목 저장하기
            </Link>
            <ul className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-6">
              {EMPTY_STATE_POINTS.map((point) => (
                <li key={point} className="flex gap-2 text-sm leading-6 text-[var(--color-text-sub)]">
                  <span className="text-[var(--color-accent)]" aria-hidden="true">
                    ✓
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isLoading && !isError && items && items.length > 0 && (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id}>
                <ItemCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
