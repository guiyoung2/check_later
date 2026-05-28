# design-renewal 진행 현황

## 마지막 업데이트
2026-05-28T16:57:20+09:00 — Step 0/19 완료

## 완료된 작업
- Step 0: docs/UI_GUIDE.md 전면 재작성 완료. 순수 모노톤 컬러 토큰, 타이포그래피, spacing/radius, shadow/motion, 안티패턴 가드레일을 문서화함.

## 현재 진행 중
- 없음

## 다음 할 일
- Step 1: design-tokens. docs/UI_GUIDE.md의 모노톤 토큰을 기준으로 `src/index.css`와 Tailwind v4 `@theme inline` 토큰을 갱신한다.
- `docs/UI_GUIDE.md`의 금지 사항에 따라 chromatic accent 토큰과 `#000`/`#fff` 직접 사용을 추가하지 않는다.

## 주의사항
- `fix3_design.md` §5 원문에는 금지 색상 예시가 포함되어 있으나, Step 0 AC의 `amber|terracotta` 0건 검증과 충돌하여 `docs/UI_GUIDE.md`에는 특정 색상명 대신 chromatic accent로 일반화했다.
- 이번 step은 문서만 갱신했다. PRD, ARCHITECTURE, 런타임 CSS 토큰은 변경하지 않았다.
