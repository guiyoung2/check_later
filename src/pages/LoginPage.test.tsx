import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage';
import { supabase } from '../lib/supabase';

vi.mock('../lib/auth', () => ({
  useAuth: () => ({ session: null, loading: false }),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(),
    },
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(supabase.auth.signInWithOAuth).mockClear();
  });

  it('Google OAuth 로그인 시 계정 선택을 강제한다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /google로 계속하기/i }));

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: { prompt: 'select_account' },
      },
    });
  });

  it('이메일 로그인 없이 Google OAuth 진입만 제공한다', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Check Later' })).toBeInTheDocument();
    expect(screen.getByText('조용한 메모 도구')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /google로 계속하기/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/email|이메일/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password|비밀번호/i)).not.toBeInTheDocument();
  });
});
