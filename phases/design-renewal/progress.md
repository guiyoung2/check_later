# design-renewal 진행 현황

## 마지막 업데이트
2026-05-28T17:01:21+0900 — Step 2/19 완료

## 완료된 작업
- Step 0: ui-guide-rewrite — docs/UI_GUIDE.md 전면 재작성 완료 — 모노톤 토큰 + 안티패턴 가드레일 포함
- Step 1: design-tokens — src/index.css 모노톤 CSS 변수 + Tailwind v4 @theme inline 갱신 완료, amber/terracotta 제거

## 현재 진행 중
- Step 2: atomic-ui-components

## 다음 할 일
- Step 2: atomic-ui-components. `src/components/ui/` 하위 원자 컴포넌트를 설계하고, 새 Tailwind 토큰(`bg`, `surface`, `surface-sub`, `border`, `text-*`, `radius-*`, `shadow-*`)만 사용한다.
- Step 2 시작 전 기존 컴포넌트 사용처와 테스트 구조를 확인한다.

## 주의사항
- `fix3_design.md` §5 원문에는 금지 색상 예시가 포함되어 있으나, Step 0 AC의 `amber|terracotta` 0건 검증과 충돌하여 `docs/UI_GUIDE.md`에는 특정 색상명 대신 chromatic accent로 일반화했다.
- `src/index.css`는 시스템 `prefers-color-scheme: dark`만 사용한다. 이전 `.dark` 클래스 기반 `--app-color-*` 토큰은 제거됐다.
- `--surface: #FFFFFF`는 step 지시와 fix3_design.md §2 지정값이라 유지했다. `#fff` 약식 표기는 사용하지 않았다.
