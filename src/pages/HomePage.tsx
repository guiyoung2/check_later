import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../hooks/useItems';
import { FilterBar } from '../components/FilterBar';
import { ItemCard } from '../components/ItemCard';

// 메인 목록 페이지
export default function HomePage(): JSX.Element {
  const { data: items, isLoading, isError } = useItems();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-10 bg-[var(--color-bg)] border-b border-[var(--color-border)] flex items-center justify-between px-4 h-14">
        <span className="font-semibold text-[var(--color-text-primary)] text-base">Check Later</span>
        <Link
          to="/new"
          aria-label="새 항목 추가"
          className="flex items-center justify-center w-11 h-11 rounded-[8px] bg-[var(--color-accent)] text-white text-xl font-medium"
        >
          +
        </Link>
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
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-[var(--color-text-sub)] text-sm">아직 저장한 항목이 없어요</p>
            <Link
              to="/new"
              className="px-4 py-2 rounded-[8px] bg-[var(--color-accent)] text-white text-sm font-medium"
            >
              첫 항목 저장하기
            </Link>
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
