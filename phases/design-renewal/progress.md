# design-renewal 진행 현황

## 마지막 업데이트
2026-05-29T00:15:16+0900 — Step 10/19 완료

## 완료된 작업
- Step 0: ui-guide-rewrite — docs/UI_GUIDE.md 전면 재작성 완료 — 모노톤 토큰 + 안티패턴 가드레일 포함
- Step 1: design-tokens — src/index.css 모노톤 CSS 변수 + Tailwind v4 @theme inline 갱신 완료, amber/terracotta 제거
- Step 2: atomic-ui-components — src/components/ui/ 신설 — Button/IconButton/Chip/Card/Input/Textarea/Divider/Skeleton 8개 구현 완료
- Step 3: layout-components — EmptyState/Toast/BottomSheet/TopAppBar/BottomNav 구현 완료, useToast hook 포함
- Step 4: font-loading — Pretendard/Geist/JetBrains Mono ?? ?? ??, font-display:swap ??
- Step 5: home-page-renewal — HomePage 리뉴얼 — TopAppBar/FilterBar/BottomNav 적용, 3가지 상태(로딩/빈/에러) 처리 완료
- Step 6: type-variant-cards — MemoCard/VideoCard/ImageCard/ArticleCard 4변형 구현, ItemCard type dispatch 완료
- Step 7: new-item-page-renewal — NewItemPage 리뉴얼 — BottomSheet 스타일, 3-grid chip, URL 자동 감지, Web Share Target 회귀 테스트 통과
- Step 8: item-detail-page-renewal — ItemDetailPage 리뉴얼 — sticky 헤더, type별 헤드, status 3-segment, blockquote 제거, ConfirmDialog 추가
- Step 9: mobile-gestures — 스와이프 status 토글, 길게 누르기 BottomSheet, 데스크탑 hover 메뉴 구현 완료

## 현재 진행 중
- Step 10: folders-page

## 다음 할 일
- Step 10: Folders 페이지 구현
  - `phases/design-renewal/step10.md`, `fix3_design.md` §4.4, `docs/PRD.md`를 먼저 읽는다.
  - `src/pages/FoldersPage.tsx`를 신설하고 `/folders` 라우트를 `ProtectedRoute`로 등록한다.
  - 기존 `useItems` 데이터를 집계해 type/status 카운트 카드를 만들고, 클릭 시 `/?type=...` 또는 `/?status=...`로 이동시킨다.
  - Step 10 금지사항에 따라 새 폴더 생성, Search, 태그 UI는 추가하지 않는다.

## 주의사항
- **ItemCard 제스처 wrapper**: `src/components/ItemCard.tsx`에서 모든 type 카드 변형을 감싸며 `usePatchItem`, `useDeleteItem`, `useToast`를 사용한다. ItemCard를 단독 렌더하는 테스트는 QueryClientProvider를 쓰거나 이 훅들을 mock해야 한다.
- **스와이프 threshold**: 좌→우 touch delta 80px 이상에서만 status가 `pending → reviewed → archived → pending` 순환한다. 시각 피드백은 wrapper `transform: translateX(...)`만 사용한다.
- **길게 누르기**: pointerdown 후 500ms에 BottomSheet가 열린다. 버튼/링크에서 시작한 pointerdown은 long press 대상에서 제외한다.
- **수정 메뉴 진입**: 카드 메뉴/BottomSheet의 수정은 `/items/:id?edit=1`로 이동한다. `ItemDetailPage`는 `edit=1` 쿼리 진입 시 편집 폼을 연다.
- **닫힌 카드 BottomSheet**: 접근성/테스트 중복을 피하기 위해 ItemCard의 BottomSheet는 `sheetOpen`일 때만 렌더한다. 공용 `BottomSheet` 컴포넌트 자체의 mounted 동작은 변경하지 않았다.
- **ItemDetailPage 삭제 토스트**: `showToast({ message: '삭제됨', undo: { label: '되돌리기', ... }, duration: 4000 })` 형태를 테스트로 고정함. 실제 복구 API는 없으므로 서비스 계층을 바꾸지 않는 한 undo는 UI 액션 수준에 머문다.
- **ItemDetailPage 테스트**: 헤더 버튼 순서가 아니라 aria label(`수정`, `항목 삭제`) 기준으로 클릭해야 함. Step 8에서 `공유` 버튼이 추가되어 순서 기반 테스트는 깨진다.
- **video duration 데이터 없음**: items 스키마에 duration 필드가 없어 상세 video 헤드의 우하단 badge는 현재 정적 label-mono 배지로 구현됨.
- **ToastProvider가 App.tsx에 추가됨**: Routes를 ToastProvider로 감쌌음. 이로써 라우트 이동 후에도 Toast가 표시됨. 향후 App.tsx 수정 시 이 래퍼를 유지해야 함.
- **NewItemPage 단일 textarea 구조**: 기존의 분리된 title/URL/memo 입력 대신 단일 textarea로 통합. URL 입력 → OG title 자동 fetch, 텍스트 입력 → memo+title 모두 동일 값. 다중 URL 기능 제거됨.
- **Web Share Target 파라미터 우선순위**: `sharedUrl || sharedText || sharedTitle` 순서로 textarea 초기값 결정. URL이 있으면 URL이 textarea를 채움.
- **ItemCard dispatch 후 HomePage 테스트 수정**: `link` role 단언을 `getByText('읽을 글')` 로 교체함. 구 ItemCard가 `<Link>` 직접 렌더 → 신규 카드는 article+onClick 구조이기 때문.
- **useSignedUrl 훅**: `src/components/items/useSignedUrl.ts`에 위치. `src/hooks/*` 폴더가 아니므로 기존 hooks 수정 규칙에 위배되지 않음.
- **Card overflow-hidden**: VideoCard, ImageCard는 이미지가 카드 상단에 붙으므로 `<Card className="overflow-hidden">` 필수.
- dev 서버: 5173 포트 사용 중이면 5174 포트로 자동 이동.
