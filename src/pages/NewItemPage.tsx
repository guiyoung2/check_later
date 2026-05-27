import type { ChangeEvent, FormEvent, JSX } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { detectType } from '../lib/form-type-detect';
import { fetchOgTitle } from '../lib/og-parser';
import { useCreateItem } from '../hooks/useCreateItem';
import { storageService } from '../services/storageService';
import { useAuth } from '../lib/auth';
import type { ItemType } from '../types';

const TYPE_LABELS: Record<ItemType, string> = {
  video: '영상',
  article: '글',
  screenshot: '캡처',
  memo: '메모',
};

const TYPE_LIST: ItemType[] = ['video', 'article', 'screenshot', 'memo'];

// 새 항목 추가 확인 폼
export default function NewItemPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutateAsync: createItem, isPending } = useCreateItem();
  const { user } = useAuth();

  const initUrl = searchParams.get('url') ?? '';
  const [preAssignedId] = useState(() => crypto.randomUUID());

  const [title, setTitle] = useState(searchParams.get('title') ?? '');
  const [url, setUrl] = useState(initUrl);
  const [memo, setMemo] = useState(searchParams.get('text') ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [typeOverride, setTypeOverride] = useState<ItemType | null>(null);
  const detectedType = useMemo(
    () => detectType({ hasImage: !!imageFile, url }),
    [url, imageFile]
  );
  const type = typeOverride ?? detectedType;
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL 변경 시 og:title 자동 채움
  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed) return;

    fetchOgTitle(trimmed).then((ogTitle) => {
      if (ogTitle) {
        setTitle((prev) => (prev.trim() === '' ? ogTitle : prev));
      } else {
        setTitle((prev) => (prev.trim() === '' ? trimmed : prev));
      }
    });
  }, [url]);

  // 이미지 파일 선택/해제 핸들러
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setError(null);

    try {
      if (imageFile) {
        setIsUploading(true);
        const imagePath = await storageService.upload(imageFile, user.id, preAssignedId);
        setIsUploading(false);
        await createItem({
          id: preAssignedId,
          title: title.trim(),
          type,
          url: url.trim() || undefined,
          memo: memo.trim() || undefined,
          image_path: imagePath,
        });
      } else {
        await createItem({
          title: title.trim(),
          type,
          url: url.trim() || undefined,
          memo: memo.trim() || undefined,
        });
      }
      navigate('/');
    } catch (err) {
      setIsUploading(false);
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다');
    }
  }

  const isLoading = isUploading || isPending;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-10 bg-[var(--color-bg)] border-b border-[var(--color-border)] flex items-center gap-3 px-4 h-14">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="flex items-center justify-center w-9 h-9 rounded-[8px] text-[var(--color-text-sub)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
        >
          ←
        </button>
        <span className="font-semibold text-[var(--color-text-primary)] text-base">새 항목</span>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-4 flex flex-col gap-5 max-w-lg mx-auto">
        {/* URL 입력 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="url" className="text-xs font-medium text-[var(--color-text-sub)]">
            URL
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            className="px-3 py-2 text-sm rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-sub)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {/* 제목 입력 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-xs font-medium text-[var(--color-text-sub)]">
            제목 <span className="text-[var(--color-accent)]">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="px-3 py-2 text-sm rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-sub)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {/* 유형 칩 선택 */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--color-text-sub)]">유형</span>
          <div className="flex gap-2 flex-wrap">
            {TYPE_LIST.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeOverride(t)}
                className={`px-3 py-1.5 rounded-[999px] text-sm font-medium transition-colors ${
                  type === t
                    ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-sub)]'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="image" className="text-xs font-medium text-[var(--color-text-sub)]">
            이미지
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm text-[var(--color-text-sub)] file:mr-3 file:py-1.5 file:px-3 file:rounded-[6px] file:border file:border-[var(--color-border)] file:bg-[var(--color-surface)] file:text-[var(--color-text-sub)] file:text-sm file:cursor-pointer"
          />
          {imageFile && (
            <span className="text-xs text-[var(--color-text-sub)]">{imageFile.name}</span>
          )}
        </div>

        {/* 메모 입력 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="memo" className="text-xs font-medium text-[var(--color-text-sub)]">
            메모
          </label>
          <textarea
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="짧은 메모 (선택)"
            rows={3}
            className="px-3 py-2 text-sm rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-sub)] outline-none focus:border-[var(--color-accent)] resize-none"
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* 저장 버튼 */}
        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="w-full py-2.5 rounded-[8px] bg-[var(--color-accent)] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? '업로드 중...' : isPending ? '저장 중...' : '저장'}
        </button>
      </form>
    </div>
  );
}
