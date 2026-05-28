# design-renewal 진행 현황

## 마지막 업데이트
2026-05-28T08:10:28.073Z - Step 3/19 완료

## 완료된 작업
- Step 0: ui-guide-rewrite - docs/UI_GUIDE.md 전면 재작성 완료, 모노톤 토큰과 안티패턴 가드레일 포함
- Step 1: design-tokens - src/index.css 모노톤 CSS 변수와 Tailwind v4 @theme inline 갱신 완료, amber/terracotta 제거
- Step 2: atomic-ui-components - src/components/ui/ Button/IconButton/Chip/Card/Input/Textarea/Divider/Skeleton 구현 완료
- Step 3: layout-components - EmptyState/Toast/BottomSheet/TopAppBar/BottomNav 구현 완료, useToast hook과 toastStore 포함

## 현재 진행 중
- 없음

## 다음 할 일
- Step 4: font-loading을 진행한다.
- 시작 전 docs/UI_GUIDE.md의 폰트 조합(Pretendard, Geist, JetBrains Mono)과 현재 src/index.css의 --font-body/--font-mono 정의를 확인한다.
- 폰트 로딩만 다루고, 이번 step에서 만든 layout 컴포넌트나 기존 페이지 적용 작업은 건드리지 않는다.

## 주의사항
- Toast 전역 상태는 새 파일 src/stores/toastStore.ts에만 추가했다. 기존 src/stores/filterStore.ts는 수정하지 않았다.
- BottomNav는 src/components/ui/BottomNav.tsx에 있으며 Search 탭 없이 Home/New/Folders/Settings 4개만 렌더링한다.
- BottomSheet는 md:hidden, transform transition, bg-text-primary/20 overlay를 사용한다. backdrop-filter/blur는 사용하지 않았다.
- 검증 완료: npm run build, npm run test -- --run, rg "backdrop-filter|blur" src/components/ui, rg "border-radius.*[1-9][0-9]px" src/components/ui.
