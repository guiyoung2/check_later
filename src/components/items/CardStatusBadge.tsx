import type { JSX } from 'react';
import type { ItemStatus } from '../../types';

const STATUS_LABELS: Record<ItemStatus, string> = {
  pending: '안봤음',
  reviewed: '봤음',
  archived: '보관',
};

// 카드 상태 라벨 (안봤음은 한 단계 강조)
export function CardStatusBadge({ status }: { status: ItemStatus }): JSX.Element {
  const isPending = status === 'pending';
  return (
    <span
      className={`font-body text-[12px] leading-[1.2] font-medium tracking-[0.02em] ${
        isPending ? 'text-text-secondary' : 'text-text-muted'
      }`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
