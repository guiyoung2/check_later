# 1-ux-stabilization 진행 현황

## 마지막 업데이트
2026-05-27T18:07:20+0900 — Step 3/5 완료

## 완료된 작업
- Step 0: routing-deploy — SPA fallback 배포 설정 추가로 /login 등 직접 진입 404 대응
- Step 1: theme-system — useTheme와 ThemeToggleButton 추가, 홈 다크모드 토글을 아이콘 버튼으로 변경
- Step 2: auth-navigation — SettingsPage 로그아웃 후 / 랜딩 이동 적용, ProtectedRoute 정책 유지

## 현재 진행 중
- Step 3: home-actions

## 다음 할 일
- Step 3: home-actions 진행
- 시작 전 `src/pages/HomePage.tsx`와 홈 관련 테스트를 확인
- 새 항목 생성 액션 위치와 설정/로그아웃 중복 정리 범위를 step 3 지시사항 안에서만 판단

## 주의사항
- `BrowserRouter`와 `vite.config.ts`의 `share_target.action: '/new'`는 유지됨
- 루트 `vercel.json`은 모든 클라이언트 라우트를 `/`로 rewrite하므로 `/login`만 별도 처리하지 말 것
- `useTheme`는 별도 전역 이벤트 구독 없이 `html.dark` 초기값과 수동 토글만 다룸
- 테마 토글의 접근 가능한 이름은 `다크 모드로 전환` / `라이트 모드로 전환`으로 유지됨
- `ProtectedRoute`는 비인증 보호 라우트를 계속 `/login`으로 보냄. 로그아웃 완료 후 이동만 `SettingsPage`에서 `/`로 처리함
- `SettingsPage.test.tsx`는 `window.matchMedia`를 테스트 내부에서 mock 처리함
