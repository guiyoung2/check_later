import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import LandingPage from './LandingPage';

describe('LandingPage', () => {
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

    await user.click(screen.getByRole('button', { name: '시작하기 →' }));

    expect(screen.getByText('로그인 화면')).toBeInTheDocument();
  });

  it('1 viewport 소개와 저장, 분류, 조회 그리드를 보여준다', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /공유 한 번이면 끝/ })).toBeInTheDocument();
    expect(screen.getByText('저장')).toBeInTheDocument();
    expect(screen.getByText('분류')).toBeInTheDocument();
    expect(screen.getByText('조회')).toBeInTheDocument();
  });
});
