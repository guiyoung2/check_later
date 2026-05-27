# 1-ux-stabilization 진행 현황

## 마지막 업데이트
2026-05-27T18:10:24+0900 — Step 4/5 완료

## 완료된 작업
- Step 0: routing-deploy — SPA fallback 배포 설정 추가로 /login 등 직접 진입 404 대응
- Step 1: theme-system — useTheme와 ThemeToggleButton 추가, 홈 다크모드 토글을 아이콘 버튼으로 변경
- Step 2: auth-navigation — SettingsPage 로그아웃 후 / 랜딩 이동 적용, ProtectedRoute 정책 유지
- Step 3: home-actions — 홈 헤더 중복 로그아웃 제거, 새 항목 추가 액션을 목록 영역으로 이동

## 현재 진행 중
- Step 4: landing-mobile-polish

## 다음 할 일
- Step 4: landing-mobile-polish 진행
- 시작 전 `src/pages/LandingPage.tsx`, 랜딩 관련 테스트, `docs/UI_GUIDE.md`를 확인
- 랜딩 모바일 화면에서 텍스트와 액션이 겹치지 않는지 확인하고, Step 4 지시사항 범위 밖의 홈/설정 동작은 건드리지 말 것

## 주의사항
- `BrowserRouter`와 `vite.config.ts`의 `share_target.action: '/new'`는 유지됨
- 루트 `vercel.json`은 모든 클라이언트 라우트를 `/`로 rewrite하므로 `/login`만 별도 처리하지 말 것
- `useTheme`는 별도 전역 이벤트 구독 없이 `html.dark` 초기값과 수동 토글만 다룸
- 테마 토글의 접근 가능한 이름은 `다크 모드로 전환` / `라이트 모드로 전환`으로 유지됨
- `ProtectedRoute`는 비인증 보호 라우트를 계속 `/login`으로 보냄. 로그아웃 완료 후 이동만 `SettingsPage`에서 `/`로 처리함
- `SettingsPage.test.tsx`는 `window.matchMedia`를 테스트 내부에서 mock 처리함
- 홈 헤더 액션은 `ThemeToggleButton`과 설정 링크만 남김. 로그아웃은 `SettingsPage`의 계정 섹션에서 처리함
- 홈의 `새 항목 추가` 링크는 `FilterBar` 아래 `main` 최상단에 있으며, 빈 상태 CTA `첫 항목 저장하기`도 별도로 유지됨
