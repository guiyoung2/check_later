import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from './HomePage';
import { useFilterStore } from '../stores/filterStore';
import type { Item } from '../types';

const useItemsState = vi.hoisted(() => ({
  value: { data: [] as Item[], isLoading: false, isError: false },
}));

vi.mock('../hooks/useItems', () => ({
  useItems: () => useItemsState.value,
}));

vi.mock('../hooks/usePatchItem', () => ({
  usePatchItem: () => ({ mutate: vi.fn() }),
}));

vi.mock('../hooks/useDeleteItem', () => ({
  useDeleteItem: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../components/ui/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const item: Item = {
  id: 'item-1',
  user_id: 'user-1',
  type: 'article',
  status: 'pending',
  title: '읽을 글',
  memo: null,
  url: 'https://example.com',
  image_path: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('HomePage', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.clear();
    useFilterStore.getState().reset();
    useItemsState.value = { data: [], isLoading: false, isError: false };
  });

  it('renders the renewed app shell with empty state action', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('banner')).toHaveTextContent('Check Later');
    expect(screen.getByRole('group', { name: '유형 필터' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByText('아직 저장한 것이 없어요')).toBeInTheDocument();
    expect(screen.getByText('공유 메뉴에서 던지거나 + 버튼으로 적어보세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '새로 추가' })).toBeInTheDocument();
  });

  it('renders skeleton cards while loading', () => {
    useItemsState.value = { data: [], isLoading: true, isError: false };

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
  });

  it('renders an inline error banner above the feed area', () => {
    useItemsState.value = { data: [], isLoading: false, isError: true };

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('불러오는 중 오류가 생겼어요. 잠시 후 다시 시도해 주세요.');
  });

  it('clears filters from the filtered empty state', async () => {
    const user = userEvent.setup();
    useFilterStore.getState().setType('video');

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText('조건에 맞는 것이 없어요')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '필터 초기화' }));

    expect(useFilterStore.getState().type).toBeNull();
    expect(useFilterStore.getState().status).toBeNull();
  });

  it('renders saved items in a vertical feed', () => {
    useItemsState.value = { data: [item], isLoading: false, isError: false };

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText('읽을 글')).toBeInTheDocument();
  });
});
