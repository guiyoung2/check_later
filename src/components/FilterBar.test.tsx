import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { FilterBar } from './FilterBar';
import { useFilterStore } from '../stores/filterStore';

describe('FilterBar', () => {
  beforeEach(() => {
    useFilterStore.getState().reset();
  });

  it('renders type and status chips with the all type chip selected by default', () => {
    render(<FilterBar />);

    expect(screen.getByRole('group', { name: '유형 필터' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '상태 필터' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '영상' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: '글' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '캡처' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '메모' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '안봤음' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '봤음' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '보관' })).toBeInTheDocument();
  });

  it('updates filter store when chips are selected', async () => {
    const user = userEvent.setup();

    render(<FilterBar />);

    await user.click(screen.getByRole('button', { name: '영상' }));
    await user.click(screen.getByRole('button', { name: '안봤음' }));

    expect(useFilterStore.getState().type).toBe('video');
    expect(useFilterStore.getState().status).toBe('pending');
    expect(screen.getByRole('button', { name: '영상' })).toHaveAttribute('aria-pressed', 'true');
  });
});
