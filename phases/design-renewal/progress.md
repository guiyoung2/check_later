# design-renewal 진행 현황

## 마지막 업데이트
2026-05-29T00:05:02+0900 — Step 8/19 완료

## 완료된 작업
- Step 0: ui-guide-rewrite — docs/UI_GUIDE.md 전면 재작성 완료 — 모노톤 토큰 + 안티패턴 가드레일 포함
- Step 1: design-tokens — src/index.css 모노톤 CSS 변수 + Tailwind v4 @theme inline 갱신 완료, amber/terracotta 제거
- Step 2: atomic-ui-components — src/components/ui/ 신설 — Button/IconButton/Chip/Card/Input/Textarea/Divider/Skeleton 8개 구현 완료
- Step 3: layout-components — EmptyState/Toast/BottomSheet/TopAppBar/BottomNav 구현 완료, useToast hook 포함
- Step 4: font-loading — Pretendard/Geist/JetBrains Mono ?? ?? ??, font-display:swap ??
- Step 5: home-page-renewal — HomePage 리뉴얼 — TopAppBar/FilterBar/BottomNav 적용, 3가지 상태(로딩/빈/에러) 처리 완료
- Step 6: type-variant-cards — MemoCard/VideoCard/ImageCard/ArticleCard 4변형 구현, ItemCard type dispatch 완료
- Step 7: new-item-page-renewal — NewItemPage 리뉴얼 — BottomSheet 스타일, 3-grid chip, URL 자동 감지, Web Share Target 회귀 테스트 통과
- Step 8: item-detail-page-renewal — ItemDetailPage 리뉴얼: sticky 헤더, share/edit/delete, type별 헤드, status 3-segment, ConfirmDialog + undo toast 테스트 완료

## 현재 진행 중
- Step 9: mobile-gestures

## 다음 할 일
- Step 9: 카드 인터랙션 구현
  - `fix3_design.md` §4.1과 `phases/design-renewal/step9.md`를 먼저 읽는다.
  - 카드 좌→우 스와이프 threshold 80px 이상에서 status 순환 + undo toast를 구현한다.
  - 모바일 500ms long press BottomSheet와 데스크탑 hover 메뉴를 구현한다.
  - 삭제 액션은 Step 8의 ConfirmDialog 흐름을 재사용한다.

## 주의사항
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
