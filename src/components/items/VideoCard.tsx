import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import type { Item } from '../../types';
import { formatCardDate } from './cardUtils';
import { useSignedUrl } from './useSignedUrl';

// 영상 재생 아이콘
function PlayIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-10 w-10 text-surface" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

interface VideoCardProps {
  item: Item;
  onClick?: () => void;
}

// 영상 타입 카드
export function VideoCard({ item, onClick }: VideoCardProps): JSX.Element {
  const navigate = useNavigate();
  const handleClick = onClick ?? (() => navigate(`/items/${item.id}`));
  const signedImageUrl = useSignedUrl(item.image_path);

  const hostname = item.url
    ? (() => { try { return new URL(item.url).hostname; } catch { return item.url; } })()
    : null;

  return (
    <Card hoverable as="article" onClick={handleClick} className="overflow-hidden">
      <div className="relative aspect-video bg-surface-sub">
        {signedImageUrl && (
          <img
            src={signedImageUrl}
            alt={`${item.title} 썸네일`}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(8,6,3,0.2)]">
          <PlayIcon />
        </div>
      </div>
      <div className="p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <Chip variant="type">영상</Chip>
          <span className="font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-text-muted">
            {formatCardDate(item.created_at)}
          </span>
        </div>
        <h3 className="mb-1 text-[24px] leading-[1.4] font-medium text-text-primary line-clamp-2">
          {item.title}
        </h3>
        {hostname && (
          <p className="font-mono text-[14px] leading-[1.5] text-text-muted truncate">
            {hostname} ↗
          </p>
        )}
      </div>
    </Card>
  );
}
