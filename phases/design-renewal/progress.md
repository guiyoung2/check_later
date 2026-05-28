# design-renewal 진행 현황

## 마지막 업데이트
2026-05-28T17:04:29+09:00 - Step 2/19 완료

## 완료된 작업
- Step 0: ui-guide-rewrite - docs/UI_GUIDE.md 전면 재작성 완료, 모노톤 토큰과 안티패턴 가드레일 포함
- Step 1: design-tokens - src/index.css 모노톤 CSS 변수와 Tailwind v4 @theme inline 갱신 완료, amber/terracotta 제거
- Step 2: atomic-ui-components - src/components/ui/ 아래 Button, IconButton, Chip, Card, Input, Textarea, Divider, Skeleton 구현 완료

## 현재 진행 중
- Step 3: layout-components

## 다음 할 일
- Step 3에서는 layout 계층 컴포넌트만 구현한다. Step 2에서 만든 `src/components/ui/` 원자 컴포넌트를 재사용하되 기존 도메인 컴포넌트와 페이지는 아직 수정하지 않는다.
- Step 3 시작 전 `docs/UI_GUIDE.md`, `fix3_design.md`, `src/components/ui/*`를 확인하고 hover/active/focus/disabled 상태와 44px 터치 타깃 규칙을 유지한다.

## 주의사항
- Step 2는 `src/components/ui/`에 8개 파일만 추가했다. 별도 barrel export 파일은 만들지 않았다.
- 새 테스트는 `src/components/ui/AtomicComponents.test.tsx`에 있으며, 원자 컴포넌트의 공개 API와 주요 토큰 클래스를 검증한다.
- `Chip`은 `onClick`이 있을 때만 button으로 렌더링된다. 이후 필터 UI에서 클릭 가능한 chip으로 사용할 경우 `onClick`을 반드시 전달한다.
- `Card`는 `as="a"`와 `href` 조합으로 링크 카드를 만들 수 있다. 이후 카드 전체 클릭 이동을 구현할 때 키보드 접근성을 위해 가능하면 anchor 렌더링을 우선한다.
- 안티패턴 grep 결과 `border-left`, `backdrop-filter`, `background-clip`, `#000|#fff`는 `src/components/ui/`에서 0건이다.
