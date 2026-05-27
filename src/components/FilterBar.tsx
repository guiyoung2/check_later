import type { JSX } from 'react';
import { useFilterStore } from '../stores/filterStore';
import type { ItemType, ItemStatus } from '../types';

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

const TYPE_VALUES: ItemType[] = ['video', 'article', 'screenshot', 'memo'];
const STATUS_VALUES: ItemStatus[] = ['pending', 'reviewed', 'archived'];

// type·status 필터 칩 바
export function FilterBar(): JSX.Element {
  const type = useFilterStore((s) => s.type);
  const status = useFilterStore((s) => s.status);
  const setType = useFilterStore((s) => s.setType);
  const setStatus = useFilterStore((s) => s.setStatus);

  return (
    <div
      className="flex items-center gap-2 overflow-x-auto px-4 py-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
    >
      {TYPE_VALUES.map((t) => (
        <button
          key={t}
          onClick={() => setType(type === t ? null : t)}
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            type === t
              ? 'bg-[--color-accent-bg] text-[--color-accent]'
              : 'bg-[--color-surface] border border-[--color-border] text-[--color-text-sub]'
          }`}
        >
          {TYPE_LABELS[t]}
        </button>
      ))}
      <div className="w-px shrink-0 self-stretch bg-[--color-border] mx-1" />
      {STATUS_VALUES.map((s) => (
        <button
          key={s}
          onClick={() => setStatus(status === s ? null : s)}
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            status === s
              ? 'bg-[--color-accent-bg] text-[--color-accent]'
              : 'bg-[--color-surface] border border-[--color-border] text-[--color-text-sub]'
          }`}
        >
          {STATUS_LABELS[s]}
        </button>
      ))}
    </div>
  );
}
