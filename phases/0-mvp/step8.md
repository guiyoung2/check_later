# Step 8: item-detail-page

## 읽어야 할 파일

먼저 아래 파일들을 읽고 설계 의도와 현재 코드를 파악하라:

- `docs/ARCHITECTURE.md` — items 스키마, status enum 순서 (pending→reviewed→archived), Storage signed URL
- `docs/UI_GUIDE.md` — 상태 변경 전용 모달 금지 안티패턴, 컬러 토큰
- `src/types/index.ts` — Item, ItemType, ItemStatus, UpdateItemInput (step 0 산출물)
- `src/hooks/useItem.ts` — useItem 훅 (step 4 산출물)
- `src/hooks/usePatchItem.ts` — usePatchItem 훅 (step 4 산출물)
- `src/hooks/useDeleteItem.ts` — useDeleteItem 훅 (step 4 산출물)
- `src/services/storageService.ts` — getSignedUrl (step 3 산출물)

## 작업

### 1. `src/pages/ItemDetailPage.tsx` 완전 구현

```typescript
export default function ItemDetailPage(): JSX.Element
```

#### 데이터 로드

- `useParams()`로 id를 가져오고 `useItem(id)`로 데이터 조회
- 로딩 중: 간단한 로딩 표시
- 항목 없음(null): "항목을 찾을 수 없어요" + `/`로 돌아가는 링크

#### 표시 정보

- title, memo, url (클릭 가능한 링크), type, status, 저장일(created_at)
- 이미지(`image_path`가 있으면): `storageService.getSignedUrl(image_path)`로 signed URL을 가져와 `<img>` 표시

#### title/memo 인라인 편집

- title과 memo 필드를 클릭하면 입력 가능한 상태로 전환 (인라인 편집)
- 수정 후 저장 버튼 클릭 시 `usePatchItem` mutation 호출
- 저장 중에는 버튼 비활성화

#### 상태 변경 UI

모달 없이 인라인 버튼으로 구현한다 (UI_GUIDE.md 안티패턴 금지).

```
현재 상태: [안 봤음] → 클릭하면 [봤음]으로 변경
현재 상태: [봤음]   → 클릭하면 [보관]으로 변경
현재 상태: [보관]   → 클릭하면 [안 봤음]으로 변경 (순환)
```

또는 3개 상태 버튼을 모두 표시하고 현재 상태를 강조하는 방식도 허용.

상태 변경은 즉시 `usePatchItem` mutation으로 저장된다 (낙관적 업데이트 적용됨).

#### 삭제

- 삭제 버튼 클릭 시 window.confirm 또는 인라인 확인 UI로 한 번 확인
- `useDeleteItem` mutation 호출
- 성공 시 `/`로 이동

#### 레이아웃

- 상단: 뒤로가기 버튼 (`useNavigate(-1)`)
- 하단 또는 상단에 삭제 버튼 (destructive 스타일: 붉은 계열 대신 text-sub 색상의 조용한 버튼)

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm test        # 기존 테스트 통과
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. `phases/0-mvp/index.json`의 step 8을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "ItemDetailPage 구현: 항목 표시, 인라인 편집(title/memo), 상태 변경(인라인 버튼), 이미지 signed URL, 삭제"`
   - 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`

## 금지사항

- 상태 변경을 전용 모달로 구현하지 마라. 이유: UI_GUIDE.md AI Slop 안티패턴 — "상태 변경 전용 모달: 인라인 액션 or 바텀 시트".
- `storageService.getSignedUrl()`에서 에러 시 페이지 전체를 오류 처리하지 마라. 이미지는 보조 정보이므로 조용히 숨기면 된다.
- title 편집 시 빈 문자열 저장을 허용하지 마라. title은 필수 필드다.
- 기존 테스트를 깨뜨리지 마라.
