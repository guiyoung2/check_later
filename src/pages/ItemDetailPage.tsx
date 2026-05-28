import type { ChangeEvent, JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useItem } from '../hooks/useItem';
import { usePatchItem } from '../hooks/usePatchItem';
import { useDeleteItem } from '../hooks/useDeleteItem';
import { storageService } from '../services/storageService';
import { itemAttachmentsService } from '../services/itemAttachmentsService';
import type { ItemType, ItemStatus, ItemAttachment, ItemAttachmentInput } from '../types';
import { IconButton } from '../components/ui/IconButton';
import { Button } from '../components/ui/Button';
import { BottomNav } from '../components/ui/BottomNav';
import { Chip } from '../components/ui/Chip';
import { Divider } from '../components/ui/Divider';
import { EmptyState } from '../components/ui/EmptyState';
import { SideNav } from '../components/ui/SideNav';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { formatCardDate } from '../components/items/cardUtils';

const TYPE_LABELS: Record<ItemType, string> = {
  video: '영상',
  article: '글',
  screenshot: '캡처',
  memo: '메모',
};

const STATUS_LABELS: Record<ItemStatus, string> = {
  pending: '안봤음',
  reviewed: '봤음',
  archived: '보관',
};

const STATUS_ORDER: ItemStatus[] = ['pending', 'reviewed', 'archived'];

// YouTube 비디오 썸네일 URL 추출
function getYouTubeThumbnail(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;
    if (parsed.hostname.includes('youtu.be')) {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.hostname.includes('youtube.com')) {
      videoId = parsed.searchParams.get('v');
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}

function ArrowLeftIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function PencilIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function ShareIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51 15.42 17.49M15.41 6.51 8.59 10.49" />
    </svg>
  );
}

function PlayIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-12 w-12 text-surface" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function DetailLoadingSkeleton(): JSX.Element {
  return (
    <div className="min-h-screen bg-bg pb-16 md:pl-60">
      <SideNav />
      <header className="sticky top-0 z-10 border-b border-border bg-bg">
        <div className="mx-auto flex h-14 max-w-[800px] items-center justify-between px-4">
          <Skeleton className="h-8 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-[800px] flex-col gap-5 px-4 py-6" aria-label="상세 로딩 중">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-24 w-full" />
      </main>
      <BottomNav />
    </div>
  );
}

