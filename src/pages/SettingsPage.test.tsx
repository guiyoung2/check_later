import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsPage from './SettingsPage';
import { supabase } from '../lib/supabase';

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

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  });

  it('로그아웃 후 루트 경로로 이동한다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route path="/" element={<div>랜딩</div>} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: '로그아웃' }));

    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    expect(screen.getByText('랜딩')).toBeInTheDocument();
  });
});
