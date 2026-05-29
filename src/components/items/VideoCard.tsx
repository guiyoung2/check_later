import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import type { Item } from '../../types';
import { formatCardDate } from './cardUtils';
import { CardStatusBadge } from './CardStatusBadge';
import { useSignedUrl } from './useSignedUrl';

// 영상 재생 오버레이 배지
function PlayBadge(): JSX.Element {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[rgba(8,6,3,0.2)]">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-surface" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  );
}

interface VideoCardProps {
  item: Item;
  onClick?: () => void;
}

// 영상 타입 카드 (컴팩트 행)
export function VideoCard({ item, onClick }: VideoCardProps): JSX.Element {
  const navigate = useNavigate();
  const handleClick = onClick ?? (() => navigate(`/items/${item.id}`));
  const signedImageUrl = useSignedUrl(item.image_path);

  const hostname = item.url
    ? (() => { try { return new URL(item.url).hostname; } catch { return item.url; } })()
    : null;

  return (
    <Card hoverable as="article" onClick={handleClick}>
      <div className="flex items-start gap-3 p-3 md:p-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-surface-sub">
          {signedImageUrl && (
            <img
              src={signedImageUrl}
              alt={`${item.title} 썸네일`}
              className="h-full w-full object-cover"
            />
          )}
          <PlayBadge />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <Chip variant="type">영상</Chip>
            <CardStatusBadge status={item.status} />
            <span aria-hidden="true" className="font-mono text-[12px] leading-[1.2] text-text-muted">·</span>
            <span className="font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-text-muted">
              {formatCardDate(item.created_at)}
            </span>
          </div>
          <h3 className="text-[15px] leading-[1.5] font-medium text-text-primary line-clamp-2">
            {item.title}
          </h3>
          {hostname && (
            <p className="mt-0.5 font-mono text-[12px] leading-[1.2] text-text-muted truncate">
              {hostname} ↗
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
