# design-renewal 진행 현황

## 마지막 업데이트
2026-05-28T17:18:28+0900 — Step 5/19 완료

## 완료된 작업
- Step 0: ui-guide-rewrite — docs/UI_GUIDE.md 전면 재작성 완료 — 모노톤 토큰 + 안티패턴 가드레일 포함
- Step 1: design-tokens — src/index.css 모노톤 CSS 변수 + Tailwind v4 @theme inline 갱신 완료, amber/terracotta 제거
- Step 2: atomic-ui-components — src/components/ui/ 신설 — Button/IconButton/Chip/Card/Input/Textarea/Divider/Skeleton 8개 구현 완료
- Step 3: layout-components — EmptyState/Toast/BottomSheet/TopAppBar/BottomNav 구현 완료, useToast hook 포함
- Step 4: font-loading — Pretendard/Geist/JetBrains Mono ?? ?? ??, font-display:swap ??

## 현재 진행 중
- Step 5: home-page-renewal

## 다음 할 일
- Step 5에서는 HomePage에 TopAppBar, sticky FilterBar, 타입별 카드 피드 레이아웃, BottomNav 조합을 적용한다.
- 시작 전에 기존 페이지/라우팅 구조와 Step 2~4에서 만든 ui 컴포넌트 및 폰트 토큰을 확인한다.
- 이 step에서 만든 폰트 경로(`/fonts/pretendard/*`, `/fonts/geist/*`, `/fonts/jetbrains-mono/*`)와 `--font-body`/`--font-mono` fallback 순서를 유지한다.

## 주의사항
- `public/`에는 기존 Pretendard 파일이 없었으므로 `public/fonts/` 아래에 세 폰트를 self-host asset으로 추가했다.
- `index.html`은 Pretendard 400, Geist 400만 preload한다. JetBrains Mono는 label-mono 소량 사용이라 preload하지 않는다.
- 모든 `@font-face`에는 `font-display: swap`이 필요하다. FOIT 방지를 위해 제거하지 않는다.
- Google Fonts CDN은 사용하지 않는다. 이유: step 4 금지사항 및 privacy/GDPR 우려.
