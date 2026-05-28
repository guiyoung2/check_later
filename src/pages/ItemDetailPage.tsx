import type { ChangeEvent, JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useItem } from '../hooks/useItem';
import { usePatchItem } from '../hooks/usePatchItem';
import { useDeleteItem } from '../hooks/useDeleteItem';
import { storageService } from '../services/storageService';
import { itemAttachmentsService } from '../services/itemAttachmentsService';
import type { ItemType, ItemStatus, ItemAttachment, ItemAttachmentInput } from '../types';

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
  const [editUrls, setEditUrls] = useState<string[]>(['']);
  const [editMemo, setEditMemo] = useState('');
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [removedImagePaths, setRemovedImagePaths] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<ItemAttachment[] | null>(null);
  const [signedImages, setSignedImages] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const itemId = item?.id;

  useEffect(() => {
    if (!itemId) return;
    const currentItemId = itemId;
    let ignore = false;

    async function loadAttachments() {
      try {
        const rows = await itemAttachmentsService.listByItemId(currentItemId);
        if (!ignore) setAttachments(Array.isArray(rows) ? rows : []);
      } catch {
        if (!ignore) setAttachments([]);
      }
    }

    loadAttachments();
    return () => {
      ignore = true;
    };
  }, [itemId]);

  const fallbackAttachments: ItemAttachment[] = useMemo(() => [
    ...(item?.url
      ? [{
          id: 'legacy-url',
          item_id: item.id,
          user_id: item.user_id,
          kind: 'url' as const,
          value: item.url,
          sort_order: 0,
          created_at: item.created_at,
        }]
      : []),
    ...(item?.image_path
      ? [{
          id: 'legacy-image',
          item_id: item.id,
          user_id: item.user_id,
          kind: 'image' as const,
          value: item.image_path,
          sort_order: 1,
          created_at: item.created_at,
        }]
      : []),
  ], [item]);
  const currentAttachments = useMemo(
    () => (attachments?.length ? attachments : fallbackAttachments),
    [attachments, fallbackAttachments],
  );
  const urlAttachments = useMemo(
    () => currentAttachments.filter((attachment) => attachment.kind === 'url'),
    [currentAttachments],
  );
  const imageAttachments = useMemo(
    () => currentAttachments.filter((attachment) => attachment.kind === 'image'),
    [currentAttachments],
  );
  const editableImageAttachments = useMemo(
    () => imageAttachments.filter((attachment) => !removedImagePaths.includes(attachment.value)),
    [imageAttachments, removedImagePaths],
  );

  // 이미지 signed URL 로드 (실패 시 조용히 숨김)
  useEffect(() => {
    let ignore = false;

    async function loadSignedImages() {
      const entries: Record<string, string> = {};
      for (const attachment of imageAttachments) {
        const url = await storageService.getSignedUrl(attachment.value).catch(() => null);
        if (url) entries[attachment.value] = url;
      }
      if (!ignore) setSignedImages(entries);
    }

    loadSignedImages();

    return () => {
      ignore = true;
    };
  }, [imageAttachments]);

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
    setEditUrls(urlAttachments.length ? urlAttachments.map((attachment) => attachment.value) : ['']);
    setEditMemo(currentItem.memo ?? '');
    setEditImageFiles([]);
    setRemovedImagePaths([]);
    setIsEditing(true);
  }

  async function handleSaveEdit() {
    if (!editTitle.trim()) return;
    const trimmedUrls = editUrls.map((url) => url.trim()).filter(Boolean);
    const existingImages = editableImageAttachments.map((attachment) => attachment.value);
    const uploadedImages: string[] = [];

    for (const file of editImageFiles) {
      uploadedImages.push(await storageService.upload(file, currentItem.user_id, currentItem.id));
    }

    const nextImages = [...existingImages, ...uploadedImages];
    const nextAttachments: ItemAttachmentInput[] = [
      ...trimmedUrls.map((value) => ({ kind: 'url' as const, value })),
      ...nextImages.map((value) => ({ kind: 'image' as const, value })),
    ];

    patchItem({
      id: currentItem.id,
      input: {
        title: editTitle.trim(),
        url: trimmedUrls[0] ?? null,
        memo: editMemo.trim() || null,
        image_path: nextImages[0] ?? null,
      },
    });
    await itemAttachmentsService.replaceForItem(currentItem.id, currentItem.user_id, nextAttachments);
    setAttachments(nextAttachments.map((attachment, index) => ({
      id: `local-${index}`,
      item_id: currentItem.id,
      user_id: currentItem.user_id,
      kind: attachment.kind,
      value: attachment.value,
      sort_order: index,
      created_at: new Date().toISOString(),
    })));
    setRemovedImagePaths([]);
    setIsEditing(false);
  }

  function updateEditUrl(index: number, value: string) {
    setEditUrls((prev) => prev.map((url, currentIndex) => (currentIndex === index ? value : url)));
  }

  function addEditUrl() {
    setEditUrls((prev) => [...prev, '']);
  }

  function removeExistingImage(path: string) {
    setRemovedImagePaths((prev) => (prev.includes(path) ? prev : [...prev, path]));
  }

  function handleEditFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setEditImageFiles((prev) => [...prev, ...files]);
    e.target.value = '';
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
        {!isEditing && imageAttachments.length > 0 && (
          <div className="flex flex-col gap-2">
            {imageAttachments.map((attachment) => (
              signedImages[attachment.value] && (
                <img
                  key={attachment.value}
                  src={signedImages[attachment.value]}
                  alt="첨부 이미지"
                  className="max-h-[70vh] w-full rounded-[6px] bg-surface object-contain"
                />
              )
            ))}
          </div>
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
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-text-sub">URL</span>
              {editUrls.map((url, index) => (
                <input
                  key={index}
                  aria-label={`URL ${index + 1}`}
                  type="text"
                  value={url}
                  onChange={(e) => updateEditUrl(index, e.target.value)}
                  className="px-3 py-2 text-sm rounded-[6px] border border-border bg-surface text-text-primary outline-none focus:border-accent"
                />
              ))}
              <button
                type="button"
                onClick={addEditUrl}
                className="self-start min-h-9 rounded-[8px] border border-border px-3 text-sm font-medium text-text-sub hover:bg-surface"
              >
                URL 추가
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-images" className="text-xs font-medium text-text-sub">
                이미지
              </label>
              {editableImageAttachments.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {editableImageAttachments.map((attachment) => (
                    <div key={attachment.value} className="relative overflow-hidden rounded-[6px] bg-border">
                      {signedImages[attachment.value] && (
                        <img
                          src={signedImages[attachment.value]}
                          alt=""
                          className="aspect-square w-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        aria-label="기존 이미지 삭제"
                        onClick={() => removeExistingImage(attachment.value)}
                        className="absolute right-1 top-1 min-h-7 rounded-[999px] bg-surface/90 px-2 text-xs font-medium text-text-sub shadow-[0_1px_3px_oklch(20%_0.01_80_/_0.08)]"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                id="edit-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleEditFileChange}
                className="text-sm text-text-sub file:mr-3 file:py-1.5 file:px-3 file:rounded-[6px] file:border file:border-border file:bg-surface file:text-text-sub file:text-sm file:cursor-pointer"
              />
              {editImageFiles.length > 0 && (
                <div className="flex flex-col gap-1">
                  {editImageFiles.map((file, index) => (
                    <span key={`${file.name}-${file.size}-${index}`} className="text-xs text-text-sub">
                      {file.name}
                    </span>
                  ))}
                </div>
              )}
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
            {urlAttachments.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-text-sub">URL</span>
                <div className="flex flex-col gap-1.5">
                  {urlAttachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent underline break-all"
                    >
                      {attachment.value}
                    </a>
                  ))}
                </div>
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
