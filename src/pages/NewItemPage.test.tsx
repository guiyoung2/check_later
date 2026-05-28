import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import NewItemPage from './NewItemPage';
import { storageService } from '../services/storageService';
import { itemAttachmentsService } from '../services/itemAttachmentsService';

// JSDOM에 URL.createObjectURL/revokeObjectURL이 없으므로 stub
beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:mock');
  URL.revokeObjectURL = vi.fn();
});

beforeEach(() => {
  vi.clearAllMocks();
  // clearAllMocks 후에도 createObjectURL 구현이 유지되어야 함
  URL.createObjectURL = vi.fn(() => 'blob:mock');
  URL.revokeObjectURL = vi.fn();
});

const createItem = vi.fn();

vi.mock('../hooks/useCreateItem', () => ({
  useCreateItem: () => ({ mutateAsync: createItem, isPending: false }),
}));

vi.mock('../lib/auth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

vi.mock('../lib/og-parser', () => ({
  fetchOgTitle: vi.fn().mockResolvedValue(null),
}));

vi.mock('../services/storageService', () => ({
  storageService: { upload: vi.fn() },
}));

vi.mock('../services/itemAttachmentsService', () => ({
  itemAttachmentsService: { createMany: vi.fn() },
}));

// Toast를 mock해 navigate 후 showToast 사이드이펙트 방지
vi.mock('../components/ui/Toast', () => ({
  useToast: () => ({ showToast: vi.fn(), hideToast: vi.fn() }),
}));

function renderPage(url = '/new') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/new" element={<NewItemPage />} />
        <Route path="/" element={<div>home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('NewItemPage', () => {
  it('Web Share Target ?url= YouTube URL 진입 시 영상 타입 자동 감지', () => {
    renderPage('/new?url=https://youtube.com/watch');
    expect(screen.getByText('영상')).toBeInTheDocument();
  });

  it('shows BottomNav with New active', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /New/ })).toHaveAttribute('aria-current', 'page');
  });

  it('Web Share Target ?text= 파라미터 진입 시 textarea 채움 및 메모 타입 감지', () => {
    renderPage('/new?text=메모내용');
    expect(screen.getByDisplayValue('메모내용')).toBeInTheDocument();
    expect(screen.getByText('메모')).toBeInTheDocument();
  });

  it('textarea에 일반 URL 입력 시 글 타입 자동 감지', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByPlaceholderText('무엇을 기록할까요?'), 'https://example.com');
    expect(screen.getByText('글')).toBeInTheDocument();
  });

  it('이미지 파일 선택 시 캡처 타입으로 변경 및 미리보기 표시', async () => {
    const user = userEvent.setup();
    renderPage();
    const file = new File(['img'], 'test.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('이미지 파일 선택'), file);
    expect(screen.getByText('캡처')).toBeInTheDocument();
    expect(screen.getByAltText('선택된 이미지 미리보기')).toBeInTheDocument();
  });

  it('텍스트 입력 후 저장 시 memo 타입으로 createItem 호출', async () => {
    const user = userEvent.setup();
    createItem.mockResolvedValue({ id: 'item-1' });
    renderPage();
    await user.type(screen.getByPlaceholderText('무엇을 기록할까요?'), '오늘의 생각');
    await user.click(screen.getByRole('button', { name: '저장' }));
    expect(createItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'memo',
        memo: '오늘의 생각',
        title: '오늘의 생각',
        url: undefined,
        image_path: undefined,
      }),
    );
  });

  it('이미지 선택 후 저장 시 storageService.upload 호출 및 첨부 목록 저장', async () => {
    const user = userEvent.setup();
    createItem.mockResolvedValue({ id: 'item-1' });
    vi.mocked(storageService.upload).mockResolvedValue('user-1/item-1/a.png');
    renderPage();
    const file = new File(['img'], 'photo.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('이미지 파일 선택'), file);
    await user.click(screen.getByRole('button', { name: '저장' }));
    expect(storageService.upload).toHaveBeenCalledWith(file, 'user-1', expect.any(String));
    expect(createItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'screenshot',
        image_path: 'user-1/item-1/a.png',
      }),
    );
    expect(itemAttachmentsService.createMany).toHaveBeenCalledWith(
      expect.any(String),
      'user-1',
      [{ kind: 'image', value: 'user-1/item-1/a.png' }],
    );
  });
});
