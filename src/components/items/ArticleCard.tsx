import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { Divider } from '../ui/Divider';
import type { Item } from '../../types';
import { formatCardDate } from './cardUtils';
import { useSignedUrl } from './useSignedUrl';

interface ArticleCardProps {
  item: Item;
  onClick?: () => void;
}

// 글 타입 카드
export function ArticleCard({ item, onClick }: ArticleCardProps): JSX.Element {
  const navigate = useNavigate();
  const handleClick = onClick ?? (() => navigate(`/items/${item.id}`));
  const signedImageUrl = useSignedUrl(item.image_path);

  const hostname = item.url
    ? (() => { try { return new URL(item.url).hostname; } catch { return item.url; } })()
    : null;

  return (
    <Card hoverable as="article" onClick={handleClick}>
      <div className="p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <Chip variant="type">글</Chip>
          <span className="font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-text-muted">
            {formatCardDate(item.created_at)}
          </span>
        </div>
        <h3 className="text-[24px] leading-[1.4] font-medium text-text-primary line-clamp-2">
          {item.title}
        </h3>
        {item.memo && (
          <p className="mt-2 text-[14px] leading-[1.5] text-text-secondary line-clamp-1">
            {item.memo}
          </p>
        )}
        {hostname && (
          <>
            <Divider className="my-4" />
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-surface-sub">
                {signedImageUrl && (
                  <img src={signedImageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <span className="font-mono text-[14px] leading-[1.5] text-text-muted truncate">
                {hostname}
              </span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
