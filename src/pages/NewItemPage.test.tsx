import { render, screen, within } from '@testing-library/react';
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
  // --- Web Share Target 회귀 테스트 ---

  it('Web Share Target ?url= YouTube URL 진입 시 영상 타입 자동 감지', () => {
    renderPage('/new?url=https://youtube.com/watch');
    expect(screen.getByText('영상')).toBeInTheDocument();
  });

  it('Web Share Target 파라미터 진입 시 url을 URL 필드에 채우고 자동 저장하지 않는다', () => {
    renderPage(
      '/new?title=%ED%85%8C%EC%8A%A4%ED%8A%B8&text=%EB%A9%94%EB%AA%A8%EB%82%B4%EC%9A%A9&url=https%3A%2F%2Fexample.com',
    );
    expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeEnabled();
    expect(createItem).not.toHaveBeenCalled();
  });

  it('Web Share Target ?text= 파라미터 진입 시 memo 필드 채움 및 메모 타입 감지', () => {
    renderPage('/new?text=메모내용');
    expect(screen.getByDisplayValue('메모내용')).toBeInTheDocument();
    // '메모'는 form 라벨과 type 칩 두 곳에 존재 — 칩 포함 확인
    expect(screen.getAllByText('메모').length).toBeGreaterThanOrEqual(2);
  });

  // --- BottomNav ---

  it('shows BottomNav with New active', () => {
    renderPage();
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: /새 항목/ })).toHaveAttribute('aria-current', 'page');
  });

  // --- type 자동 감지 ---

  it('URL 필드에 일반 URL 입력 시 글 타입 자동 감지', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByRole('textbox', { name: 'URL 1' }), 'https://example.com');
    expect(screen.getByText('글')).toBeInTheDocument();
  });

  it('이미지 파일 선택 시 캡처 타입으로 변경', async () => {
    const user = userEvent.setup();
    renderPage();
    const file = new File(['img'], 'test.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('이미지'), file);
    expect(screen.getByText('캡처')).toBeInTheDocument();
  });

  // --- 저장 ---

  it('제목 입력 후 저장 시 memo 타입으로 createItem 호출', async () => {
    const user = userEvent.setup();
    createItem.mockResolvedValue({ id: 'item-1' });
    renderPage();
    await user.type(screen.getByLabelText('제목 *'), '오늘의 생각');
    await user.click(screen.getByRole('button', { name: '저장' }));
    expect(createItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'memo',
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
    await user.type(screen.getByLabelText('제목 *'), '이미지 테스트');
    const file = new File(['img'], 'photo.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('이미지'), file);
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
      expect.arrayContaining([{ kind: 'image', value: 'user-1/item-1/a.png' }]),
    );
  });

  it('다중 URL 입력 시 모두 첨부로 저장', async () => {
    const user = userEvent.setup();
    createItem.mockResolvedValue({ id: 'item-1' });
    renderPage();
    await user.type(screen.getByLabelText('제목 *'), '멀티링크');
    await user.type(screen.getByRole('textbox', { name: 'URL 1' }), 'https://first.com');
    await user.click(screen.getByRole('button', { name: 'URL 추가' }));
    await user.type(screen.getByRole('textbox', { name: 'URL 2' }), 'https://second.com');
    await user.click(screen.getByRole('button', { name: '저장' }));
    expect(itemAttachmentsService.createMany).toHaveBeenCalledWith(
      expect.any(String),
      'user-1',
      expect.arrayContaining([
        { kind: 'url', value: 'https://first.com' },
        { kind: 'url', value: 'https://second.com' },
      ]),
    );
  });
});
