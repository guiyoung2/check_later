import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FilterBar } from './FilterBar';

describe('FilterBar', () => {
  it('모바일 기본 레이아웃에서 유형과 상태 필터를 별도 그룹으로 렌더링한다', () => {
    render(<FilterBar />);

    expect(screen.getByText('유형')).toBeInTheDocument();
    expect(screen.getByText('상태')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '유형 필터' })).toHaveClass('grid-cols-4');
    expect(screen.getByRole('group', { name: '상태 필터' })).toHaveClass('grid-cols-3');
  });
});
