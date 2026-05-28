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
      className="sticky top-14 z-10 flex flex-col gap-2 border-b border-border bg-bg px-4 py-3 sm:flex-row sm:items-center sm:overflow-x-auto sm:border-b-0 sm:py-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
    >
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
        <span className="text-xs font-medium text-text-sub sm:hidden">유형</span>
        <div role="group" aria-label="유형 필터" className="grid grid-cols-4 gap-1.5 sm:flex sm:gap-2">
          {TYPE_VALUES.map((t) => (
            <button
              key={t}
              onClick={() => setType(type === t ? null : t)}
              className={`min-h-11 shrink-0 rounded-full px-2.5 text-sm font-medium transition-colors sm:min-h-0 sm:px-3 sm:py-1 ${
                type === t
                  ? 'bg-accent-bg text-accent'
                  : 'bg-surface border border-border text-text-sub'
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>
      <div className="hidden w-px shrink-0 self-stretch bg-border mx-1 sm:block" />
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
        <span className="text-xs font-medium text-text-sub sm:hidden">상태</span>
        <div role="group" aria-label="상태 필터" className="grid grid-cols-3 gap-1.5 sm:flex sm:gap-2">
          {STATUS_VALUES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(status === s ? null : s)}
              className={`min-h-11 shrink-0 rounded-full px-2.5 text-sm font-medium transition-colors sm:min-h-0 sm:px-3 sm:py-1 ${
                status === s
                  ? 'bg-accent-bg text-accent'
                  : 'bg-surface border border-border text-text-sub'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
