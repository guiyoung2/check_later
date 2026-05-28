import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemCard } from './ItemCard';
import { storageService } from '../services/storageService';
import type { Item } from '../types';

const patchItem = vi.fn();
const deleteItem = vi.fn();
const showToast = vi.fn();

vi.mock('../services/storageService', () => ({
  storageService: {
    getSignedUrl: vi.fn(),
  },
}));

vi.mock('../hooks/usePatchItem', () => ({
  usePatchItem: () => ({ mutate: patchItem }),
}));

vi.mock('../hooks/useDeleteItem', () => ({
  useDeleteItem: () => ({ mutate: deleteItem, isPending: false }),
}));

vi.mock('./ui/Toast', () => ({
  useToast: () => ({ showToast }),
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

function renderCard(item: Item = baseItem) {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<ItemCard item={item} />} />
        <Route path="/items/:id" element={<div>상세</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ItemCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storageService.getSignedUrl).mockResolvedValue(null);
  });

  it('이미지가 있는 항목은 signed URL 썸네일을 보여준다', async () => {
    vi.mocked(storageService.getSignedUrl).mockResolvedValue('https://signed.example/image.png');

    renderCard(baseItem);

    const thumbnail = await screen.findByAltText('이미지 항목 썸네일');

    expect(storageService.getSignedUrl).toHaveBeenCalledWith('user-1/item-1.png');
    expect(thumbnail).toHaveAttribute('src', 'https://signed.example/image.png');
  });

  it('80px 미만 스와이프는 status를 바꾸지 않는다', () => {
    renderCard({ ...baseItem, type: 'memo', image_path: null });

    const card = screen.getByTestId('item-card-gesture');
    fireEvent.touchStart(card, { touches: [{ clientX: 0, clientY: 0 }] });
    fireEvent.touchMove(card, { touches: [{ clientX: 60, clientY: 0 }] });
    fireEvent.touchEnd(card);

    expect(patchItem).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });

  it('80px 이상 스와이프는 다음 status로 낙관적 변경하고 undo toast를 표시한다', () => {
    renderCard({ ...baseItem, type: 'memo', image_path: null, status: 'pending' });

    const card = screen.getByTestId('item-card-gesture');
    fireEvent.touchStart(card, { touches: [{ clientX: 0, clientY: 0 }] });
    fireEvent.touchMove(card, { touches: [{ clientX: 100, clientY: 0 }] });
    fireEvent.touchEnd(card);

    expect(patchItem).toHaveBeenCalledWith({ id: 'item-1', input: { status: 'reviewed' } });
    expect(showToast).toHaveBeenCalledWith({
      message: '상태 변경됨',
      undo: {
        label: '되돌리기',
        onClick: expect.any(Function),
      },
      duration: 4000,
    });

    const undo = showToast.mock.calls[0][0].undo.onClick;
    undo();
    expect(patchItem).toHaveBeenLastCalledWith({ id: 'item-1', input: { status: 'pending' } });
  });

  it('500ms 길게 누르면 BottomSheet가 열린다', async () => {
    const user = userEvent.setup();

    renderCard({ ...baseItem, type: 'memo', image_path: null });

    await user.pointer({ keys: '[TouchA>]', target: screen.getByTestId('item-card-gesture') });
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 520));
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
    expect(screen.getByText('상태 변경:')).toBeInTheDocument();

    await user.pointer({ keys: '[/TouchA]' });
  });

  it('데스크탑 메뉴에서 삭제를 누르면 확인 후 delete mutation을 호출한다', async () => {
    const user = userEvent.setup();
    renderCard({ ...baseItem, type: 'memo', image_path: null });

    await user.click(screen.getByRole('button', { name: '카드 메뉴 열기' }));
    await user.click(screen.getByRole('menuitem', { name: '삭제' }));

    expect(deleteItem).not.toHaveBeenCalled();
    expect(screen.getByText('정말 삭제할까요?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '삭제' }));

    await waitFor(() => {
      expect(deleteItem).toHaveBeenCalledWith('item-1');
    });
  });
});
