# Step 7: new-item-rich

## 읽어야 할 파일

- `fix5.md` — §1, §2-H, §5(작성=수정 동일 패러다임, 빠른저장 단순 폼 폐기 확정)
- `phases/design-renewal-fix/step6.md` — `ItemForm` 시그니처/계약
- `src/components/items/ItemForm.tsx` — step 6에서 추출한 공용 폼
- `src/pages/NewItemPage.tsx` — 현재 단순 작성 폼(이번에 ItemForm으로 교체)
- `src/services/itemsService.ts`, `itemAttachmentsService.ts`, `storageService.ts` — 저장/첨부/업로드
- `src/hooks/useCreateItem.ts` — 생성 mutation
- `src/lib/og-parser.ts`, `form-type-detect.ts` — og:title / type 판정
- `docs/PRD.md` — **Web Share Target `/new?title=&text=&url=` 진입은 보존 필수**
- `src/pages/NewItemPage.test.tsx` — Web Share Target 회귀 테스트 등(갱신 필요)

## 작업

`NewItemPage`를 **`ItemForm`(mode="create")** 기반으로 교체해, main에 있던 리치 작성(제목·다중 URL·다중 이미지·og:title)을 복원한다.

요구사항:
1. 빈 `ItemForm`을 렌더하고, `onSubmit(values)`에서:
   - 신규 이미지(File[])를 `storageService.upload`로 업로드 → 경로 수집.
   - `useCreateItem`으로 항목 생성(title/type/대표 url/memo/대표 image_path).
   - 다중 url·image를 `itemAttachmentsService.createMany`로 저장.
   - 성공 시 Toast "저장됨" + Home으로 navigate.
2. **Web Share Target 진입 보존**: `?title=&text=&url=` 파라미터를 `ItemForm`의 `initialValues`로 매핑(title→title, url→urls[0], text→memo). 자동 저장 아님(확인 화면 유지).
3. type 자동 판정 결과 표시(읽기 전용).
4. 저장 중 disabled/스피너, 실패 시 error 표시(ItemForm props 활용).

## 핵심 규칙 (회귀 금지)
- Web Share Target 파라미터 처리(`useSearchParams`로 title/text/url 수신)를 제거하지 마라. 이유: PWA 핵심 기능.
- 저장 경로(create + attachments + upload)는 main 동작과 데이터 무결성 측면에서 동등해야 한다. 다중 이미지/다중 URL이 실제로 저장되어야 한다.
- `ItemForm`은 값 수집만 → 저장 오케스트레이션은 이 페이지가 담당(step 6 계약 준수).

## Acceptance Criteria

```bash
npm run build
npm run test
```

빌드·테스트 통과. `NewItemPage.test.tsx`를 새 폼 기준으로 갱신하되 **Web Share Target 회귀 테스트(`?text=`/`?url=` 진입 시 초기값 채움)는 반드시 유지**. 다중 URL/이미지 입력→저장 호출 검증 테스트 추가 권장.

## 검증 절차
1. `npm run build && npm run test`
2. Web Share Target 시나리오: `?url=...` → urls[0] 채움 / `?text=...` → memo 채움 확인(테스트로).
3. `phases/design-renewal-fix/feature_list.json`의 feat-10을 `passes: true`로.
4. `index.json` step 7 상태 갱신.

## 금지사항
- 자동 저장을 추가하지 마라. 이유: PRD에서 확인 화면 유지 명시.
- services/hooks 시그니처를 바꾸지 마라(재사용). 변경이 필요하면 step을 멈추고 blocked로 표시.
- 단순 bottom-sheet 빠른저장 폼을 남겨두지 마라. 이유: 작성=수정 통일이 이번 목표(fix5 §5 확정).
