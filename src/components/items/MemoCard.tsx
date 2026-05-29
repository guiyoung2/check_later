import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import type { Item } from '../../types';
import { formatCardDate } from './cardUtils';
import { CardStatusBadge } from './CardStatusBadge';

interface MemoCardProps {
  item: Item;
  onClick?: () => void;
}

// 메모 타입 카드 (컴팩트 행)
export function MemoCard({ item, onClick }: MemoCardProps): JSX.Element {
  const navigate = useNavigate();
  const handleClick = onClick ?? (() => navigate(`/items/${item.id}`));

  return (
    <Card hoverable as="article" onClick={handleClick}>
      <div className="flex items-start gap-3 p-3 md:p-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <Chip variant="type">메모</Chip>
            <CardStatusBadge status={item.status} />
            <span aria-hidden="true" className="font-mono text-[12px] leading-[1.2] text-text-muted">·</span>
            <span className="font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-text-muted">
              {formatCardDate(item.created_at)}
            </span>
          </div>
          <h3 className="text-[15px] leading-[1.5] font-medium text-text-primary line-clamp-2">
            {item.title}
          </h3>
          {item.memo && (
            <p className="mt-0.5 text-[13px] leading-[1.5] text-text-secondary line-clamp-1">
              {item.memo}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
