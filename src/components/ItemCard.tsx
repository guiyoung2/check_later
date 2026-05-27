import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import type { Item, ItemType, ItemStatus } from '../types';

const TYPE_LABELS: Record<ItemType, string> = {
  video: '영상',
  article: '글',
  screenshot: '캡처',
  memo: '메모',
};

const STATUS_LABELS: Record<ItemStatus, string> = {
  pending: '안 봤음',
  reviewed: '봤음',
  archived: '보관',
};

// 상대 날짜 포맷 (예: "오늘", "3일 전")
function relativeDate(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  if (days < 365) return `${Math.floor(days / 30)}달 전`;
  return `${Math.floor(days / 365)}년 전`;
}

interface ItemCardProps {
  item: Item;
}

// 아이템 한 행 (텍스트 우선, 썸네일 보조)
export function ItemCard({ item }: ItemCardProps): JSX.Element {
  return (
    <Link
      to={`/items/${item.id}`}
      className="flex items-center gap-3 rounded-[6px] bg-[--color-surface] px-4 py-3 shadow-[0_1px_3px_oklch(20%_0.01_80_/_0.08)] dark:shadow-none hover:bg-[--color-accent-bg] transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[--color-text-primary] truncate text-sm leading-snug">
          {item.title}
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-[--color-text-sub]">
          <span>{TYPE_LABELS[item.type]}</span>
          <span aria-hidden>·</span>
          <span>{STATUS_LABELS[item.status]}</span>
          <span aria-hidden>·</span>
          <span>{relativeDate(item.created_at)}</span>
        </div>
      </div>
      {item.image_path && (
        <div className="shrink-0 w-12 h-12 rounded-[4px] bg-[--color-border]" aria-hidden />
      )}
    </Link>
  );
}
