import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ItemDetailPage from './ItemDetailPage';
import { storageService } from '../services/storageService';
import { itemAttachmentsService } from '../services/itemAttachmentsService';
import type { Item } from '../types';

const patchItem = vi.fn();
const deleteItemMutate = vi.fn();
const showToast = vi.fn();
const useItemState = vi.hoisted(() => ({
  value: { data: null as Item | null, isLoading: false, isError: false },
}));

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
  useItem: () => useItemState.value,
}));

vi.mock('../hooks/usePatchItem', () => ({
  usePatchItem: () => ({ mutate: patchItem, isPending: false }),
}));

vi.mock('../hooks/useDeleteItem', () => ({
  useDeleteItem: () => ({ mutate: deleteItemMutate, isPending: false }),
}));

vi.mock('../components/ui/Toast', () => ({
  useToast: () => ({ showToast }),
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
        <Route path="/" element={<div>홈</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderPageAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/items/:id" element={<ItemDetailPage />} />
        <Route path="/" element={<div>홈</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function startEdit(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: '수정' }));
}

async function submitEdit(user: ReturnType<typeof userEvent.setup>) {
  await user.click(document.querySelector('button[type="submit"]') as HTMLButtonElement);
}

describe('ItemDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useItemState.value = { data: item, isLoading: false, isError: false };
    vi.mocked(itemAttachmentsService.listByItemId).mockResolvedValue([]);
  });

  it('로딩 중에는 상세 레이아웃 skeleton을 표시한다', () => {
    useItemState.value = { data: null, isLoading: true, isError: false };

    renderPage();

    expect(screen.getByLabelText('상세 로딩 중')).toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThanOrEqual(4);
  });

  it('항목이 없으면 EmptyState와 홈으로 버튼을 표시한다', () => {
    useItemState.value = { data: null, isLoading: false, isError: false };

    renderPageAt('/items/missing');

    expect(screen.getByText('찾을 수 없어요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '홈으로' })).toBeInTheDocument();
  });

  it('조회 실패 시 inline error banner를 표시한다', () => {
    useItemState.value = { data: null, isLoading: false, isError: true };

    renderPage();

    expect(screen.getByRole('alert')).toHaveTextContent('불러오는 중 오류가 생겼어요. 잠시 후 다시 시도해 주세요.');
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

  it('edit=1 쿼리로 진입하면 편집 폼을 연다', async () => {
    renderPageAt('/items/item-1?edit=1');

    expect(await screen.findByLabelText('제목')).toHaveValue('Original title');
  });

  it('shows BottomNav with Home active on detail route', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /Home/ })).toHaveAttribute('aria-current', 'page');
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

  it('shows ConfirmDialog on delete, deletes on confirm, then navigates home with undo toast', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: '항목 삭제' }));

    expect(screen.getByText('정말 삭제할까요?')).toBeInTheDocument();

    // 확인 삭제 버튼 클릭
    await user.click(screen.getByRole('button', { name: '삭제' }));

    expect(deleteItemMutate).toHaveBeenCalledWith('item-1', expect.any(Object));
    const [, options] = deleteItemMutate.mock.calls[0];
    act(() => {
      options.onSuccess();
    });

    await waitFor(() => {
      expect(screen.getByText('홈')).toBeInTheDocument();
    });
    expect(showToast).toHaveBeenCalledWith({
      message: '삭제됨',
      undo: {
        label: '되돌리기',
        onClick: expect.any(Function),
      },
      duration: 4000,
    });
  });

  it('cancels ConfirmDialog without deleting', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: '항목 삭제' }));
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
