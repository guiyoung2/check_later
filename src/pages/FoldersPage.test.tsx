import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FoldersPage from './FoldersPage';
import { itemsService } from '../services/itemsService';
import { useFilterStore } from '../stores/filterStore';
import type { Item } from '../types';

vi.mock('../services/itemsService', () => ({
  itemsService: {
    list: vi.fn(),
  },
}));

const items: Item[] = [
  {
    id: 'item-1',
    user_id: 'user-1',
    type: 'video',
    status: 'pending',
    title: '볼 영상',
    memo: null,
    url: 'https://youtu.be/example',
    image_path: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-2',
    user_id: 'user-1',
    type: 'memo',
    status: 'archived',
    title: '메모',
    memo: '나중에 확인',
    url: null,
    image_path: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}{location.search}</div>;
}

function renderFoldersPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/folders']}>
        <Routes>
          <Route path="/" element={<LocationProbe />} />
          <Route path="/folders" element={<FoldersPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('FoldersPage', () => {
  beforeEach(() => {
    useFilterStore.getState().reset();
    vi.mocked(itemsService.list).mockResolvedValue(items);
  });

  it('type 카드 클릭 시 Home으로 type 필터를 적용해 이동한다', async () => {
    const user = userEvent.setup();

    renderFoldersPage();

    await screen.findByRole('button', { name: /영상 1개/ });
    await user.click(screen.getByRole('button', { name: /영상 1개/ }));

    expect(screen.getByTestId('location')).toHaveTextContent('/?type=video');
    expect(useFilterStore.getState().type).toBe('video');
    expect(useFilterStore.getState().status).toBeNull();
  });

  it('카운트 로딩 중에는 skeleton 카드 7개를 표시한다', () => {
    vi.mocked(itemsService.list).mockReturnValue(new Promise(() => {}));

    renderFoldersPage();

    expect(screen.getAllByTestId('skeleton')).toHaveLength(7);
  });

  it('카운트 조회 실패 시 inline error banner를 표시한다', async () => {
    vi.mocked(itemsService.list).mockRejectedValue(new Error('fail'));

    renderFoldersPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('불러오는 중 오류가 생겼어요. 잠시 후 다시 시도해 주세요.');
  });
});
