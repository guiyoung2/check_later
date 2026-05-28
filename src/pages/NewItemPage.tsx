import type { ChangeEvent, FormEvent, JSX } from 'react';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { detectType } from '../lib/form-type-detect';
import { fetchOgTitle } from '../lib/og-parser';
import { useCreateItem } from '../hooks/useCreateItem';
import { storageService } from '../services/storageService';
import { itemAttachmentsService } from '../services/itemAttachmentsService';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Textarea } from '../components/ui/Textarea';
import { Divider } from '../components/ui/Divider';
import type { ItemType } from '../types';

const TYPE_LABELS: Record<ItemType, string> = {
  video: '영상',
  article: '글',
  screenshot: '캡처',
  memo: '메모',
};

// URL 패턴 감지 (http/https로 시작)
function isUrl(text: string): boolean {
  return /^https?:\/\//i.test(text.trim());
}

function LinkIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" stroke="currentColor" fill="none" strokeWidth="1.8">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TextIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" stroke="currentColor" fill="none" strokeWidth="1.8">
      <path d="M4 7h16M4 12h10M4 17h7" strokeLinecap="round" />
    </svg>
  );
}

function ImageIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" stroke="currentColor" fill="none" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" fill="none" strokeWidth="1.8">
      <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
    </svg>
  );
}

function SpinnerIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ArrowIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" stroke="currentColor" fill="none" strokeWidth="2">
      <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface QuickOptionButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: JSX.Element;
}

// quick option 선택 버튼 (링크/텍스트/이미지)
function QuickOptionButton({ label, active, onClick, icon }: QuickOptionButtonProps): JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        'flex min-h-[44px] items-center justify-center gap-1.5 rounded-sm border px-3 py-2',
        'text-[13px] font-medium leading-[1.2] tracking-[0.02em]',
        'transition-[background-color,border-color,color] duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong',
        active
          ? 'border-border-strong bg-surface-sub text-text-primary'
          : 'border-border bg-surface text-text-muted hover:bg-surface-sub hover:text-text-secondary',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  );
}

