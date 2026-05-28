import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ItemDetailPage from './ItemDetailPage';
import { storageService } from '../services/storageService';
import type { Item } from '../types';

const patchItem = vi.fn();

const item: Item = {
  id: 'item-1',
  user_id: 'user-1',
  type: 'screenshot',
  status: 'pending',
  title: '기존 제목',
  memo: '기존 메모',
  url: 'https://example.com',
  image_path: 'user-1/item-1.png',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

vi.mock('../hooks/useItem', () => ({
  useItem: () => ({ data: item, isLoading: false }),
}));

vi.mock('../hooks/usePatchItem', () => ({
  usePatchItem: () => ({ mutate: patchItem, isPending: false }),
}));

vi.mock('../hooks/useDeleteItem', () => ({
  useDeleteItem: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../services/storageService', () => ({
  storageService: {
    getSignedUrl: vi.fn(),
  },
}));

describe('ItemDetailPage', () => {
  it('수정 버튼으로 제목, URL, 메모를 한 번에 저장할 수 있다', async () => {
    const user = userEvent.setup();
    vi.mocked(storageService.getSignedUrl).mockResolvedValue('https://signed.example/image.png');

    render(
      <MemoryRouter initialEntries={['/items/item-1']}>
        <Routes>
          <Route path="/items/:id" element={<ItemDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: '수정' }));
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 제목');
    await user.clear(screen.getByLabelText('URL'));
    await user.type(screen.getByLabelText('URL'), 'https://changed.example');
    await user.clear(screen.getByLabelText('메모'));
    await user.type(screen.getByLabelText('메모'), '수정된 메모');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(patchItem).toHaveBeenCalledWith({
      id: 'item-1',
      input: {
        title: '수정된 제목',
        url: 'https://changed.example',
        memo: '수정된 메모',
      },
    });
  });

  it('상세 이미지를 자르지 않는 표시 방식으로 렌더링한다', async () => {
    vi.mocked(storageService.getSignedUrl).mockResolvedValue('https://signed.example/image.png');

    render(
      <MemoryRouter initialEntries={['/items/item-1']}>
        <Routes>
          <Route path="/items/:id" element={<ItemDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const image = await screen.findByAltText('첨부 이미지');

    expect(image).toHaveClass('object-contain');
    expect(image).not.toHaveClass('object-cover');
  });
});
