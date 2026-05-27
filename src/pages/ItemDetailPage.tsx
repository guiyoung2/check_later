import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useItem } from '../hooks/useItem';
import { usePatchItem } from '../hooks/usePatchItem';
import { useDeleteItem } from '../hooks/useDeleteItem';
import { storageService } from '../services/storageService';
import type { ItemType, ItemStatus } from '../types';

const TYPE_LABELS: Record<ItemType, string> = {
  video: '영상',
  article: '글',
  screenshot: '캡처',
  memo: '메모',
};

const STATUS_LABELS: Record<ItemStatus, string> = {
  pending: '안 봤음',
  reviewed: '봤음',
  archived: '보관',
};

const STATUS_ORDER: ItemStatus[] = ['pending', 'reviewed', 'archived'];

// 상대 날짜 포맷
function relativeDate(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  if (days < 365) return `${Math.floor(days / 30)}달 전`;
  return `${Math.floor(days / 365)}년 전`;
}

// 항목 상세 페이지: 표시, 인라인 편집, 상태 변경, 삭제
export default function ItemDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading } = useItem(id);
  const { mutate: patchItem, isPending: isPatching } = usePatchItem();
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteItem();

  const [editTitle, setEditTitle] = useState('');
  const [editMemo, setEditMemo] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 이미지 signed URL 로드 (실패 시 조용히 숨김)
  useEffect(() => {
    if (!item?.image_path) return;
    storageService.getSignedUrl(item.image_path).then(setSignedImageUrl).catch(() => null);
  }, [item?.image_path]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <p className="text-sm text-[var(--color-text-sub)]">불러오는 중...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-[var(--color-text-sub)]">항목을 찾을 수 없어요</p>
        <Link to="/" className="text-sm text-[var(--color-accent)] underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // title 저장
  function handleSaveTitle() {
    if (!item || !editTitle.trim()) return;
    patchItem({ id: item.id, input: { title: editTitle.trim() } });
    setIsEditingTitle(false);
  }

  // memo 저장
  function handleSaveMemo() {
    if (!item) return;
    patchItem({ id: item.id, input: { memo: editMemo.trim() || null } });
    setIsEditingMemo(false);
  }

  // 삭제 확인 후 실행
  function handleDelete() {
    if (!item) return;
    deleteItem(item.id, {
      onSuccess: () => navigate('/'),
    });
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-10 bg-[var(--color-bg)] border-b border-[var(--color-border)] flex items-center justify-between px-4 h-14">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="flex items-center justify-center w-9 h-9 rounded-[8px] text-[var(--color-text-sub)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="text-xs text-[var(--color-text-sub)] hover:text-[var(--color-text-primary)] px-2 py-1 rounded-[6px] hover:bg-[var(--color-surface)]"
        >
          삭제
        </button>
      </header>

      <div className="px-4 py-5 max-w-lg mx-auto flex flex-col gap-5">
        {/* 이미지 */}
        {signedImageUrl && (
          <img
            src={signedImageUrl}
            alt="첨부 이미지"
            className="w-full rounded-[6px] object-cover max-h-64"
          />
        )}

        {/* 제목 인라인 편집 */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--color-text-sub)]">제목</span>
          {isEditingTitle ? (
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                className="flex-1 px-3 py-2 text-sm rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                disabled={isPatching || !editTitle.trim()}
                className="px-3 py-2 rounded-[8px] bg-[var(--color-accent)] text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                저장
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setEditTitle(item.title); setIsEditingTitle(true); }}
              className="text-left text-base font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors"
            >
              {item.title}
            </button>
          )}
        </div>

        {/* 유형 · 날짜 */}
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-sub)]">
          <span className="px-2 py-0.5 rounded-[999px] bg-[var(--color-surface)] border border-[var(--color-border)]">
            {TYPE_LABELS[item.type]}
          </span>
          <span aria-hidden>·</span>
          <span>{relativeDate(item.created_at)}</span>
        </div>

        {/* 상태 변경 (인라인 버튼 3개) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--color-text-sub)]">상태</span>
          <div className="flex gap-2">
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  if (s !== item.status) {
                    patchItem({ id: item.id, input: { status: s } });
                  }
                }}
                className={`px-3 py-1.5 rounded-[999px] text-sm font-medium transition-colors ${
                  item.status === s
                    ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-sub)]'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* URL */}
        {item.url && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--color-text-sub)]">URL</span>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-accent)] underline break-all"
            >
              {item.url}
            </a>
          </div>
        )}

        {/* 메모 인라인 편집 */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--color-text-sub)]">메모</span>
          {isEditingMemo ? (
            <div className="flex flex-col gap-2">
              <textarea
                autoFocus
                value={editMemo}
                onChange={(e) => setEditMemo(e.target.value)}
                rows={3}
                className="px-3 py-2 text-sm rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveMemo}
                  disabled={isPatching}
                  className="px-3 py-1.5 rounded-[8px] bg-[var(--color-accent)] text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingMemo(false)}
                  className="px-3 py-1.5 rounded-[8px] border border-[var(--color-border)] text-sm text-[var(--color-text-sub)]"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setEditMemo(item.memo ?? ''); setIsEditingMemo(true); }}
              className="text-left text-sm text-[var(--color-text-primary)] min-h-[2.5rem] hover:text-[var(--color-accent)] transition-colors"
            >
              {item.memo || <span className="text-[var(--color-text-sub)] italic">메모 없음 (클릭하여 추가)</span>}
            </button>
          )}
        </div>
      </div>

      {/* 삭제 확인 인라인 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50">
          <div className="w-full max-w-lg bg-[var(--color-surface)] rounded-t-[12px] p-5 flex flex-col gap-4">
            <p className="text-sm text-[var(--color-text-primary)] font-medium">이 항목을 삭제할까요?</p>
            <p className="text-xs text-[var(--color-text-sub)]">삭제하면 되돌릴 수 없어요.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-[8px] bg-red-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-[8px] border border-[var(--color-border)] text-sm text-[var(--color-text-sub)]"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