// 항목 상세 페이지: 표시, 편집, 상태 변경, 삭제
export default function ItemDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: item, isLoading, isError } = useItem(id);
  const { mutate: patchItem, isPending: isPatching } = usePatchItem();
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteItem();
  const { showToast } = useToast();

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

  useEffect(() => {
    if (!item || searchParams.get('edit') !== '1' || isEditing) return;
    setEditTitle(item.title);
    setEditUrls(urlAttachments.length ? urlAttachments.map((attachment) => attachment.value) : ['']);
    setEditMemo(item.memo ?? '');
    setEditImageFiles([]);
    setRemovedImagePaths([]);
    setIsEditing(true);
  }, [isEditing, item, searchParams, urlAttachments]);

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
    return <DetailLoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-bg pb-16 md:pl-60">
        <SideNav />
        <main className="mx-auto max-w-[800px] px-4 py-6">
          <div role="alert" className="rounded-sm border border-error/30 bg-surface px-4 py-3 text-[14px] leading-[1.5] text-error">
            불러오는 중 오류가 생겼어요. 잠시 후 다시 시도해 주세요.
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-bg pb-16 md:pl-60">
        <SideNav />
        <main className="mx-auto max-w-[800px] px-4 py-6">
          <EmptyState
            title="찾을 수 없어요"
            description="삭제되었거나 접근할 수 없는 항목입니다"
            action={{ label: '홈으로', onClick: () => navigate('/') }}
          />
        </main>
        <BottomNav />
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

  function handleDelete() {
    deleteItem(currentItem.id, {
      onSuccess: () => {
        showToast({
          message: '삭제됨',
          undo: {
            label: '되돌리기',
            onClick: () => navigate(`/items/${currentItem.id}`),
          },
          duration: 4000,
        });
        navigate('/');
      },
    });
  }

  async function handleShare() {
    const shareUrl = urlAttachments[0]?.value ?? window.location.href;
    if (navigator.share) {
      await navigator.share({ title: currentItem.title, url: shareUrl }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(shareUrl).catch(() => undefined);
    showToast({ message: '링크 복사됨', duration: 4000 });
  }

  // type별 헤드 영역
  const headArea = (() => {
    if (!isEditing && currentItem.type === 'screenshot' && imageAttachments.length > 0) {
      return (
        <div className="flex flex-col gap-2">
          {imageAttachments.map((attachment) =>
            signedImages[attachment.value] ? (
              <img
                key={attachment.value}
                src={signedImages[attachment.value]}
                alt="첨부 이미지"
                className="max-h-[70vh] w-full bg-surface-sub object-contain"
              />
            ) : null,
          )}
        </div>
      );
    }
    if (!isEditing && currentItem.type === 'video') {
      const videoUrl = urlAttachments[0]?.value;
      const thumbnailUrl = videoUrl ? getYouTubeThumbnail(videoUrl) : null;
      return (
        <div className="relative aspect-video bg-surface-sub">
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={`${currentItem.title} 썸네일`}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-[oklch(10%_0.006_80)]/20">
            <PlayIcon />
          </div>
          <span className="absolute right-3 bottom-3 rounded-xs bg-text-primary px-2 py-1 font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-bg">
            VIDEO
          </span>
        </div>
      );
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-bg pb-16 md:pl-60">
      <SideNav />
      {/* sticky 헤더 */}
      <header className="sticky top-0 z-10 border-b border-border bg-bg">
        <div className="mx-auto flex h-14 max-w-[800px] items-center justify-between px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-sm px-2 text-[14px] leading-[1.5] font-medium text-text-primary transition-[background-color,box-shadow,transform] duration-200 ease-out hover:bg-surface-sub active:translate-y-px focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none"
          >
            <ArrowLeftIcon />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-1">
            <IconButton
              aria-label="공유"
              size="sm"
              onClick={handleShare}
            >
              <ShareIcon />
            </IconButton>
            <IconButton
              aria-label="수정"
              size="sm"
              onClick={handleStartEdit}
            >
              <PencilIcon />
            </IconButton>
            <IconButton
              aria-label="항목 삭제"
              size="sm"
              className="text-error"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <TrashIcon />
            </IconButton>
          </div>
        </div>
      </header>

      {headArea}

      <main className="mx-auto max-w-[800px] px-4 py-6">
        {isEditing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveEdit();
            }}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-title" className="text-[13px] leading-[1.2] font-medium tracking-[0.02em] text-text-muted">
                제목
              </label>
              <input
                autoFocus
                id="edit-title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="min-h-[44px] rounded-sm border border-border bg-surface px-3 py-2 text-[16px] leading-[1.6] text-text-primary outline-none transition-[border-color] duration-200 hover:border-border-strong focus:border-border-strong focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] leading-[1.2] font-medium tracking-[0.02em] text-text-muted">URL</span>
              {editUrls.map((url, index) => (
                <input
                  key={index}
                  aria-label={`URL ${index + 1}`}
                  type="text"
                  value={url}
                  onChange={(e) => updateEditUrl(index, e.target.value)}
                  className="min-h-[44px] rounded-sm border border-border bg-surface px-3 py-2 text-[16px] leading-[1.6] text-text-primary outline-none transition-[border-color] duration-200 hover:border-border-strong focus:border-border-strong focus-visible:ring-2 focus-visible:ring-border-strong"
                />
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addEditUrl}
                className="self-start"
              >
                URL 추가
              </Button>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-images" className="text-[13px] leading-[1.2] font-medium tracking-[0.02em] text-text-muted">
                이미지
              </label>
              {editableImageAttachments.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {editableImageAttachments.map((attachment) => (
                    <div key={attachment.value} className="relative overflow-hidden rounded-sm bg-surface-sub">
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
                        className="absolute right-1 top-1 min-h-[28px] rounded-full bg-surface/90 px-2 text-[12px] font-medium text-text-secondary"
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
                className="text-[14px] text-text-secondary file:mr-3 file:cursor-pointer file:rounded-sm file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-[13px] file:text-text-secondary"
              />
              {editImageFiles.length > 0 && (
                <div className="flex flex-col gap-1">
                  {editImageFiles.map((file, index) => (
                    <span key={`${file.name}-${file.size}-${index}`} className="text-[12px] text-text-muted">
                      {file.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-memo" className="text-[13px] leading-[1.2] font-medium tracking-[0.02em] text-text-muted">
                메모
              </label>
              <textarea
                id="edit-memo"
                value={editMemo}
                onChange={(e) => setEditMemo(e.target.value)}
                rows={4}
                className="rounded-sm border border-border bg-surface px-3 py-2 text-[16px] leading-[1.6] text-text-primary outline-none resize-none transition-[border-color] duration-200 hover:border-border-strong focus:border-border-strong focus-visible:ring-2 focus-visible:ring-border-strong"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isPatching || !editTitle.trim()}
                className="flex-1 min-h-[44px] rounded-sm bg-text-primary px-4 py-2.5 text-[14px] font-medium text-bg transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                저장
              </button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setIsEditing(false)}
              >
                취소
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-6">
            {/* 메타: type chip · 날짜 · status */}
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant="type">{TYPE_LABELS[currentItem.type]}</Chip>
              <span aria-hidden className="font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-text-muted">·</span>
              <span className="font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-text-muted">
                {formatCardDate(currentItem.created_at)}
              </span>
              <span aria-hidden className="font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-text-muted">·</span>
              <span className="font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-text-muted">
                {STATUS_LABELS[currentItem.status]}
              </span>
            </div>

            {/* 제목 (display typography) */}
            <h1 className="text-[32px] leading-[1.2] font-semibold tracking-[-0.02em] text-text-primary">
              {currentItem.title}
            </h1>

            {/* URL 링크 */}
            {urlAttachments.length > 0 && (
              <div className="flex flex-col gap-2">
                {urlAttachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-text-secondary underline break-all hover:text-text-primary"
                  >
                    {attachment.value}
                    <span aria-hidden="true"> ↗</span>
                  </a>
                ))}
              </div>
            )}

            <Divider />

            {/* 메모 섹션 */}
            {currentItem.memo ? (
              <div className="rounded-md border border-border bg-surface p-6">
                <p className="text-[16px] leading-[1.6] text-text-primary whitespace-pre-wrap">
                  {currentItem.memo}
                </p>
              </div>
            ) : (
              <p className="text-[14px] leading-[1.5] italic text-text-muted">메모 없음</p>
            )}

            {/* status 3-segment toggle */}
            <div className="flex overflow-hidden rounded-sm border border-border">
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    if (s !== currentItem.status) {
                      patchItem({ id: currentItem.id, input: { status: s } });
                    }
                  }}
                  className={`flex-1 min-h-[44px] px-3 py-2.5 text-[13px] leading-[1.2] font-medium tracking-[0.02em] transition-[background-color,color] duration-200 ease-out ${
                    currentItem.status === s
                      ? 'bg-text-primary text-bg'
                      : 'bg-transparent text-text-secondary hover:bg-surface-sub hover:text-text-primary'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[oklch(10%_0.006_80)]/40">
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-surface p-6 shadow-modal">
            <h2 className="text-[18px] leading-[1.5] font-medium text-text-primary">
              정말 삭제할까요?
            </h2>
            <p className="text-[14px] leading-[1.5] text-text-secondary">
              삭제하면 되돌릴 수 없어요.
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </Button>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}
