# Step 2: auth

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 현재 코드를 파악하라:

- `docs/ARCHITECTURE.md` — 인증 패턴 (Supabase Auth, Google OAuth)
- `docs/UI_GUIDE.md` — 디자인 원칙, 컬러 토큰
- `src/lib/supabase.ts` — Supabase 클라이언트 (step 0 산출물)
- `src/types/index.ts` — 도메인 타입 (step 0 산출물)
- `src/App.tsx` — 현재 라우팅 구조 (step 0 산출물)
- `src/main.tsx` — QueryClientProvider 래핑 구조 확인
- `src/index.css` — 사용 가능한 Tailwind 컬러 토큰 확인

## 작업

### 1. `src/lib/auth.tsx` 생성 — AuthProvider + useAuth

Supabase `onAuthStateChange`를 구독하는 AuthProvider와 useAuth 훅을 구현하라.

```typescript
// AuthContext 타입
interface AuthContextType {
  session: import('@supabase/supabase-js').Session | null;
  user: import('@supabase/supabase-js').User | null;
  loading: boolean;
}

// export할 것
export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element
export function useAuth(): AuthContextType
```

구현 규칙:
- `supabase.auth.getSession()`으로 초기 세션을 가져온다.
- `supabase.auth.onAuthStateChange`로 세션 변경을 구독한다.
- `loading`은 초기 세션 로드가 완료되기 전까지 `true`다.
- `onAuthStateChange` 구독은 컴포넌트 unmount 시 반드시 해제한다.

### 2. `src/pages/LoginPage.tsx` 완전 구현

Google OAuth 로그인 버튼이 있는 페이지다.

```typescript
// 핵심 동작
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/`,
  },
})
```

디자인 규칙 (UI_GUIDE.md 기준):
- 배경: `bg-[--color-bg]`
- 버튼: accent 배경 (`bg-[--color-accent]`), 흰 텍스트, border-radius 8px
- 앱 이름과 간단한 설명 문구를 포함하라
- 순백색 배경, 파란 계열 액센트, 그라디언트는 사용하지 마라

이미 인증된 사용자가 `/login`에 접근하면 `/`로 리다이렉트한다.

### 3. `src/components/ProtectedRoute.tsx` 완전 구현

Step 0의 placeholder를 실제 인증 체크 로직으로 교체하라.

```typescript
// 동작
// - loading 중: 로딩 스피너 또는 빈 화면 표시
// - 미인증: /login으로 리다이렉트
// - 인증됨: <Outlet /> 렌더링
// 로그인 성공 후 복귀 경로는 / 고정 (redirectTo: window.location.origin + '/')
```

### 4. `src/main.tsx`에 AuthProvider 추가

QueryClientProvider 안쪽에 AuthProvider를 래핑하라.

```typescript
// 래핑 순서
<StrictMode>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
</StrictMode>
```

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm test        # 기존 테스트 통과
```

브라우저 수동 확인 (빌드 후):
- `/login` 접근 시 Google 로그인 버튼이 보임
- 로그인 성공 후 `/`로 리다이렉트됨
- 새로고침 시 로그인 상태 유지됨
- 비인증 상태에서 `/` 접근 시 `/login`으로 리다이렉트됨

## 검증 절차

1. `npm run build && npm test` 실행
2. `phases/0-mvp/index.json`의 step 2를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "AuthProvider(src/lib/auth.tsx) + LoginPage(Google OAuth) + ProtectedRoute 구현, main.tsx에 AuthProvider 래핑 추가"`
   - 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`

## 금지사항

- `src/main.tsx`의 QueryClient 설정을 수정하지 마라.
- `src/index.css`의 디자인 토큰을 수정하지 마라.
- 이메일/비밀번호 로그인을 추가하지 마라. ADR-002에 따라 Google OAuth만 지원한다.
- 로그인 페이지에 파란 계열 액센트를 사용하지 마라. UI_GUIDE.md의 AI Slop 안티패턴이다.
- useAuth를 호출하는 컴포넌트가 AuthProvider 외부에 있으면 에러가 난다. AuthProvider 위치를 올바르게 설정하라.
