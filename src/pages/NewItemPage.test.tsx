import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import NewItemPage from './NewItemPage';
import { storageService } from '../services/storageService';
import { itemAttachmentsService } from '../services/itemAttachmentsService';

const createItem = vi.fn();

vi.mock('../hooks/useCreateItem', () => ({
  useCreateItem: () => ({ mutateAsync: createItem, isPending: false }),
}));

vi.mock('../lib/auth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

vi.mock('../lib/og-parser', () => ({
  fetchOgTitle: vi.fn().mockResolvedValue(null),
}));

vi.mock('../services/storageService', () => ({
  storageService: {
    upload: vi.fn(),
  },
}));

vi.mock('../services/itemAttachmentsService', () => ({
  itemAttachmentsService: {
    createMany: vi.fn(),
  },
}));

describe('NewItemPage', () => {
  it('여러 URL과 이미지를 첨부 목록으로 저장한다', async () => {
    const user = userEvent.setup();
    createItem.mockResolvedValue({ id: 'item-1' });
    vi.mocked(storageService.upload)
      .mockResolvedValueOnce('user-1/item-1/a.png')
      .mockResolvedValueOnce('user-1/item-1/b.png');

    render(
      <MemoryRouter initialEntries={['/new']}>
        <Routes>
          <Route path="/new" element={<NewItemPage />} />
          <Route path="/" element={<div>home</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/제목/), '첨부 많은 글');
    await user.type(screen.getByLabelText('URL 1'), 'https://a.example');
    await user.click(screen.getByRole('button', { name: 'URL 추가' }));
    await user.type(screen.getByLabelText('URL 2'), 'https://b.example');

    const files = [
      new File(['a'], 'a.png', { type: 'image/png' }),
      new File(['b'], 'b.png', { type: 'image/png' }),
    ];
    await user.upload(screen.getByLabelText('이미지'), files);
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(createItem).toHaveBeenCalledWith({
      id: expect.any(String),
      title: '첨부 많은 글',
      type: 'screenshot',
      url: 'https://a.example',
      memo: undefined,
      image_path: 'user-1/item-1/a.png',
    });
    expect(itemAttachmentsService.createMany).toHaveBeenCalledWith(
      expect.any(String),
      'user-1',
      [
        { kind: 'url', value: 'https://a.example' },
        { kind: 'url', value: 'https://b.example' },
        { kind: 'image', value: 'user-1/item-1/a.png' },
        { kind: 'image', value: 'user-1/item-1/b.png' },
      ],
    );
  });
});
