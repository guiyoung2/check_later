import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import LandingPage from './LandingPage';

describe('LandingPage', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  it('로그인 CTA를 누르면 로그인 화면으로 이동한다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<div>로그인 화면</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: '시작하기' }));

    expect(screen.getByText('로그인 화면')).toBeInTheDocument();
  });

  it('헤더에서 다크모드를 토글하면 테마 상태가 유지된다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    const darkToggle = screen.getByRole('button', { name: '다크 모드로 전환' });
    expect(darkToggle).not.toHaveTextContent(/다크|라이트/);

    await user.click(darkToggle);

    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(screen.getByRole('button', { name: '라이트 모드로 전환' })).not.toHaveTextContent(
      /다크|라이트/,
    );
  });

  it('모바일 공유 메뉴 저장 맥락을 보여준다', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/모바일 공유 메뉴에서 바로 저장/)).toBeInTheDocument();
  });
});
