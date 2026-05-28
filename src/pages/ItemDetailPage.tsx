import type { JSX } from 'react';
import { useEffect, useState } from 'react';
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

// 항목 상세 페이지: 표시, 편집, 상태 변경, 삭제
export default function ItemDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading } = useItem(id);
  const { mutate: patchItem, isPending: isPatching } = usePatchItem();
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteItem();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editMemo, setEditMemo] = useState('');
  const [signedImage, setSignedImage] = useState<{ path: string; url: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 이미지 signed URL 로드 (실패 시 조용히 숨김)
  useEffect(() => {
    let ignore = false;

    const imagePath = item?.image_path;
    if (!imagePath) return;

    storageService
      .getSignedUrl(imagePath)
      .then((url) => {
        if (!ignore && url) setSignedImage({ path: imagePath, url });
      })
      .catch(() => null);

    return () => {
      ignore = true;
    };
  }, [item?.image_path]);

  const signedImageUrl =
    signedImage && signedImage.path === item?.image_path ? signedImage.url : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-sm text-text-sub">불러오는 중...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-text-sub">항목을 찾을 수 없어요</p>
        <Link to="/" className="text-sm text-accent underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const currentItem = item;

  function handleStartEdit() {
    setEditTitle(currentItem.title);
    setEditUrl(currentItem.url ?? '');
    setEditMemo(currentItem.memo ?? '');
    setIsEditing(true);
  }

  function handleSaveEdit() {
    if (!editTitle.trim()) return;
    patchItem({
      id: currentItem.id,
      input: {
        title: editTitle.trim(),
        url: editUrl.trim() || null,
        memo: editMemo.trim() || null,
      },
    });
    setIsEditing(false);
  }

  // 삭제 확인 후 실행
  function handleDelete() {
    deleteItem(currentItem.id, {
      onSuccess: () => navigate('/'),
    });
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 bg-bg border-b border-border flex items-center justify-between px-4 h-14">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="flex items-center justify-center w-9 h-9 rounded-[8px] text-text-sub hover:text-text-primary hover:bg-surface"
        >
          ←
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleStartEdit}
            className="min-h-9 px-3 rounded-[8px] text-sm font-medium text-text-sub hover:text-text-primary hover:bg-surface"
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="min-h-9 px-3 rounded-[8px] text-sm font-medium text-text-sub hover:text-text-primary hover:bg-surface"
          >
            삭제
          </button>
        </div>
      </header>

      <div className="px-4 py-5 max-w-lg mx-auto flex flex-col gap-5">
        {/* 이미지 */}
        {signedImageUrl && (
          <img
            src={signedImageUrl}
            alt="첨부 이미지"
            className="max-h-[70vh] w-full rounded-[6px] bg-surface object-contain"
          />
        )}

        {isEditing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveEdit();
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-title" className="text-xs font-medium text-text-sub">
                제목
              </label>
              <input
                autoFocus
                id="edit-title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="px-3 py-2 text-sm rounded-[6px] border border-border bg-surface text-text-primary outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-url" className="text-xs font-medium text-text-sub">
                URL
              </label>
              <input
                id="edit-url"
                type="text"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="px-3 py-2 text-sm rounded-[6px] border border-border bg-surface text-text-primary outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-memo" className="text-xs font-medium text-text-sub">
                메모
              </label>
              <textarea
                id="edit-memo"
                value={editMemo}
                onChange={(e) => setEditMemo(e.target.value)}
                rows={4}
                className="px-3 py-2 text-sm rounded-[6px] border border-border bg-surface text-text-primary outline-none focus:border-accent resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPatching || !editTitle.trim()}
                className="min-h-11 flex-1 rounded-[8px] bg-accent px-3 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                저장
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="min-h-11 flex-1 rounded-[8px] border border-border px-3 text-sm font-medium text-text-sub"
              >
                취소
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* 제목 */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-text-sub">제목</span>
              <p className="text-base font-semibold text-text-primary">{currentItem.title}</p>
            </div>

            {/* 유형 · 날짜 */}
            <div className="flex items-center gap-2 text-xs text-text-sub">
              <span className="px-2 py-0.5 rounded-[999px] bg-surface border border-border">
                {TYPE_LABELS[currentItem.type]}
              </span>
              <span aria-hidden>·</span>
              <span>{relativeDate(currentItem.created_at)}</span>
            </div>

            {/* 상태 변경 */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-text-sub">상태</span>
              <div className="flex gap-2">
                {STATUS_ORDER.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      if (s !== currentItem.status) {
                        patchItem({ id: currentItem.id, input: { status: s } });
                      }
                    }}
                    className={`min-h-11 rounded-[999px] px-3 text-sm font-medium transition-colors ${
                      currentItem.status === s
                        ? 'bg-accent-bg text-accent'
                        : 'bg-surface border border-border text-text-sub'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* URL */}
            {currentItem.url && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-text-sub">URL</span>
                <a
                  href={currentItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent underline break-all"
                >
                  {currentItem.url}
                </a>
              </div>
            )}

            {/* 메모 */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-text-sub">메모</span>
              <p className="min-h-[2.5rem] text-sm text-text-primary">
                {currentItem.memo || <span className="text-text-sub italic">메모 없음</span>}
              </p>
            </div>
          </>
        )}
      </div>

      {/* 삭제 확인 인라인 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50">
          <div className="w-full max-w-lg bg-surface rounded-t-[12px] p-5 flex flex-col gap-4">
            <p className="text-sm text-text-primary font-medium">이 항목을 삭제할까요?</p>
            <p className="text-xs text-text-sub">삭제하면 되돌릴 수 없어요.</p>
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
                className="flex-1 py-2.5 rounded-[8px] border border-border text-sm text-text-sub"
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
