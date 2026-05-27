# Step 9: settings-page

## 읽어야 할 파일

먼저 아래 파일들을 읽고 설계 의도와 현재 코드를 파악하라:

- `docs/PRD.md` — 설정 화면 기능 목록 (로그아웃, PWA 설치 안내)
- `docs/UI_GUIDE.md` — 컬러 토큰, "도구가 배경으로 사라진다" 원칙
- `src/lib/auth.tsx` — useAuth 훅, supabase 클라이언트 (step 2 산출물)
- `src/lib/supabase.ts` — supabase.auth.signOut (step 0 산출물)

## 작업

### 1. `src/pages/SettingsPage.tsx` 완전 구현

```typescript
export default function SettingsPage(): JSX.Element
```

#### 로그인 정보 표시

`useAuth().user`에서 이메일 주소를 가져와 표시한다.

#### 로그아웃

```typescript
// 로그아웃 버튼 클릭 시
await supabase.auth.signOut();
// AuthProvider의 onAuthStateChange가 session을 null로 만들고
// ProtectedRoute가 /login으로 리다이렉트한다.
// 별도로 navigate('/login')을 호출할 필요 없음.
```

#### PWA 설치 프롬프트

```typescript
// beforeinstallprompt 이벤트를 window에서 캡처
// 이벤트가 발생하면 "홈 화면에 추가" 버튼을 표시
// 버튼 클릭 시 deferredPrompt.prompt() 호출
// 이벤트가 없으면 (이미 설치되었거나 PWA 미지원) 버튼을 숨기거나 "이미 설치됨" 안내 표시
```

BeforeInstallPromptEvent 타입은 브라우저 표준에 없으므로 직접 정의한다:
```typescript
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
```

#### 레이아웃

- 상단: 뒤로가기 버튼
- 섹션 1: 계정 정보 (이메일 + 로그아웃 버튼)
- 섹션 2: 앱 설치 (PWA 설치 버튼, 조건부 표시)
- 단순하게 유지. 히어로 메트릭, 통계, 그라디언트 헤더 금지.

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm test        # 기존 테스트 통과
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. `phases/0-mvp/index.json`의 step 9를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "SettingsPage 구현: 계정 정보 표시, 로그아웃(signOut), PWA 설치 프롬프트(beforeinstallprompt)"`
   - 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`

## 금지사항

- 로그아웃 후 `navigate('/login')`을 명시적으로 호출하지 마라. 이유: AuthProvider의 onAuthStateChange → ProtectedRoute가 자동으로 리다이렉트한다. 중복 navigate는 race condition을 일으킬 수 있다.
- `beforeinstallprompt` 이벤트가 없을 때 에러를 표시하지 마라. 이유: 이미 설치된 경우나 PWA 미지원 브라우저에서는 이벤트가 발생하지 않는 것이 정상이다.
- 사용자 데이터 삭제 기능을 추가하지 마라. PRD MVP 제외 항목이다.
- 기존 테스트를 깨뜨리지 마라.
