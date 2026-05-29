# Step 6: item-form-extract

## 읽어야 할 파일

- `fix5.md` — §1(작성 폼 회귀 사실), §2-H, §5(확정: **공용 ItemForm 추출**)
- `src/pages/ItemDetailPage.tsx` — **수정(edit) 폼의 현 리치 구현**: 제목 입력, URL 리스트 + "URL 추가", 기존 이미지 그리드(삭제) + 새 이미지 파일 input, 메모, 저장/취소. 이 로직이 추출 원본
- `src/pages/NewItemPage.tsx` — 현재 단순 작성 폼(이후 step에서 ItemForm으로 교체)
- `src/services/itemsService.ts` — create/update(가능 메서드 확인)
- `src/services/itemAttachmentsService.ts` — 다중 url/image 첨부(`createMany` 등)
- `src/services/storageService.ts` — 이미지 업로드(`upload`)/signed URL
- `src/hooks/useCreateItem.ts`, `src/hooks/usePatchItem.ts` — mutation 훅
- `src/lib/form-type-detect.ts`, `src/lib/og-parser.ts` — type 자동 판정 / og:title
- `src/components/ui/*` — Button/Input/Textarea/Divider/Chip 재사용

## 작업

작성·수정이 **공유**할 공용 폼 컴포넌트 `src/components/items/ItemForm.tsx`를 추출한다. 이 step은 **컴포넌트 신설 + 타입 정의까지**가 목표이며, 실제 화면 연결(작성/수정 교체)은 step 7·8에서 한다.

### 시그니처(인터페이스 수준, 구현은 재량)
```tsx
export interface ItemFormValues {
  title: string;
  urls: string[];          // 다중 URL (빈 문자열 허용, 저장 시 trim/filter)
  memo: string;
  // 이미지: 기존(경로) + 신규(File) 분리 관리
  existingImagePaths: string[];   // edit에서 로드된 기존 이미지
  newImageFiles: File[];          // 새로 추가된 파일
}

export interface ItemFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<ItemFormValues>;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (values: ItemFormValues) => void | Promise<void>;
  onCancel?: () => void;
}
```

요구사항:
1. 제목 입력, URL 다중(추가/삭제), 이미지 다중(기존 이미지 삭제 + 신규 파일 추가/미리보기), 메모 입력.
2. URL 입력 시 og:title 자동 채움 로직(기존 `og-parser` 사용)을 폼 내부 또는 호출측에서 일관되게 처리할 수 있도록 노출.
3. type 자동 판정(`form-type-detect`)을 값으로부터 계산(읽기 전용 표시).
4. submitting 시 저장 disabled + 스피너, error 표시.
5. **저장/스토리지/첨부 호출은 폼이 직접 하지 않는다.** 폼은 값만 모아 `onSubmit(values)`로 넘기고, 실제 createItem/patch/upload/attachments는 호출측(step 7·8)이 담당한다. 이유: create/edit의 저장 경로가 달라 폼은 순수 입력 수집에 집중.

## 핵심 규칙
- 이 step에서는 `NewItemPage`/`ItemDetailPage`의 동작을 **바꾸지 않는다**(아직 ItemForm을 연결하지 않음). 컴포넌트만 추가하고 빌드/테스트가 깨지지 않게 한다.
- 서비스/훅 시그니처를 변경하지 마라(재사용만).
- side-stripe/glass/gradient text/`#000`·`#fff` 금지.

## Acceptance Criteria

```bash
npm run build
npm run test
```

빌드 통과(미사용으로 인한 컴파일 에러 없도록 export만 하고 아직 미연결 가능). 기존 테스트 전부 통과(동작 무변경). 가능하면 `ItemForm`에 대한 최소 렌더 테스트 추가.

## 검증 절차
1. `npm run build && npm run test`
2. `phases/design-renewal-fix/feature_list.json`의 feat-9를 `passes: true`로.
3. `index.json` step 6 상태 갱신.

## 금지사항
- 이 step에서 `NewItemPage`/`ItemDetailPage`의 기존 폼을 제거·교체하지 마라. 이유: 교체는 step 7·8에서 회귀 테스트와 함께. 여기서 바꾸면 중간 상태가 깨진다.
- 저장/업로드/첨부 로직을 ItemForm 내부에 넣지 마라. 이유: create/edit 경로 분리 유지.
- services/hooks를 수정하지 마라.
