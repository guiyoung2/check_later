# Step 2: auth-navigation

## 읽어야 할 파일

먼저 아래 파일들을 읽고 인증 흐름과 이전 step 산출물을 파악하라:

- `docs/ARCHITECTURE.md` — `/`, `/login`, `/settings` 라우트 의도
- `src/App.tsx` — RootPage와 ProtectedRoute 구성
- `src/components/ProtectedRoute.tsx` — 비인증 보호 라우트 처리
- `src/lib/auth.tsx` — Supabase Auth 상태 구독
- `src/pages/SettingsPage.tsx` — 현재 로그아웃 처리
- `src/pages/LoginPage.tsx` — 로그인 성공 후 이동
- `src/hooks/useTheme.ts` — step 1 산출물
- `src/components/ThemeToggleButton.tsx` — step 1 산출물

## 작업

### 1. 로그아웃 후 랜딩으로 이동

`SettingsPage`의 로그아웃 처리에서 `await supabase.auth.signOut()` 이후 `navigate('/', { replace: true })`를 호출하라. 로그아웃 후 루트 경로는 `RootPage`가 비인증 상태를 감지하여 `LandingPage`를 보여준다.

구현 의도:

```typescript
async function handleSignOut() {
  await supabase.auth.signOut();
  navigate('/', { replace: true });
}
```

### 2. ProtectedRoute 정책 유지

`ProtectedRoute`의 비인증 사용자를 `/login`으로 보내는 정책은 유지하라. 이유: 사용자가 `/new`, `/items/:id`, `/settings` 같은 보호 화면에 직접 접근한 경우 로그인 화면이 맞다. 로그아웃 완료 후 랜딩으로 보내는 UX와 보호 라우트 접근 시 로그인으로 보내는 정책은 서로 다른 상황이다.

### 3. 테스트 추가 또는 갱신

필요하면 `SettingsPage` 테스트를 추가하여 로그아웃 버튼 클릭 시 `supabase.auth.signOut`이 호출되고 `/`로 이동하는지 확인하라. 기존 테스트 구조를 참고하고, 과도한 라우팅 테스트 유틸은 만들지 마라.

## Acceptance Criteria

```bash
npm run build
npm test
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 로그아웃 후 기대 경로가 `/`인지 테스트 또는 코드로 확인한다.
3. 비인증 보호 라우트 접근 시 `/login` 리다이렉트 정책이 유지되는지 확인한다.
4. `phases/1-ux-stabilization/index.json`의 step 2를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "SettingsPage 로그아웃 후 / 랜딩 이동 적용, ProtectedRoute 정책 유지"`
   - 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
5. `phases/1-ux-stabilization/feature_list.json`에서 `feat-2`를 통과 처리한다.
6. `phases/1-ux-stabilization/progress.md`의 다음 할 일과 주의사항을 갱신한다.

## 금지사항

- `ProtectedRoute`를 `/`로 리다이렉트하도록 바꾸지 마라. 이유: 보호 화면 접근자는 로그인 의도가 명확하다.
- AuthProvider에서 직접 navigate를 호출하지 마라. 이유: Provider가 router 의존성을 갖게 되고 인증 상태 관리 책임을 벗어난다.
- 로그아웃 실패를 무시하고 먼저 이동하지 마라. 이유: 실제 세션이 남아 있으면 루트가 다시 HomePage를 보여줄 수 있다.
- 기존 테스트를 깨뜨리지 마라.
