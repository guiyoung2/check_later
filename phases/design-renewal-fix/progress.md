# design-renewal-fix 진행 현황

## 마지막 업데이트
2026-05-29T11:19:55+0900 — Step 3/9 완료

## 완료된 작업
- Step 0: landing-redesign — LandingPage: 헤더 우상단 Login 버튼 추가, 히어로 2칼럼(텍스트+MiniPreview 목업), 카피 교체, 테스트 갱신. 빌드·68 테스트 통과.
- Step 1: login-copy — LoginPage: '로그인 / 회원가입' 문단 제거(Google OAuth 단일 반영). 동작 무변경. 빌드·68 테스트 통과.
- Step 2: home-header-theme — HomePage TopAppBar rightAction에 ThemeToggleButton 추가(계정 아이콘 왼쪽). 빌드·68 테스트 통과.

## 현재 진행 중
- Step 3: settings-remove-theme

## 다음 할 일
- `src/pages/SettingsPage.tsx`에서 THEME 섹션(ThemeToggleButton + label)과 관련 state/effect 제거
- THEME 섹션과 관련된 테스트도 정리

## 주의사항
- step 0에서 `MiniPreview`가 `LandingPage.tsx` 내부 함수로 정의됨 (별도 파일 아님). 외부 재사용 불필요.
- `ThemeToggleButton`은 `useState(isDarkActive)` 초기값에 `isDarkActive`(함수 레퍼런스)를 사용하므로 테스트 환경에서 초기값이 false로 잡힌다. ThemeToggleButton 관련 테스트 시 주의.
- 헤더 Login 버튼은 `variant="ghost" size="sm"` 사용. 접근성 name은 "Login"(children 텍스트).
- HomePage에서 `rightAction`을 `<div className="flex items-center">` 래퍼로 묶어 두 컨트롤을 가로 배치했다.
