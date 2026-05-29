import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { MemoCard } from './MemoCard';
import { VideoCard } from './VideoCard';
import { ImageCard } from './ImageCard';
import { ArticleCard } from './ArticleCard';
import type { Item } from '../../types';

vi.mock('../../services/storageService', () => ({
  storageService: {
    getSignedUrl: vi.fn().mockResolvedValue(null),
  },
}));

const baseItem: Item = {
  id: 'item-1',
  user_id: 'user-1',
  type: 'memo',
  status: 'pending',
  title: '테스트 제목',
  memo: '테스트 메모',
  url: null,
  image_path: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('card variant components', () => {
  it('MemoCard: 제목과 메모가 렌더된다', () => {
    render(
      <MemoryRouter>
        <MemoCard item={baseItem} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /테스트 제목/ })).toBeInTheDocument();
    expect(screen.getByText('테스트 제목')).toBeInTheDocument();
    expect(screen.getByText('테스트 메모')).toBeInTheDocument();
    expect(screen.getByText('메모')).toBeInTheDocument();
  });

  it('VideoCard: 제목과 영상 타입 칩이 렌더된다', () => {
    const item: Item = {
      ...baseItem,
      type: 'video',
      url: 'https://youtube.com/watch?v=abc123',
    };
    render(
      <MemoryRouter>
        <VideoCard item={item} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /테스트 제목/ })).toBeInTheDocument();
    expect(screen.getByText('테스트 제목')).toBeInTheDocument();
    expect(screen.getByText('영상')).toBeInTheDocument();
    expect(screen.getByText('youtube.com ↗')).toBeInTheDocument();
  });

  it('ImageCard: 제목과 캡처 타입 칩이 렌더된다', () => {
    const item: Item = { ...baseItem, type: 'screenshot' };
    render(
      <MemoryRouter>
        <ImageCard item={item} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /테스트 제목/ })).toBeInTheDocument();
    expect(screen.getByText('테스트 제목')).toBeInTheDocument();
    expect(screen.getByText('캡처')).toBeInTheDocument();
  });

  it('ArticleCard: 제목, 글 타입 칩, hostname이 렌더된다', () => {
    const item: Item = {
      ...baseItem,
      type: 'article',
      url: 'https://example.com/some-article',
    };
    render(
      <MemoryRouter>
        <ArticleCard item={item} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /테스트 제목/ })).toBeInTheDocument();
    expect(screen.getByText('테스트 제목')).toBeInTheDocument();
    expect(screen.getByText('글')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });
});
