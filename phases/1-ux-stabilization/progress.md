# 1-ux-stabilization 진행 현황

## 마지막 업데이트
2026-05-27T18:04:16+0900 — Step 2/5 완료

## 완료된 작업
- Step 0: routing-deploy — SPA fallback 배포 설정 추가로 /login 등 직접 진입 404 대응
- Step 1: theme-system — useTheme와 ThemeToggleButton 추가, 홈 다크모드 토글을 아이콘 버튼으로 변경

## 현재 진행 중
- Step 2: auth-navigation

## 다음 할 일
- Step 2: auth-navigation 진행
- 시작 전 인증 라우팅 흐름과 로그아웃 후 이동 경로를 확인
- 랜딩 페이지에서 `ThemeToggleButton`을 재사용해야 하면 `src/components/ThemeToggleButton.tsx`와 `src/hooks/useTheme.ts`를 먼저 확인

## 주의사항
- `BrowserRouter`와 `vite.config.ts`의 `share_target.action: '/new'`는 유지됨
- 루트 `vercel.json`은 모든 클라이언트 라우트를 `/`로 rewrite하므로 `/login`만 별도 처리하지 말 것
- `useTheme`는 별도 전역 이벤트 구독 없이 `html.dark` 초기값과 수동 토글만 다룸
- 테마 토글의 접근 가능한 이름은 `다크 모드로 전환` / `라이트 모드로 전환`으로 유지됨
