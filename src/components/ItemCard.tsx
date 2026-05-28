import type { JSX } from 'react';
import type { Item } from '../types';
import { MemoCard } from './items/MemoCard';
import { VideoCard } from './items/VideoCard';
import { ImageCard } from './items/ImageCard';
import { ArticleCard } from './items/ArticleCard';

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
}

// item.type 기준 카드 컴포넌트 dispatch
export function ItemCard({ item, onClick }: ItemCardProps): JSX.Element {
  switch (item.type) {
    case 'memo':
      return <MemoCard item={item} onClick={onClick} />;
    case 'video':
      return <VideoCard item={item} onClick={onClick} />;
    case 'screenshot':
      return <ImageCard item={item} onClick={onClick} />;
    case 'article':
      return <ArticleCard item={item} onClick={onClick} />;
    default:
      return <MemoCard item={item} onClick={onClick} />;
  }
}
