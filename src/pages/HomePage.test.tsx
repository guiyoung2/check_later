import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from './HomePage';
import { supabase } from '../lib/supabase';

vi.mock('../hooks/useItems', () => ({
  useItems: () => ({ data: [], isLoading: false, isError: false }),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}));

describe('HomePage', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.clear();
    vi.mocked(supabase.auth.signOut).mockClear();
  });

  it('헤더에서 다크모드를 토글하고 로그아웃할 수 있다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const darkToggle = screen.getByRole('button', { name: '다크 모드로 전환' });
    expect(screen.getByRole('link', { name: '설정' })).toHaveAttribute('href', '/settings');
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
    expect(screen.getByText('나중에 볼 것들을 빠르게 저장하고, 원할 때 바로 찾아보세요.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '첫 항목 저장하기' })).toHaveAttribute('href', '/new');

    await user.click(darkToggle);

    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(screen.getByRole('button', { name: '라이트 모드로 전환' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '로그아웃' }));

    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
  });
});
