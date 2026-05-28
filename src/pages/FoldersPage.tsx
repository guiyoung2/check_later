import type { JSX, ReactNode } from 'react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/ui/BottomNav';
import { Skeleton } from '../components/ui/Skeleton';
import { SideNav } from '../components/ui/SideNav';
import { TopAppBar } from '../components/ui/TopAppBar';
import { itemsService } from '../services/itemsService';
import { useFilterStore } from '../stores/filterStore';
import type { Item, ItemStatus, ItemType } from '../types';

type CountCardKind = ItemType | ItemStatus | 'all';

interface CountCardConfig {
  kind: CountCardKind;
  name: string;
  count: number;
  icon: ReactNode;
  className?: string;
  onClick: () => void;
}

const numberFormatter = new Intl.NumberFormat('ko-KR');

function FilmIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 5h14v14H5V5Z" strokeLinejoin="round" />
      <path d="M8 5v14M16 5v14M5 9h3M5 15h3M16 9h3M16 15h3" strokeLinecap="round" />
    </svg>
  );
}

function ArticleIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 4h9l3 3v13H6V4Z" strokeLinejoin="round" />
      <path d="M14 4v4h4M9 12h6M9 16h6" strokeLinecap="round" />
    </svg>
  );
}

function ImageIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 5h14v14H5V5Z" strokeLinejoin="round" />
      <path d="m7.5 16 3.2-3.5 2.3 2.4 1.8-2 2.7 3.1" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="9" r="1.2" />
    </svg>
  );
}

function MemoIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 5h12v14H6V5Z" strokeLinejoin="round" />
      <path d="M9 9h6M9 13h6M9 17h3" strokeLinecap="round" />
    </svg>
  );
}

function TrayIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 7h14l-1 10H6L5 7Z" strokeLinejoin="round" />
      <path d="M9 11h6" strokeLinecap="round" />
    </svg>
  );
}

function StatusIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 12h4l2 4 4-8 2 4h2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function createCounts(items: Item[] | undefined) {
  const counts = {
    all: items?.length ?? 0,
    type: {
      video: 0,
      article: 0,
      screenshot: 0,
      memo: 0,
    } satisfies Record<ItemType, number>,
    status: {
      pending: 0,
      reviewed: 0,
      archived: 0,
    } satisfies Record<ItemStatus, number>,
  };

  for (const item of items ?? []) {
    counts.type[item.type] += 1;
    counts.status[item.status] += 1;
  }

  return counts;
}

function CountCard({ name, count, icon, className, onClick }: CountCardConfig): JSX.Element {
  const isEmpty = count === 0;
  const countLabel = `${numberFormatter.format(count)}개`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${name} ${countLabel}`}
      className={joinClasses(
        'flex min-h-32 flex-col items-start justify-between rounded-md border border-border bg-surface p-4 text-left transition-[background-color,border-color,box-shadow,opacity,transform] duration-200 ease-out hover:shadow-card focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none active:translate-y-px md:p-6',
        isEmpty && 'opacity-60',
        className,
      )}
    >
      <span className={joinClasses('flex h-11 w-11 items-center justify-center rounded-sm bg-surface-sub', isEmpty ? 'text-text-muted' : 'text-text-primary')}>
        {icon}
      </span>
      <span className="mt-6 flex flex-col gap-2">
        <span className="font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-text-muted">
          {countLabel}
        </span>
        <span className={joinClasses('font-body text-[13px] leading-[1.2] font-medium tracking-[0.02em]', isEmpty ? 'text-text-muted' : 'text-text-primary')}>
          {name}
        </span>
      </span>
    </button>
  );
}

function FoldersSkeleton(): JSX.Element {
  return (
    <section aria-label="폴더 로딩 중" className="grid grid-cols-2 gap-6 md:grid-cols-3">
      {Array.from({ length: 7 }).map((_, index) => (
        <Skeleton
          key={index}
          className={joinClasses('h-32 w-full', index === 0 && 'col-span-2 md:col-span-1')}
        />
      ))}
    </section>
  );
}

export default function FoldersPage(): JSX.Element {
  const navigate = useNavigate();
  const setType = useFilterStore((s) => s.setType);
  const setStatus = useFilterStore((s) => s.setStatus);
  const resetFilters = useFilterStore((s) => s.reset);
  const { data: items, isLoading, isError } = useQuery({
    queryKey: ['items', 'counts'],
    queryFn: () => itemsService.list(),
  });

  const counts = useMemo(() => createCounts(items), [items]);

  const handleAllCard = () => {
    resetFilters();
    navigate('/');
  };
  const handleTypeCard = (type: ItemType) => {
    setType(type);
    setStatus(null);
    navigate(`/?type=${type}`);
  };
  const handleStatusCard = (status: ItemStatus) => {
    setType(null);
    setStatus(status);
    navigate(`/?status=${status}`);
  };

  const typeCards: CountCardConfig[] = [
    { kind: 'video', name: '영상', count: counts.type.video, icon: <FilmIcon />, onClick: () => handleTypeCard('video') },
    { kind: 'article', name: '글', count: counts.type.article, icon: <ArticleIcon />, onClick: () => handleTypeCard('article') },
    { kind: 'screenshot', name: '캡처', count: counts.type.screenshot, icon: <ImageIcon />, onClick: () => handleTypeCard('screenshot') },
    { kind: 'memo', name: '메모', count: counts.type.memo, icon: <MemoIcon />, onClick: () => handleTypeCard('memo') },
  ];

  const statusCards: CountCardConfig[] = [
    { kind: 'pending', name: '안봤음', count: counts.status.pending, icon: <StatusIcon />, onClick: () => handleStatusCard('pending') },
    { kind: 'reviewed', name: '봤음', count: counts.status.reviewed, icon: <StatusIcon />, onClick: () => handleStatusCard('reviewed') },
    { kind: 'archived', name: '보관', count: counts.status.archived, icon: <StatusIcon />, onClick: () => handleStatusCard('archived') },
  ];

  return (
    <div className="min-h-screen bg-bg pb-16 md:pl-60">
      <SideNav />
      <TopAppBar title="Folders" />

      <main className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-6 md:px-8">
        <header className="flex max-w-[800px] flex-col gap-2">
          <h2 className="font-body text-[32px] leading-[1.2] font-semibold text-text-primary max-md:text-[26px] max-md:leading-[1.3]">
            Folders
          </h2>
          <p className="font-body text-[14px] leading-[1.5] text-text-muted">
            유형과 상태로 정리해서 보세요
          </p>
        </header>

        {isError ? (
          <div role="alert" className="max-w-[800px] rounded-sm border border-error/30 bg-surface px-4 py-3 text-[14px] leading-[1.5] text-error">
            불러오는 중 오류가 생겼어요. 잠시 후 다시 시도해 주세요.
          </div>
        ) : null}

        {isLoading ? (
          <FoldersSkeleton />
        ) : (
          <section aria-label="폴더 목록" className="grid grid-cols-2 gap-6 md:grid-cols-3">
            <CountCard
              kind="all"
              name="전체"
              count={counts.all}
              icon={<TrayIcon />}
              className="col-span-2 md:col-span-1"
              onClick={handleAllCard}
            />
            {typeCards.map((card) => (
              <CountCard key={card.kind} {...card} />
            ))}
            <div className="col-span-2 flex items-center gap-3 md:col-span-3">
              <span className="h-px flex-1 bg-border" />
              <span className="font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-text-muted">
                상태별
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
            {statusCards.map((card) => (
              <CountCard key={card.kind} {...card} />
            ))}
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
