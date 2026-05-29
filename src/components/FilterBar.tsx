import type { JSX } from 'react';
import { Chip } from './ui/Chip';
import { useFilterStore } from '../stores/filterStore';
import type { ItemStatus, ItemType } from '../types';

const TYPE_LABELS: Record<ItemType, string> = {
  video: '영상',
  article: '글',
  screenshot: '캡처',
  memo: '메모',
};

const STATUS_LABELS: Record<ItemStatus, string> = {
  pending: '안봤음',
  reviewed: '봤음',
  archived: '보관',
};

const TYPE_VALUES: ItemType[] = ['video', 'article', 'screenshot', 'memo'];
const STATUS_VALUES: ItemStatus[] = ['pending', 'reviewed', 'archived'];

export function FilterBar(): JSX.Element {
  const type = useFilterStore((s) => s.type);
  const status = useFilterStore((s) => s.status);
  const setType = useFilterStore((s) => s.setType);
  const setStatus = useFilterStore((s) => s.setStatus);

  return (
    <div className="sticky top-16 z-20 border-b border-border bg-bg">
      <div className="mx-auto flex max-w-[800px] gap-3 overflow-x-auto px-4 py-3 [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden">
        <div role="group" aria-label="유형 필터" className="flex shrink-0 items-center gap-2">
          <Chip variant="type" active={type === null} onClick={() => setType(null)}>
            전체
          </Chip>
          {TYPE_VALUES.map((value) => (
            <Chip
              key={value}
              variant="type"
              active={type === value}
              onClick={() => setType(type === value ? null : value)}
            >
              {TYPE_LABELS[value]}
            </Chip>
          ))}
        </div>
        <div className="h-11 w-px shrink-0 bg-border" aria-hidden="true" />
        <div role="group" aria-label="상태 필터" className="flex shrink-0 items-center gap-2">
          {STATUS_VALUES.map((value) => (
            <Chip
              key={value}
              variant="status"
              active={status === value}
              onClick={() => setStatus(status === value ? null : value)}
            >
              {STATUS_LABELS[value]}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
