# Step 8: edit-item-migrate

## 읽어야 할 파일

- `fix5.md` — §2-H, §5(공용 ItemForm로 작성·수정 통일)
- `phases/design-renewal-fix/step6.md` — `ItemForm` 계약
- `phases/design-renewal-fix/step7.md` — 작성 경로가 ItemForm을 쓰는 방식(저장 오케스트레이션 참고)
- `src/components/items/ItemForm.tsx` — 공용 폼
- `src/pages/ItemDetailPage.tsx` — **현재 인라인 edit 폼**(여기를 ItemForm으로 이전). 상세 보기/공유/삭제/상태 토글은 별개로 유지
- `src/hooks/usePatchItem.ts` — 수정 mutation
- `src/services/itemAttachmentsService.ts`, `storageService.ts` — 기존 이미지 삭제/신규 업로드/url 갱신
- `src/pages/ItemDetailPage.test.tsx` — 수정 폼 관련 테스트(제목 로드/저장 등) — 갱신 필요

## 작업

`ItemDetailPage`의 **수정(edit) 모드를 `ItemForm`(mode="edit")으로 이전**한다. 작성(step 7)과 동일한 폼을 공유하게 되어 작성/수정 패러다임이 일치한다.

요구사항:
1. 편집 진입 시 현재 항목 값으로 `ItemForm`의 `initialValues` 구성: title, urls(기존 첨부 url들), memo, existingImagePaths(기존 이미지 첨부).
2. `onSubmit(values)`에서:
   - 신규 이미지 업로드, 삭제된 기존 이미지 반영.
   - `usePatchItem`으로 항목 갱신, 첨부(url/image) 동기화.
   - 성공 시 보기 모드로 복귀(또는 기존 동작 유지).
3. 상세 페이지의 **보기 모드, 공유, 삭제(확인 모달), 상태 3-세그먼트 토글**은 그대로 유지(폼만 교체).
4. 인라인으로 중복됐던 edit 폼 마크업/상태는 ItemForm 사용으로 대체하고, 그로 인해 **사용되지 않게 된** 로컬 상태/핸들러/마크업을 정리(고아 제거).

## 핵심 규칙 (회귀 금지)
- 수정 저장이 기존과 동등하게 동작해야 한다: 기존 이미지 삭제, 신규 이미지 추가, 다중 URL 편집이 실제 반영.
- 삭제(파괴적) 확인 모달, 상태 토글, 공유 동작을 제거·변경하지 마라.
- create/edit 모두 같은 `ItemForm`을 쓰되, 저장 오케스트레이션은 각 페이지가 담당(step 6 계약).

## Acceptance Criteria

```bash
npm run build
npm run test
```

빌드·테스트 통과. `ItemDetailPage.test.tsx`를 ItemForm 기준으로 갱신(제목 로드/수정 저장/삭제/상태토글 계약 유지). **작성→수정 왕복**(작성한 항목을 수정 화면에서 동일 폼으로 편집)이 회귀 없이 동작함을 테스트로 확인.

## 검증 절차
1. `npm run build && npm run test`
2. `npm run lint` — ItemForm 이전으로 생긴 미사용 import/상태 0건 확인.
3. 안티패턴 grep: `grep -nE "background-clip|backdrop-filter|border-left:" src/pages/ItemDetailPage.tsx src/components/items/ItemForm.tsx` → 0건
4. `phases/design-renewal-fix/feature_list.json`의 feat-11을 `passes: true`로.
5. `index.json` step 8 상태 갱신. 이 step 완료 시 task 전체 완료 → 미통과 feature가 없는지 확인.

## 금지사항
- 상세 보기/공유/삭제/상태토글 동작을 변경하지 마라. 이유: 범위는 edit 폼 통일.
- create 경로(step 7)를 다시 건드리지 마라. 이유: 이미 ItemForm 사용 중. 공용 컴포넌트만 공유.
- services/hooks 시그니처를 바꾸지 마라. 변경이 필요하면 멈추고 blocked로 표시.
