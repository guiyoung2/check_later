import type { JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useItems } from '../hooks/useItems';
import { useFilterStore } from '../stores/filterStore';
import { BottomNav } from '../components/ui/BottomNav';
import { SideNav } from '../components/ui/SideNav';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { TopAppBar } from '../components/ui/TopAppBar';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { FilterBar } from '../components/FilterBar';
import { ItemCard } from '../components/ItemCard';

function AccountIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
    </svg>
  );
}

function AccountLink(): JSX.Element {
  return (
    <Link
      to="/settings"
      aria-label="설정"
      className="flex h-11 w-11 items-center justify-center rounded-sm text-text-primary transition-[background-color,box-shadow] duration-200 ease-out hover:bg-surface-sub focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none"
    >
      <AccountIcon />
    </Link>
  );
}

function LoadingFeed(): JSX.Element {
  return (
    <div className="flex flex-col gap-6" aria-label="목록 로딩 중">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export default function HomePage(): JSX.Element {
  const navigate = useNavigate();
  const { data: items, isLoading, isError } = useItems();
  const type = useFilterStore((s) => s.type);
  const status = useFilterStore((s) => s.status);
  const clearFilters = useFilterStore((s) => s.reset);
  const hasFilters = type !== null || status !== null;

  return (
    <div className="min-h-screen bg-bg pb-16 md:pl-60">
      <SideNav />
      <TopAppBar
        title="Check Later"
        rightAction={
          <div className="flex items-center">
            <ThemeToggleButton />
            <AccountLink />
          </div>
        }
      />
      <FilterBar />

      <main className="mx-auto flex max-w-[800px] flex-col gap-6 px-4 py-6 md:px-6">
        {isError ? (
          <div
            role="alert"
            className="rounded-sm border border-error/30 bg-surface px-4 py-3 text-[14px] leading-[1.5] text-error"
          >
            불러오는 중 오류가 생겼어요. 잠시 후 다시 시도해 주세요.
          </div>
        ) : null}

        {isLoading ? <LoadingFeed /> : null}

        {!isLoading && !isError && items?.length === 0 && !hasFilters ? (
          <EmptyState
            title="아직 저장한 것이 없어요"
            description="공유 메뉴에서 던지거나 + 버튼으로 적어보세요"
            action={{ label: '새로 추가', onClick: () => navigate('/new') }}
          />
        ) : null}

        {!isLoading && !isError && items?.length === 0 && hasFilters ? (
          <EmptyState title="조건에 맞는 것이 없어요" action={{ label: '필터 초기화', onClick: clearFilters }} />
        ) : null}

        {!isLoading && !isError && items && items.length > 0 ? (
          <ul className="flex flex-col gap-6">
            {items.map((item) => (
              <li key={item.id}>
                <ItemCard item={item} />
              </li>
            ))}
          </ul>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}
