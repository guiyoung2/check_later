import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ItemForm } from './ItemForm';

vi.mock('../../lib/og-parser', () => ({
  fetchOgTitle: vi.fn().mockResolvedValue(null),
}));

describe('ItemForm', () => {
  it('create 모드: 기본 필드가 렌더된다', () => {
    render(
      <ItemForm
        mode="create"
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/제목/)).toBeInTheDocument();
    expect(screen.getByLabelText('URL 1')).toBeInTheDocument();
    expect(screen.getByLabelText(/이미지/)).toBeInTheDocument();
    expect(screen.getByLabelText(/메모/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /저장/ })).toBeInTheDocument();
  });

  it('type 칩이 메모로 기본 표시된다 (빈 폼)', () => {
    render(<ItemForm mode="create" onSubmit={vi.fn()} />);
    // "메모" 텍스트: 메모 입력 레이블 + type 칩 — 두 곳 이상 존재
    expect(screen.getAllByText('메모').length).toBeGreaterThanOrEqual(2);
  });

  it('submitting=true 시 저장 버튼이 비활성화된다', () => {
    render(
      <ItemForm
        mode="create"
        initialValues={{ title: '테스트' }}
        submitting
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /저장/ })).toBeDisabled();
  });

  it('error prop이 있으면 에러 메시지가 표시된다', () => {
    render(
      <ItemForm
        mode="create"
        error="저장 중 오류가 발생했습니다"
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('저장 중 오류가 발생했습니다');
  });

  it('onCancel이 있으면 취소 버튼이 렌더된다', () => {
    render(
      <ItemForm
        mode="edit"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /취소/ })).toBeInTheDocument();
  });

  it('title이 비어있으면 저장 버튼이 비활성화된다', () => {
    render(<ItemForm mode="create" initialValues={{ title: '' }} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /저장/ })).toBeDisabled();
  });
});
