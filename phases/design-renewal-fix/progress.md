# design-renewal-fix 진행 현황

## 마지막 업데이트
2026-05-29T11:18:00+0900 — Step 2/9 완료

## 완료된 작업
- Step 0: landing-redesign — LandingPage: 헤더 우상단 Login 버튼 추가, 히어로 2칼럼(텍스트+MiniPreview 목업), 카피 교체, 테스트 갱신. 빌드·68 테스트 통과.
- Step 1: login-copy — LoginPage: '로그인 / 회원가입' 문단 제거(Google OAuth 단일 반영). 동작 무변경. 빌드·68 테스트 통과.

## 현재 진행 중
- Step 2: home-header-theme

## 다음 할 일
- `src/pages/HomePage.tsx` 또는 `src/components/TopAppBar.tsx` 에서 홈 헤더 rightAction에 테마 토글 버튼 추가
- 계정 아이콘 왼쪽에 배치
- LandingPage와 동일한 `ThemeToggleButton` 컴포넌트 재사용

## 주의사항
- step 0에서 `MiniPreview`가 `LandingPage.tsx` 내부 함수로 정의됨 (별도 파일 아님). 외부 재사용 불필요.
- `ThemeToggleButton`은 `useState(isDarkActive)` 초기값에 `isDarkActive`(함수 레퍼런스)를 사용하므로 테스트 환경에서 초기값이 false로 잡힌다. ThemeToggleButton 관련 테스트 시 주의.
- 헤더 Login 버튼은 `variant="ghost" size="sm"` 사용. 접근성 name은 "Login"(children 텍스트).
