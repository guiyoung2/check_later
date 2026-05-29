import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import type { Item } from '../../types';
import { formatCardDate } from './cardUtils';
import { CardStatusBadge } from './CardStatusBadge';
import { useSignedUrl } from './useSignedUrl';

interface ArticleCardProps {
  item: Item;
  onClick?: () => void;
}

// 글 타입 카드 (컴팩트 행)
export function ArticleCard({ item, onClick }: ArticleCardProps): JSX.Element {
  const navigate = useNavigate();
  const handleClick = onClick ?? (() => navigate(`/items/${item.id}`));
  const signedImageUrl = useSignedUrl(item.image_path);

  const hostname = item.url
    ? (() => { try { return new URL(item.url).hostname; } catch { return item.url; } })()
    : null;

  return (
    <Card hoverable as="article" onClick={handleClick}>
      <div className="flex items-start gap-3 p-3 md:p-4">
        {signedImageUrl && (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-surface-sub">
            <img src={signedImageUrl} alt="" className="h-full w-full object-contain" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <Chip variant="type">글</Chip>
            {item.image_path && <Chip variant="type">캡처</Chip>}
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
          {hostname && (
            <p className="mt-0.5 font-mono text-[12px] leading-[1.2] text-text-muted truncate">
              {hostname}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
