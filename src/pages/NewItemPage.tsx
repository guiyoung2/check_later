import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { detectType } from '../lib/form-type-detect';
import { fetchOgTitle } from '../lib/og-parser';
import { useCreateItem } from '../hooks/useCreateItem';
import type { ItemType } from '../types';

const TYPE_LABELS: Record<ItemType, string> = {
  video: '영상',
  article: '글',
  screenshot: '캡처',
  memo: '메모',
};

const TYPE_LIST: ItemType[] = ['video', 'article', 'screenshot', 'memo'];

// 새 항목 추가 확인 폼 (이미지 업로드는 step 7에서 추가)
export default function NewItemPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: createItem, isPending } = useCreateItem();

  const initUrl = searchParams.get('url') ?? '';

  const [title, setTitle] = useState(searchParams.get('title') ?? '');
  const [url, setUrl] = useState(initUrl);
  const [memo, setMemo] = useState(searchParams.get('text') ?? '');
  const [type, setType] = useState<ItemType>(() =>
    detectType({ hasImage: false, url: initUrl })
  );

  // URL 변경 시 type 재판정 + og:title 자동 채움
  useEffect(() => {
    setType(detectType({ hasImage: false, url }));

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createItem(
      {
        title: title.trim(),
        type,
        url: url.trim() || undefined,
        memo: memo.trim() || undefined,
      },
      { onSuccess: () => navigate('/') }
    );
  }

  return (
    <div className="min-h-screen bg-[--color-bg]">
      <header className="sticky top-0 z-10 bg-[--color-bg] border-b border-[--color-border] flex items-center gap-3 px-4 h-14">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="flex items-center justify-center w-9 h-9 rounded-[8px] text-[--color-text-sub] hover:text-[--color-text-primary] hover:bg-[--color-surface]"
        >
          ←
        </button>
        <span className="font-semibold text-[--color-text-primary] text-base">새 항목</span>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-4 flex flex-col gap-5 max-w-lg mx-auto">
        {/* URL 입력 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="url" className="text-xs font-medium text-[--color-text-sub]">
            URL
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            className="px-3 py-2 text-sm rounded-[6px] border border-[--color-border] bg-[--color-surface] text-[--color-text-primary] placeholder:text-[--color-text-sub] outline-none focus:border-[--color-accent]"
          />
        </div>

        {/* 제목 입력 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-xs font-medium text-[--color-text-sub]">
            제목 <span className="text-[--color-accent]">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="px-3 py-2 text-sm rounded-[6px] border border-[--color-border] bg-[--color-surface] text-[--color-text-primary] placeholder:text-[--color-text-sub] outline-none focus:border-[--color-accent]"
          />
        </div>

        {/* 유형 칩 선택 */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[--color-text-sub]">유형</span>
          <div className="flex gap-2 flex-wrap">
            {TYPE_LIST.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-[999px] text-sm font-medium transition-colors ${
                  type === t
                    ? 'bg-[--color-accent-bg] text-[--color-accent]'
                    : 'bg-[--color-surface] border border-[--color-border] text-[--color-text-sub]'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* 메모 입력 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="memo" className="text-xs font-medium text-[--color-text-sub]">
            메모
          </label>
          <textarea
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="짧은 메모 (선택)"
            rows={3}
            className="px-3 py-2 text-sm rounded-[6px] border border-[--color-border] bg-[--color-surface] text-[--color-text-primary] placeholder:text-[--color-text-sub] outline-none focus:border-[--color-accent] resize-none"
          />
        </div>

        {/* 저장 버튼 */}
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="w-full py-2.5 rounded-[8px] bg-[--color-accent] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? '저장 중...' : '저장'}
        </button>
      </form>
    </div>
  );
}
