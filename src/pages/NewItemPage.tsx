import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { detectType } from '../lib/form-type-detect';
import { useCreateItem } from '../hooks/useCreateItem';
import { storageService } from '../services/storageService';
import { itemAttachmentsService } from '../services/itemAttachmentsService';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/ui/Toast';
import { BottomNav } from '../components/ui/BottomNav';
import { SideNav } from '../components/ui/SideNav';
import { ItemForm } from '../components/items/ItemForm';
import type { ItemFormValues } from '../components/items/ItemForm';

// 새 항목 추가 페이지 — Web Share Target 파라미터를 ItemForm initialValues로 매핑
export default function NewItemPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutateAsync: createItem, isPending } = useCreateItem();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Web Share Target: ?title= → title, ?url= → urls[0], ?text= → memo
  const sharedTitle = searchParams.get('title') ?? '';
  const sharedUrl = searchParams.get('url') ?? '';
  const sharedText = searchParams.get('text') ?? '';

  const initialValues: Partial<ItemFormValues> = {
    title: sharedTitle,
    ...(sharedUrl ? { urls: [sharedUrl] } : {}),
    memo: sharedText,
  };

  // 업로드 → 항목 생성 → 첨부 저장 오케스트레이션
  async function handleSubmit(values: ItemFormValues) {
    if (!user) return;
    setSubmitError(null);

    try {
      const itemId = crypto.randomUUID();

      // 신규 이미지 업로드
      const uploadedPaths = await Promise.all(
        values.newImageFiles.map((file) => storageService.upload(file, user.id, itemId)),
      );

      // 제출된 값 기반 type 판정
      const validUrl = values.urls.find((u) => /^https?:\/\//i.test(u.trim()))?.trim();
      const type = detectType({
        hasImage: uploadedPaths.length > 0,
        url: validUrl,
      });

      await createItem({
        id: itemId,
        title: values.title,
        type,
        url: validUrl,
        memo: values.memo || undefined,
        image_path: uploadedPaths[0],
      });

      // 다중 URL·이미지 첨부 저장
      const attachments: Array<{ kind: 'url' | 'image'; value: string }> = [
        ...values.urls
          .filter((u) => u.trim())
          .map((u) => ({ kind: 'url' as const, value: u.trim() })),
        ...uploadedPaths.map((p) => ({ kind: 'image' as const, value: p })),
      ];
      if (attachments.length > 0) {
        await itemAttachmentsService.createMany(itemId, user.id, attachments);
      }

      showToast({ message: '저장됨', duration: 4000 });
      navigate('/');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다');
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg pb-16 md:items-start md:pb-0 md:pl-60 md:pr-4 md:pt-16">
      <SideNav />
      <div className="w-full px-4 py-6 md:mx-auto md:max-w-[600px]">
        <h1 className="mb-6 text-[18px] font-medium leading-[1.5] text-text-primary">새로운 기록</h1>
        <ItemForm
          mode="create"
          initialValues={initialValues}
          submitting={isPending}
          error={submitError}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      </div>
      <BottomNav />
    </div>
  );
}
