# design-renewal 진행 현황

## 마지막 업데이트
2026-05-28T17:24:52+09:00 기준 Step 5/19 완료

## 완료된 작업
- Step 0: ui-guide-rewrite — docs/UI_GUIDE.md 전면 재작성 완료, 모노톤 토큰 + 안티패턴 가드레일 포함
- Step 1: design-tokens — src/index.css 모노톤 CSS 변수 + Tailwind v4 @theme inline 갱신 완료, amber/terracotta 제거
- Step 2: atomic-ui-components — src/components/ui/ 신설, Button/IconButton/Chip/Card/Input/Textarea/Divider/Skeleton 8개 구현 완료
- Step 3: layout-components — EmptyState/Toast/BottomSheet/TopAppBar/BottomNav 구현 완료, useToast hook 포함
- Step 4: font-loading — Pretendard/Geist/JetBrains Mono self-host 로딩 및 font-display: swap 적용 완료
- Step 5: home-page-renewal — HomePage에 TopAppBar, sticky FilterBar, BottomNav를 적용하고 로딩/빈/에러 상태 처리를 리뉴얼

## 현재 진행 중
- Step 6: type-variant-cards

## 다음 할 일
- Step 6에서는 기존 ItemCard를 type별 변형 카드(MemoCard/VideoCard/ImageCard/ArticleCard)로 분리하거나 dispatch하도록 구현한다.
- Step 5에서 HomePage는 계속 기존 ItemCard를 사용하므로, Step 6 시작 전에 `src/components/ItemCard.tsx`와 관련 테스트를 먼저 확인한다.
- 카드 간격은 HomePage에서 이미 `gap-6`으로 적용되어 있으므로 Step 6은 카드 내부 구조와 타입별 표시만 다룬다.

## 주의사항
- HomePage 리뉴얼은 `src/hooks/*`, `src/stores/*` 로직을 변경하지 않고 기존 `useItems`와 `filterStore.reset`만 사용했다.
- FilterBar 상태 라벨은 step 명세에 맞춰 `안봤음`으로 표시한다. 기존 일부 화면에는 `안 봤음` 표기가 남아 있을 수 있으나 Step 5 범위 밖이다.
- dev 서버는 5173 포트가 사용 중이라 검증 중 5174 포트를 사용했다.
