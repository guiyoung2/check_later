import type { ChangeEvent, FormEvent, JSX } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { Textarea } from '../ui/Textarea';
import { Divider } from '../ui/Divider';
import { detectType } from '../../lib/form-type-detect';
import { fetchOgTitle } from '../../lib/og-parser';
import type { ItemType } from '../../types';

const TYPE_LABELS: Record<ItemType, string> = {
  video: '영상',
  article: '글',
  screenshot: '캡처',
  memo: '메모',
};

export interface ItemFormValues {
  title: string;
  urls: string[];
  memo: string;
  existingImagePaths: string[];
  newImageFiles: File[];
}

export interface ItemFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<ItemFormValues>;
  /** edit 모드: 기존 이미지 미리보기용 signed URL 맵 (path → signedUrl) */
  existingImageSignedUrls?: Record<string, string>;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (values: ItemFormValues) => void | Promise<void>;
  onCancel?: () => void;
}

function SpinnerIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// 공용 항목 폼 컴포넌트 (작성·수정 공유)
export function ItemForm({
  mode,
  initialValues,
  existingImageSignedUrls = {},
  submitting = false,
  error,
  onSubmit,
  onCancel,
}: ItemFormProps): JSX.Element {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [urls, setUrls] = useState<string[]>(
    initialValues?.urls?.length ? initialValues.urls : [''],
  );
  const [memo, setMemo] = useState(initialValues?.memo ?? '');
  const [existingImagePaths, setExistingImagePaths] = useState<string[]>(
    initialValues?.existingImagePaths ?? [],
  );
  const [newImages, setNewImages] = useState<Array<{ file: File; preview: string }>>([]);

  // 현재 title 값을 ref로 추적 (og:title 자동채움 시 덮어쓰기 방지)
  const titleRef = useRef(title);
  titleRef.current = title;

  // 언마운트 시 preview URL 정리
  const newImagesRef = useRef(newImages);
  newImagesRef.current = newImages;
  useEffect(() => {
    return () => {
      newImagesRef.current.forEach(({ preview }) => URL.revokeObjectURL(preview));
    };
  }, []);

  // 첫 번째 URL이 유효하고 title이 비어있을 때 og:title 자동 채움
  const firstUrl = urls[0]?.trim() ?? '';
  useEffect(() => {
    if (!firstUrl || !/^https?:\/\//i.test(firstUrl)) return;
    let ignore = false;
    fetchOgTitle(firstUrl).then((fetched) => {
      if (!ignore && fetched && !titleRef.current.trim()) {
        setTitle(fetched);
      }
    });
    return () => {
      ignore = true;
    };
  }, [firstUrl]);

  // 값 기반 type 자동 판정 (읽기 전용 표시)
  const detectedType = useMemo(() => {
    const hasImage = existingImagePaths.length > 0 || newImages.length > 0;
    const validUrl = urls.find((u) => /^https?:\/\//i.test(u.trim()));
    return detectType({ hasImage, url: validUrl?.trim() });
  }, [existingImagePaths, newImages, urls]);

  function handleUrlChange(index: number, value: string) {
    setUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
  }

  function addUrl() {
    setUrls((prev) => [...prev, '']);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const entries = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setNewImages((prev) => [...prev, ...entries]);
    e.target.value = '';
  }

  function removeExistingImage(path: string) {
    setExistingImagePaths((prev) => prev.filter((p) => p !== path));
  }

  function removeNewImage(index: number) {
    setNewImages((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onSubmit({
      title,
      urls,
      memo,
      existingImagePaths,
      newImageFiles: newImages.map(({ file }) => file),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* 제목 */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="item-form-title"
          className="text-[13px] leading-[1.2] font-medium tracking-[0.02em] text-text-muted"
        >
          제목 *
        </label>
        <input
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={mode === 'create'}
          id="item-form-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="min-h-[44px] rounded-sm border border-border bg-surface px-3 py-2 text-[16px] leading-[1.6] text-text-primary outline-none transition-[border-color] duration-200 hover:border-border-strong focus:border-border-strong focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none"
        />
      </div>

      {/* URL 목록 */}
      <div className="flex flex-col gap-2">
        <span className="text-[13px] leading-[1.2] font-medium tracking-[0.02em] text-text-muted">
          URL
        </span>
        {urls.map((url, index) => (
          <input
            key={index}
            aria-label={`URL ${index + 1}`}
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(index, e.target.value)}
            className="min-h-[44px] rounded-sm border border-border bg-surface px-3 py-2 text-[16px] leading-[1.6] text-text-primary outline-none transition-[border-color] duration-200 hover:border-border-strong focus:border-border-strong focus-visible:ring-2 focus-visible:ring-border-strong"
          />
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addUrl}
          className="self-start"
        >
          URL 추가
        </Button>
      </div>

      {/* 이미지 */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="item-form-images"
          className="text-[13px] leading-[1.2] font-medium tracking-[0.02em] text-text-muted"
        >
          이미지
        </label>
        {/* 기존 이미지 그리드 (edit 모드) */}
        {existingImagePaths.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {existingImagePaths.map((path) => (
              <div key={path} className="relative overflow-hidden rounded-sm bg-surface-sub">
                {existingImageSignedUrls[path] ? (
                  <img
                    src={existingImageSignedUrls[path]}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="aspect-square w-full" />
                )}
                <button
                  type="button"
                  aria-label="기존 이미지 삭제"
                  onClick={() => removeExistingImage(path)}
                  className="absolute right-1 top-1 min-h-[28px] rounded-full bg-surface/90 px-2 text-[12px] font-medium text-text-secondary"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
        {/* 새 이미지 미리보기 */}
        {newImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {newImages.map(({ preview }, index) => (
              <div key={preview} className="relative overflow-hidden rounded-sm bg-surface-sub">
                <img src={preview} alt="" className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  aria-label="새 이미지 제거"
                  onClick={() => removeNewImage(index)}
                  className="absolute right-1 top-1 min-h-[28px] rounded-full bg-surface/90 px-2 text-[12px] font-medium text-text-secondary"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          id="item-form-images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="text-[14px] text-text-secondary file:mr-3 file:cursor-pointer file:rounded-sm file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-[13px] file:text-text-secondary"
        />
      </div>

      {/* 메모 */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="item-form-memo"
          className="text-[13px] leading-[1.2] font-medium tracking-[0.02em] text-text-muted"
        >
          메모
        </label>
        <Textarea
          id="item-form-memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={4}
        />
      </div>

      <Divider />

      {/* 에러 */}
      {error && (
        <p role="alert" className="text-[13px] leading-[1.2] font-medium tracking-[0.02em] text-error">
          {error}
        </p>
      )}

      {/* type 칩(읽기 전용) + 액션 버튼 */}
      <div className="flex items-center justify-between gap-3">
        <Chip variant="type">{TYPE_LABELS[detectedType]}</Chip>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              취소
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || !title.trim()}
            leftIcon={submitting ? <SpinnerIcon /> : undefined}
          >
            {submitting ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </form>
  );
}
