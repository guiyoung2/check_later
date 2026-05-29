import { useEffect, useRef, useState, type JSX } from 'react';
import { IconButton } from '../ui/IconButton';

interface CardMenuProps {
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
  onOpenChange?: (open: boolean) => void;
}

function MoreIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  );
}

function MenuButton({ children, danger = false, onClick }: {
  children: string;
  danger?: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex min-h-[44px] w-full items-center px-3 text-left text-[14px] leading-[1.5] transition-[background-color,color] duration-200 ease-out hover:bg-surface-sub focus-visible:bg-surface-sub focus-visible:outline-none ${
        danger ? 'text-error' : 'text-text-primary'
      }`}
    >
      {children}
    </button>
  );
}

export function CardMenu({ onEdit, onShare, onDelete, onOpenChange }: CardMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // open 상태 변경 + 부모에 알림
  const handleSetOpen = (value: boolean) => {
    setOpen(value);
    onOpenChange?.(value);
  };

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        handleSetOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  function runAction(action: () => void) {
    handleSetOpen(false);
    action();
  }

  return (
    <div
      ref={menuRef}
      className="absolute top-2 right-2 z-20 hidden md:block"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <IconButton
        type="button"
        aria-label="카드 메뉴 열기"
        size="sm"
        onClick={() => handleSetOpen(!open)}
        className="bg-surface opacity-0 shadow-overlay group-hover:opacity-100 focus:opacity-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreIcon />
      </IconButton>
      {open ? (
        <div
          role="menu"
          className="absolute top-12 right-0 w-32 overflow-hidden rounded-md border border-border bg-surface shadow-overlay"
        >
          <MenuButton onClick={() => runAction(onEdit)}>수정</MenuButton>
          <MenuButton onClick={() => runAction(onShare)}>공유</MenuButton>
          <MenuButton danger onClick={() => runAction(onDelete)}>삭제</MenuButton>
        </div>
      ) : null}
    </div>
  );
}
