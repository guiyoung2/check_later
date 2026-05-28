# design-renewal 진행 현황

## 마지막 업데이트
2026-05-28T23:40:00+0900 — Step 8/19 준비

## 완료된 작업
- Step 0: ui-guide-rewrite — docs/UI_GUIDE.md 전면 재작성 완료 — 모노톤 토큰 + 안티패턴 가드레일 포함
- Step 1: design-tokens — src/index.css 모노톤 CSS 변수 + Tailwind v4 @theme inline 갱신 완료, amber/terracotta 제거
- Step 2: atomic-ui-components — src/components/ui/ 신설 — Button/IconButton/Chip/Card/Input/Textarea/Divider/Skeleton 8개 구현 완료
- Step 3: layout-components — EmptyState/Toast/BottomSheet/TopAppBar/BottomNav 구현 완료, useToast hook 포함
- Step 4: font-loading — Pretendard/Geist/JetBrains Mono 폰트 로딩 완료, font-display:swap 적용
- Step 5: home-page-renewal — HomePage 리뉴얼 — TopAppBar/FilterBar/BottomNav 적용, 3가지 상태(로딩/빈/에러) 처리 완료
- Step 6: type-variant-cards — MemoCard/VideoCard/ImageCard/ArticleCard 4변형 구현, ItemCard type dispatch 완료
- Step 7: new-item-page-renewal — NewItemPage 리뉴얼 — BottomSheet 스타일, 3-grid chip, URL 자동 감지, Web Share Target 회귀 테스트 통과

## 현재 진행 중
- Step 8: item-detail-page-renewal

## 다음 할 일
- Step 8: `/items/:id` 페이지 리뉴얼
  - sticky 헤더: 뒤로가기 / share·edit·delete 아이콘
  - type별 헤드 영역 (Video: aspect-video + play overlay, Image: full-width, Article/Memo: 없음)
  - 메타 라인: type chip + 저장 날짜 + status
  - title (display 32)
  - URL 링크 (있으면 mono font)
  - divider
  - 메모 섹션 (bg-surface 카드, blockquote 없이 단순 p/ul)
  - status 3-segment toggle (안봤음/봤음/보관)
  - 삭제: ConfirmDialog → Toast "삭제됨 · 되돌리기" + Home 이동

## 주의사항
- **ToastProvider가 App.tsx에 추가됨**: Routes를 ToastProvider로 감쌌음. 이로써 라우트 이동 후에도 Toast가 표시됨. 향후 App.tsx 수정 시 이 래퍼를 유지해야 함.
- **NewItemPage 단일 textarea 구조**: 기존의 분리된 title/URL/memo 입력 대신 단일 textarea로 통합. URL 입력 → OG title 자동 fetch, 텍스트 입력 → memo+title 모두 동일 값. 다중 URL 기능 제거됨.
- **Web Share Target 파라미터 우선순위**: `sharedUrl || sharedText || sharedTitle` 순서로 textarea 초기값 결정. URL이 있으면 URL이 textarea를 채움.
- **ItemCard dispatch 후 HomePage 테스트 수정**: `link` role 단언을 `getByText('읽을 글')` 로 교체함. 구 ItemCard가 `<Link>` 직접 렌더 → 신규 카드는 article+onClick 구조이기 때문.
- **useSignedUrl 훅**: `src/components/items/useSignedUrl.ts`에 위치. `src/hooks/*` 폴더가 아니므로 기존 hooks 수정 규칙에 위배되지 않음.
- **Card overflow-hidden**: VideoCard, ImageCard는 이미지가 카드 상단에 붙으므로 `<Card className="overflow-hidden">` 필수.
- dev 서버: 5173 포트 사용 중이면 5174 포트로 자동 이동.