// 새 항목 추가 페이지 — 모바일: BottomSheet 스타일, 데스크탑: 중앙 카드
export default function NewItemPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutateAsync: createItem, isPending } = useCreateItem();
  const { user } = useAuth();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preAssignedId] = useState(() => crypto.randomUUID());

  // Web Share Target 파라미터 → textarea 초기값
  const sharedUrl = searchParams.get('url') ?? '';
  const sharedText = searchParams.get('text') ?? '';
  const sharedTitle = searchParams.get('title') ?? '';
  const initContent = sharedUrl || sharedText || sharedTitle;

  const [content, setContent] = useState(initContent);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [typeOverride, setTypeOverride] = useState<ItemType | null>(null);
  const [ogTitle, setOgTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // content + imageFile 기반 type 자동 판정
  const detectedType = useMemo(
    () => detectType({ hasImage: imageFile !== null, url: isUrl(content) ? content.trim() : undefined }),
    [content, imageFile],
  );
  const type = typeOverride ?? detectedType;

  // URL 감지 시 OG title 비동기 조회
  useEffect(() => {
    const trimmed = content.trim();
    if (!isUrl(trimmed)) {
      setOgTitle('');
      return;
    }
    fetchOgTitle(trimmed).then((title) => {
      setOgTitle(title ?? '');
    });
  }, [content]);

  // 이미지 파일 선택
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setTypeOverride('screenshot');
    setError(null);
    e.target.value = '';
  }

  // 이미지 제거
  function removeImage() {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
    setTypeOverride(null);
  }

  // quick option chip 클릭 처리
  function handleQuickOption(option: 'link' | 'text' | 'image') {
    if (option === 'image') {
      fileInputRef.current?.click();
      return;
    }
    removeImage();
    setTypeOverride(option === 'text' ? 'memo' : null);
  }

  // 저장 핸들러
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setError(null);

    try {
      const trimmedContent = content.trim();
      const url = isUrl(trimmedContent) ? trimmedContent : undefined;
      const textMemo = !url && trimmedContent ? trimmedContent : undefined;
      const title = url
        ? ogTitle || url
        : textMemo
          ? textMemo.slice(0, 300)
          : imageFile
            ? imageFile.name
            : '';

      let imagePath: string | undefined;
      if (imageFile) {
        setIsUploading(true);
        imagePath = await storageService.upload(imageFile, user.id, preAssignedId);
        setIsUploading(false);
      }

      await createItem({ id: preAssignedId, title, type, url, memo: textMemo, image_path: imagePath });

      const attachments: Array<{ kind: 'url' | 'image'; value: string }> = [];
      if (url) attachments.push({ kind: 'url', value: url });
      if (imagePath) attachments.push({ kind: 'image', value: imagePath });
      if (attachments.length > 0) {
        await itemAttachmentsService.createMany(preAssignedId, user.id, attachments);
      }

      showToast({ message: '저장됨', duration: 4000 });
      navigate('/');
    } catch (err) {
      setIsUploading(false);
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다');
    }
  }

  const isLoading = isUploading || isPending;
  const canSave = !!(content.trim() || imageFile);

  return (
    <div className="flex min-h-screen flex-col justify-end bg-bg md:items-start md:justify-center md:px-4 md:pt-16">
      {/* 카드: 모바일=하단 시트, 데스크탑=중앙 카드 */}
      <div className="w-full rounded-t-lg border-t border-border bg-surface px-4 pb-8 pt-3 md:mx-auto md:max-w-[480px] md:rounded-lg md:border md:px-8 md:py-8">
        {/* 드래그 핸들 (모바일 전용) */}
        <div aria-hidden="true" className="mx-auto mb-4 h-1 w-8 rounded-full bg-border md:hidden" />

        {/* 헤더 */}
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[18px] font-medium leading-[1.5] text-text-primary">새로운 기록</span>
          <button
            type="button"
            aria-label="닫기"
            onClick={() => navigate(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-sm text-text-muted transition-[background-color,color] duration-200 ease-out hover:bg-surface-sub hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 3-grid quick option chip */}
          <div className="grid grid-cols-3 gap-2">
            <QuickOptionButton
              label="링크"
              active={type === 'article' || type === 'video'}
              onClick={() => handleQuickOption('link')}
              icon={<LinkIcon />}
            />
            <QuickOptionButton
              label="텍스트"
              active={type === 'memo'}
              onClick={() => handleQuickOption('text')}
              icon={<TextIcon />}
            />
            <QuickOptionButton
              label="이미지"
              active={type === 'screenshot'}
              onClick={() => handleQuickOption('image')}
              icon={<ImageIcon />}
            />
          </div>

          {/* 숨겨진 파일 인풋 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="이미지 파일 선택"
            onChange={handleFileChange}
          />

          {/* 에러 메시지 (textarea 위) */}
          {error && (
            <p role="alert" className="text-[13px] font-medium leading-[1.2] tracking-[0.02em] text-error">
              {error}
            </p>
          )}

          {/* 메인 textarea */}
          <Textarea
            placeholder="무엇을 기록할까요?"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError(null);
            }}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            aria-label="내용"
          />

          {/* 이미지 미리보기 */}
          {imagePreviewUrl && imageFile && (
            <div className="relative">
              <img
                src={imagePreviewUrl}
                alt="선택된 이미지 미리보기"
                className="max-h-[200px] w-full rounded-md border border-border object-cover"
              />
              <button
                type="button"
                aria-label="이미지 제거"
                onClick={removeImage}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-text-primary/70 text-bg transition-[background-color] duration-200 ease-out hover:bg-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
              >
                <CloseIcon />
              </button>
            </div>
          )}

          <Divider />

          {/* 액션 바: type chip(읽기 전용) + 저장 버튼 */}
          <div className="flex items-center justify-between">
            <Chip variant="type">{TYPE_LABELS[type]}</Chip>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isLoading}
              disabled={isLoading || !canSave}
              leftIcon={isLoading ? <SpinnerIcon /> : undefined}
              rightIcon={isLoading ? undefined : <ArrowIcon />}
            >
              저장
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
