import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ItemCard } from './ItemCard';
import { storageService } from '../services/storageService';
import type { Item } from '../types';

vi.mock('../services/storageService', () => ({
  storageService: {
    getSignedUrl: vi.fn(),
  },
}));

const baseItem: Item = {
  id: 'item-1',
  user_id: 'user-1',
  type: 'screenshot',
  status: 'pending',
  title: '이미지 항목',
  memo: null,
  url: null,
  image_path: 'user-1/item-1.png',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('ItemCard', () => {
  it('이미지가 있는 항목은 signed URL 썸네일을 보여준다', async () => {
    vi.mocked(storageService.getSignedUrl).mockResolvedValue('https://signed.example/image.png');

    render(
      <MemoryRouter>
        <ItemCard item={baseItem} />
      </MemoryRouter>,
    );

    const thumbnail = await screen.findByAltText('이미지 항목 썸네일');

    expect(storageService.getSignedUrl).toHaveBeenCalledWith('user-1/item-1.png');
    expect(thumbnail).toHaveAttribute('src', 'https://signed.example/image.png');
  });
});
