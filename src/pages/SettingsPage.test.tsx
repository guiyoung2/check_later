import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsPage from './SettingsPage';
import { itemsService } from '../services/itemsService';
import { supabase } from '../lib/supabase';
import type { Item } from '../types';

vi.mock('../lib/auth', () => ({
  useAuth: () => ({ user: { email: 'user@example.com' } }),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}));

vi.mock('../services/itemsService', () => ({
  itemsService: {
    list: vi.fn(),
  },
}));

const items: Item[] = [
  {
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
  },
  {
    id: 'item-2',
    user_id: 'user-1',
    type: 'memo',
    status: 'reviewed',
    title: '메모',
    memo: '확인할 내용',
    url: null,
    image_path: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function createMatchMedia(matches: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function renderSettingsPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route path="/" element={<div>랜딩</div>} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });
    vi.mocked(itemsService.list).mockResolvedValue(items);
    window.matchMedia = createMatchMedia(false);
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  it('로그아웃 후 루트 경로로 이동한다', async () => {
    const user = userEvent.setup();

    renderSettingsPage();

    await user.click(screen.getByRole('button', { name: '로그아웃' }));

    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    expect(screen.getByText('랜딩')).toBeInTheDocument();
  });

  it('로그아웃을 누르면 signOut 완료를 기다리지 않고 루트 경로로 이동한다', async () => {
    const user = userEvent.setup();
    let resolveSignOut: (value: { error: null }) => void = () => {};
    vi.mocked(supabase.auth.signOut).mockReturnValue(
      new Promise((resolve) => {
        resolveSignOut = resolve;
      }),
    );

    renderSettingsPage();

    await user.click(screen.getByRole('button', { name: '로그아웃' }));

    expect(screen.getByText('랜딩')).toBeInTheDocument();
    resolveSignOut({ error: null });
  });

  it('테마 세그먼트 선택에 따라 documentElement class를 토글한다', async () => {
    const user = userEvent.setup();

    renderSettingsPage();

    await user.click(screen.getByRole('button', { name: '다크' }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await user.click(screen.getByRole('button', { name: '라이트' }));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.classList.contains('light')).toBe(true);

    window.matchMedia = createMatchMedia(true);
    await user.click(screen.getByRole('button', { name: '시스템' }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('저장된 항목 수를 표시한다', async () => {
    renderSettingsPage();

    expect(await screen.findByText('2개')).toBeInTheDocument();
  });

  it('항목 수 조회 중에는 대시를 표시한다', () => {
    vi.mocked(itemsService.list).mockReturnValue(new Promise(() => {}));

    renderSettingsPage();

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('항목 수 조회 실패 시 대시를 유지한다', async () => {
    vi.mocked(itemsService.list).mockRejectedValue(new Error('fail'));

    renderSettingsPage();

    expect(await screen.findByText('—')).toBeInTheDocument();
  });

  it('standalone 표시 모드에서는 설치 완료 문구만 표시한다', () => {
    window.matchMedia = createMatchMedia(true);

    renderSettingsPage();

    expect(screen.getByText('이미 설치되어 있어요')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '홈 화면에 추가' })).not.toBeInTheDocument();
  });
});
