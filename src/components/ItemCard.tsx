import type { CSSProperties, JSX, PointerEvent, TouchEvent } from 'react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteItem } from '../hooks/useDeleteItem';
import { usePatchItem } from '../hooks/usePatchItem';
import type { Item, ItemStatus } from '../types';
import { MemoCard } from './items/MemoCard';
import { VideoCard } from './items/VideoCard';
import { ImageCard } from './items/ImageCard';
import { ArticleCard } from './items/ArticleCard';
import { CardMenu } from './items/CardMenu';
import { BottomSheet } from './ui/BottomSheet';
import { Button } from './ui/Button';
import { Divider } from './ui/Divider';
import { useToast } from './ui/Toast';

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
}

const STATUS_ORDER: ItemStatus[] = ['pending', 'reviewed', 'archived'];
const STATUS_LABELS: Record<ItemStatus, string> = {
  pending: '안봤음',
  reviewed: '봤음',
  archived: '보관',
};

const SWIPE_THRESHOLD = 80;
const SWIPE_MAX = 120;
const LONG_PRESS_DELAY = 500;

function getNextStatus(status: ItemStatus): ItemStatus {
  const index = STATUS_ORDER.indexOf(status);
  return STATUS_ORDER[(index + 1) % STATUS_ORDER.length];
}

function PencilIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function ShareIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="M12 16V4M8 8l4-4 4 4" />
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

function ActionRow({ label, icon, danger = false, onClick }: {
  label: string;
  icon: JSX.Element;
  danger?: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[44px] w-full items-center justify-between rounded-sm px-2 text-[16px] leading-[1.6] transition-[background-color,color] duration-200 ease-out hover:bg-surface-sub focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none ${
        danger ? 'text-error' : 'text-text-primary'
      }`}
    >
      <span>{label}</span>
      {icon}
    </button>
  );
}

// item.type 기준 카드 컴포넌트 dispatch
export function ItemCard({ item, onClick }: ItemCardProps): JSX.Element {
  const navigate = useNavigate();
  const { mutate: patchItem } = usePatchItem();
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteItem();
  const { showToast } = useToast();
  const [translateX, setTranslateX] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const suppressNextClick = useRef(false);

  function clearLongPressTimer() {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function patchStatus(status: ItemStatus) {
    patchItem({ id: item.id, input: { status } });
  }

  function toggleStatus() {
    const previousStatus = item.status;
    const nextStatus = getNextStatus(item.status);
    patchStatus(nextStatus);
    showToast({
      message: '상태 변경됨',
      undo: {
        label: '되돌리기',
        onClick: () => patchStatus(previousStatus),
      },
      duration: 4000,
    });
  }

  function getShareUrl() {
    if (item.url) return item.url;
    return `${window.location.origin}/items/${item.id}`;
  }

  function handleEdit() {
    navigate(`/items/${item.id}?edit=1`);
  }

  async function handleShare(useNativeShare: boolean) {
    const shareUrl = getShareUrl();
    if (useNativeShare && navigator.share) {
      await navigator.share({ title: item.title, url: shareUrl }).catch(() => undefined);
      setSheetOpen(false);
      return;
    }
    await navigator.clipboard?.writeText(shareUrl).catch(() => undefined);
    showToast({ message: '링크 복사됨', duration: 4000 });
    setSheetOpen(false);
  }

  function openDeleteConfirm() {
    setSheetOpen(false);
    setConfirmOpen(true);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const currentX = event.touches[0]?.clientX ?? touchStartX.current;
    const deltaX = Math.max(0, currentX - touchStartX.current);
    if (deltaX > 10) clearLongPressTimer();
    setTranslateX(Math.min(deltaX, SWIPE_MAX));
  }

  function handleTouchEnd() {
    if (translateX >= SWIPE_THRESHOLD) {
      suppressNextClick.current = true;
      toggleStatus();
    }
    touchStartX.current = null;
    setTranslateX(0);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest('button,a')) return;
    clearLongPressTimer();
    pointerStart.current = { x: event.clientX, y: event.clientY };
    longPressTimer.current = window.setTimeout(() => {
      suppressNextClick.current = true;
      setSheetOpen(true);
    }, LONG_PRESS_DELAY);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointerStart.current) return;
    const deltaX = Math.abs(event.clientX - pointerStart.current.x);
    const deltaY = Math.abs(event.clientY - pointerStart.current.y);
    if (deltaX > 10 || deltaY > 10) clearLongPressTimer();
  }

  function handleClickCapture(event: PointerEvent<HTMLDivElement>) {
    if (suppressNextClick.current) {
      suppressNextClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    }
  }

  const card = (() => {
    switch (item.type) {
    case 'memo':
      return <MemoCard item={item} onClick={onClick} />;
    case 'video':
      return <VideoCard item={item} onClick={onClick} />;
    case 'screenshot':
      return <ImageCard item={item} onClick={onClick} />;
    case 'article':
      return <ArticleCard item={item} onClick={onClick} />;
    default:
      return <MemoCard item={item} onClick={onClick} />;
    }
  })();

  const gestureStyle: CSSProperties = {
    transform: `translateX(${translateX}px)`,
    transition: translateX > 0 ? 'none' : 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
  };

  return (
    <>
      <div
        data-testid="item-card-gesture"
        className="group relative touch-pan-y"
        style={gestureStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          touchStartX.current = null;
          setTranslateX(0);
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => {
          pointerStart.current = null;
          clearLongPressTimer();
        }}
        onPointerCancel={() => {
          pointerStart.current = null;
          clearLongPressTimer();
        }}
        onPointerLeave={() => {
          pointerStart.current = null;
          clearLongPressTimer();
        }}
        onClickCapture={handleClickCapture}
      >
        {card}
        <CardMenu
          onEdit={handleEdit}
          onShare={() => void handleShare(false)}
          onDelete={openDeleteConfirm}
        />
      </div>

      {sheetOpen ? (
        <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} dragHandle>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <ActionRow label="수정" icon={<PencilIcon />} onClick={handleEdit} />
              <ActionRow label="공유" icon={<ShareIcon />} onClick={() => void handleShare(true)} />
            </div>
            <Divider />
            <div className="flex flex-col gap-2">
              <p className="text-[13px] leading-[1.2] font-medium tracking-[0.02em] text-text-muted">상태 변경:</p>
              <div className="grid grid-cols-3 overflow-hidden rounded-sm border border-border">
                {STATUS_ORDER.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      patchStatus(status);
                      setSheetOpen(false);
                    }}
                    className={`min-h-[44px] px-2 py-2.5 text-[13px] leading-[1.2] font-medium tracking-[0.02em] transition-[background-color,color] duration-200 ease-out ${
                      item.status === status
                        ? 'bg-text-primary text-bg'
                        : 'bg-transparent text-text-secondary hover:bg-surface-sub hover:text-text-primary'
                    }`}
                  >
                    {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>
            <Divider />
            <ActionRow danger label="삭제" icon={<TrashIcon />} onClick={openDeleteConfirm} />
          </div>
        </BottomSheet>
      ) : null}

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(10%_0.006_80)]/40 px-4">
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-surface p-6 shadow-modal">
            <h2 className="text-[18px] leading-[1.5] font-medium text-text-primary">정말 삭제할까요?</h2>
            <p className="text-[14px] leading-[1.5] text-text-secondary">삭제하면 되돌릴 수 없어요.</p>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setConfirmOpen(false)}>
                취소
              </Button>
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                disabled={isDeleting}
                onClick={() => {
                  deleteItem(item.id);
                  setConfirmOpen(false);
                }}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
