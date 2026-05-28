import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ItemDetailPage from './ItemDetailPage';
import { storageService } from '../services/storageService';
import { itemAttachmentsService } from '../services/itemAttachmentsService';
import type { Item } from '../types';

const patchItem = vi.fn();
const deleteItemMutate = vi.fn();

const item: Item = {
  id: 'item-1',
  user_id: 'user-1',
  type: 'screenshot',
  status: 'pending',
  title: 'Original title',
  memo: 'Original memo',
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
  useDeleteItem: () => ({ mutate: deleteItemMutate, isPending: false }),
}));

vi.mock('../services/storageService', () => ({
  storageService: {
    getSignedUrl: vi.fn(),
    upload: vi.fn(),
  },
}));

vi.mock('../services/itemAttachmentsService', () => ({
  itemAttachmentsService: {
    listByItemId: vi.fn(),
    replaceForItem: vi.fn(),
  },
}));

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/items/item-1']}>
      <Routes>
        <Route path="/items/:id" element={<ItemDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function startEdit(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getAllByRole('button')[1]);
}

async function submitEdit(user: ReturnType<typeof userEvent.setup>) {
  await user.click(document.querySelector('button[type="submit"]') as HTMLButtonElement);
}

describe('ItemDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(itemAttachmentsService.listByItemId).mockResolvedValue([]);
  });

  it('saves title, URL, and memo edits together', async () => {
    const user = userEvent.setup();
    vi.mocked(storageService.getSignedUrl).mockResolvedValue('https://signed.example/image.png');

    renderPage();

    await startEdit(user);
    await user.clear(document.querySelector('#edit-title') as HTMLInputElement);
    await user.type(document.querySelector('#edit-title') as HTMLInputElement, 'Changed title');
    await user.clear(screen.getByLabelText('URL 1'));
    await user.type(screen.getByLabelText('URL 1'), 'https://changed.example');
    await user.clear(document.querySelector('#edit-memo') as HTMLTextAreaElement);
    await user.type(document.querySelector('#edit-memo') as HTMLTextAreaElement, 'Changed memo');
    await submitEdit(user);

    expect(patchItem).toHaveBeenCalledWith({
      id: 'item-1',
      input: {
        title: 'Changed title',
        url: 'https://changed.example',
        memo: 'Changed memo',
        image_path: 'user-1/item-1.png',
      },
    });
  });

  it('renders detail images with contain layout', async () => {
    vi.mocked(itemAttachmentsService.listByItemId).mockResolvedValue([
      {
        id: 'attachment-1',
        item_id: 'item-1',
        user_id: 'user-1',
        kind: 'image',
        value: 'user-1/item-1.png',
        sort_order: 0,
        created_at: new Date().toISOString(),
      },
    ]);
    vi.mocked(storageService.getSignedUrl).mockResolvedValue('https://signed.example/image.png');

    renderPage();

    await waitFor(() => {
      expect(document.querySelector('img')).toHaveClass('object-contain');
    });
    expect(document.querySelector('img')).not.toHaveClass('object-cover');
  });

  it('shows attachment URLs and replaces them while editing', async () => {
    const user = userEvent.setup();
    vi.mocked(itemAttachmentsService.listByItemId).mockResolvedValue([
      {
        id: 'attachment-1',
        item_id: 'item-1',
        user_id: 'user-1',
        kind: 'url',
        value: 'https://a.example',
        sort_order: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: 'attachment-2',
        item_id: 'item-1',
        user_id: 'user-1',
        kind: 'url',
        value: 'https://b.example',
        sort_order: 1,
        created_at: new Date().toISOString(),
      },
    ]);

    renderPage();

    expect(await screen.findByRole('link', { name: 'https://a.example' })).toHaveAttribute(
      'href',
      'https://a.example',
    );
    expect(screen.getByRole('link', { name: 'https://b.example' })).toHaveAttribute(
      'href',
      'https://b.example',
    );

    await startEdit(user);
    await user.clear(screen.getByLabelText('URL 1'));
    await user.type(screen.getByLabelText('URL 1'), 'https://changed.example');
    await submitEdit(user);

    expect(itemAttachmentsService.replaceForItem).toHaveBeenLastCalledWith(
      'item-1',
      'user-1',
      [
        { kind: 'url', value: 'https://changed.example' },
        { kind: 'url', value: 'https://b.example' },
      ],
    );
  });

  it('shows ConfirmDialog on delete and calls deleteItem on confirm', async () => {
    const user = userEvent.setup();
    renderPage();

    // 삭제 아이콘 버튼 클릭 (header: 뒤로가기[0], 수정[1], 삭제[2])
    await user.click(screen.getAllByRole('button')[2]);

    expect(screen.getByText('정말 삭제할까요?')).toBeInTheDocument();

    // 확인 삭제 버튼 클릭
    await user.click(screen.getByRole('button', { name: '삭제' }));

    expect(deleteItemMutate).toHaveBeenCalledWith('item-1', expect.any(Object));
  });

  it('cancels ConfirmDialog without deleting', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByRole('button')[2]);
    expect(screen.getByText('정말 삭제할까요?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(screen.queryByText('정말 삭제할까요?')).not.toBeInTheDocument();
    expect(deleteItemMutate).not.toHaveBeenCalled();
  });

  it('deletes an existing image, adds multiple new images, and updates the list thumbnail', async () => {
    const user = userEvent.setup();
    vi.mocked(itemAttachmentsService.listByItemId).mockResolvedValue([
      {
        id: 'attachment-1',
        item_id: 'item-1',
        user_id: 'user-1',
        kind: 'image',
        value: 'user-1/item-1/old.png',
        sort_order: 0,
        created_at: new Date().toISOString(),
      },
    ]);
    vi.mocked(storageService.getSignedUrl).mockResolvedValue('https://signed.example/old.png');
    vi.mocked(storageService.upload)
      .mockResolvedValueOnce('user-1/item-1/new-a.png')
      .mockResolvedValueOnce('user-1/item-1/new-b.png');

    renderPage();

    await startEdit(user);
    await user.click(await screen.findByRole('button', { name: '기존 이미지 삭제' }));
    const editImagesInput = document.querySelector('#edit-images') as HTMLInputElement;
    await user.upload(editImagesInput, [new File(['a'], 'a.png', { type: 'image/png' })]);
    await user.upload(editImagesInput, [new File(['b'], 'b.png', { type: 'image/png' })]);
    await submitEdit(user);

    expect(patchItem).toHaveBeenCalledWith({
      id: 'item-1',
      input: expect.objectContaining({
        image_path: 'user-1/item-1/new-a.png',
      }),
    });
    expect(itemAttachmentsService.replaceForItem).toHaveBeenCalledWith(
      'item-1',
      'user-1',
      [
        { kind: 'image', value: 'user-1/item-1/new-a.png' },
        { kind: 'image', value: 'user-1/item-1/new-b.png' },
      ],
    );
  });
});
