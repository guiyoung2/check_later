import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import type { Item } from '../../types';
import { formatCardDate } from './cardUtils';
import { CardStatusBadge } from './CardStatusBadge';
import { useSignedUrl } from './useSignedUrl';

interface ImageCardProps {
  item: Item;
  onClick?: () => void;
}

// 캡처(이미지) 타입 카드
export function ImageCard({ item, onClick }: ImageCardProps): JSX.Element {
  const navigate = useNavigate();
  const handleClick = onClick ?? (() => navigate(`/items/${item.id}`));
  const signedImageUrl = useSignedUrl(item.image_path);

  return (
    <Card hoverable as="article" onClick={handleClick} className="overflow-hidden">
      <div className="h-64 bg-surface-sub">
        {signedImageUrl && (
          <img
            src={signedImageUrl}
            alt={`${item.title} 썸네일`}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <Chip variant="type">캡처</Chip>
          <div className="flex items-center gap-1.5">
            <CardStatusBadge status={item.status} />
            <span aria-hidden="true" className="font-mono text-[12px] leading-[1.2] text-text-muted">·</span>
            <span className="font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-text-muted">
              {formatCardDate(item.created_at)}
            </span>
          </div>
        </div>
        <h3 className="mb-2 text-[24px] leading-[1.4] font-medium text-text-primary line-clamp-1">
          {item.title}
        </h3>
        {item.memo && (
          <p className="text-[14px] leading-[1.5] text-text-secondary line-clamp-1">
            {item.memo}
          </p>
        )}
      </div>
    </Card>
  );
}
