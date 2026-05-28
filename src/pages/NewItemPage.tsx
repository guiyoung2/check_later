import type { ChangeEvent, FormEvent, JSX } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { detectType } from '../lib/form-type-detect';
import { fetchOgTitle } from '../lib/og-parser';
import { useCreateItem } from '../hooks/useCreateItem';
import { storageService } from '../services/storageService';
import { itemAttachmentsService } from '../services/itemAttachmentsService';
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
  const [urls, setUrls] = useState<string[]>([initUrl]);
  const [memo, setMemo] = useState(searchParams.get('text') ?? '');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [typeOverride, setTypeOverride] = useState<ItemType | null>(null);
  const primaryUrl = urls.find((item) => item.trim() !== '') ?? '';
  const detectedType = useMemo(
    () => detectType({ hasImage: imageFiles.length > 0, url: primaryUrl }),
    [primaryUrl, imageFiles.length]
  );
  const type = typeOverride ?? detectedType;
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL 변경 시 og:title 자동 채움
  useEffect(() => {
    const trimmed = primaryUrl.trim();
    if (!trimmed) return;

    fetchOgTitle(trimmed).then((ogTitle) => {
      if (ogTitle) {
        setTitle((prev) => (prev.trim() === '' ? ogTitle : prev));
      } else {
        setTitle((prev) => (prev.trim() === '' ? trimmed : prev));
      }
    });
  }, [primaryUrl]);

  // 이미지 파일 선택/해제 핸들러
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setImageFiles(files);
    setError(null);
  }

  function updateUrl(index: number, value: string) {
    setUrls((prev) => prev.map((url, currentIndex) => (currentIndex === index ? value : url)));
  }

  function addUrl() {
    setUrls((prev) => [...prev, '']);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setError(null);

    try {
      const trimmedUrls = urls.map((item) => item.trim()).filter(Boolean);
      let imagePaths: string[] = [];

      if (imageFiles.length > 0) {
        setIsUploading(true);
        imagePaths = [];
        for (const file of imageFiles) {
          imagePaths.push(await storageService.upload(file, user.id, preAssignedId));
        }
        setIsUploading(false);
      }

      await createItem({
        id: preAssignedId,
        title: title.trim(),
        type,
        url: trimmedUrls[0],
        memo: memo.trim() || undefined,
        image_path: imagePaths[0],
      });
      await itemAttachmentsService.createMany(preAssignedId, user.id, [
        ...trimmedUrls.map((value) => ({ kind: 'url' as const, value })),
        ...imagePaths.map((value) => ({ kind: 'image' as const, value })),
      ]);
      navigate('/');
    } catch (err) {
      setIsUploading(false);
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다');
    }
  }

  const isLoading = isUploading || isPending;

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 bg-bg border-b border-border flex items-center gap-3 px-4 h-14">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="flex items-center justify-center w-9 h-9 rounded-[8px] text-text-sub hover:text-text-primary hover:bg-surface"
        >
          ←
        </button>
        <span className="font-semibold text-text-primary text-base">새 항목</span>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-4 flex flex-col gap-5 max-w-lg mx-auto">
        {/* URL 입력 */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-sub">URL</span>
          {urls.map((url, index) => (
            <input
              key={index}
              aria-label={`URL ${index + 1}`}
              type="text"
              value={url}
              onChange={(e) => updateUrl(index, e.target.value)}
              placeholder="https://"
              className="px-3 py-2 text-sm rounded-[6px] border border-border bg-surface text-text-primary placeholder:text-text-sub outline-none focus:border-accent"
            />
          ))}
          <button
            type="button"
            onClick={addUrl}
            className="self-start min-h-9 rounded-[8px] border border-border px-3 text-sm font-medium text-text-sub hover:bg-surface"
          >
            URL 추가
          </button>
        </div>

        {/* 제목 입력 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-xs font-medium text-text-sub">
            제목 <span className="text-accent">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="px-3 py-2 text-sm rounded-[6px] border border-border bg-surface text-text-primary placeholder:text-text-sub outline-none focus:border-accent"
          />
        </div>

        {/* 유형 칩 선택 */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-text-sub">유형</span>
          <div className="flex gap-2 flex-wrap">
            {TYPE_LIST.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeOverride(t)}
                className={`px-3 py-1.5 rounded-[999px] text-sm font-medium transition-colors ${
                  type === t
                    ? 'bg-accent-bg text-accent'
                    : 'bg-surface border border-border text-text-sub'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="image" className="text-xs font-medium text-text-sub">
            이미지
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="text-sm text-text-sub file:mr-3 file:py-1.5 file:px-3 file:rounded-[6px] file:border file:border-border file:bg-surface file:text-text-sub file:text-sm file:cursor-pointer"
          />
          {imageFiles.length > 0 && (
            <div className="flex flex-col gap-1">
              {imageFiles.map((file) => (
                <span key={`${file.name}-${file.size}`} className="text-xs text-text-sub">
                  {file.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 메모 입력 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="memo" className="text-xs font-medium text-text-sub">
            메모
          </label>
          <textarea
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="짧은 메모 (선택)"
            rows={3}
            className="px-3 py-2 text-sm rounded-[6px] border border-border bg-surface text-text-primary placeholder:text-text-sub outline-none focus:border-accent resize-none"
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
          className="w-full py-2.5 rounded-[8px] bg-accent text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? '업로드 중...' : isPending ? '저장 중...' : '저장'}
        </button>
      </form>
    </div>
  );
}
