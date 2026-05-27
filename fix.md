# fix.md — CSS 복구 + 다크모드 + 랜딩페이지 + ESLint

이 파일은 다른 세션에서 바로 실행하기 위한 자기완결 지시서입니다.

---

## 문제 요약

1. **CSS 전체 미적용**: `bg-[--color-bg]`가 `background-color: --color-bg`로 컴파일됨.  
   `var()` 없이 CSS 커스텀 프로퍼티를 참조해 색상/배경/테두리 CSS 전체 무시됨.  
   레이아웃(flex, padding 등) Tailwind는 정상이지만 색상 관련 스타일 전체 깨짐.

2. **다크모드**: `@media prefers-color-scheme` → `.dark` 클래스 방식으로 변경 요청.

3. **랜딩페이지**: `/`에 비인증 사용자를 위한 앱 소개 + CTA + 로그인 버튼 필요.  
   현재는 `/` → `ProtectedRoute` → `/login` 즉시 리다이렉트 (UX 어색함).

4. **ESLint 오류 3개**: setState in effect 패턴 (각 페이지 1개씩).

---

## 참고 파일

- `docs/UI_GUIDE.md` — 디자인 토큰, 컬러, 컴포넌트 규칙
- `src/index.css` — 현재 CSS 변수 정의 (`@theme` 블록)
- `src/App.tsx` — 라우팅 구조

---

## 작업 1 — `src/index.css` 수정

### 변경 내용
- 색상 변수를 `@theme`에서 제거하고 `:root`에 직접 정의
- `@theme`에는 `--font-sans`만 남김
- `@media prefers-color-scheme` → `.dark {}` 클래스로 변경

### 변경 후 전체 파일

```css
@import "tailwindcss";

@theme {
  --font-sans: "Pretendard", -apple-system, "Noto Sans KR", sans-serif;
}

:root {
  --color-bg: oklch(97% 0.006 80);
  --color-surface: oklch(99% 0.003 80);
  --color-border: oklch(87% 0.007 80);
  --color-text-primary: oklch(18% 0.008 80);
  --color-text-sub: oklch(52% 0.010 80);
  --color-accent: oklch(62% 0.14 55);
  --color-accent-bg: oklch(93% 0.04 55);
}

.dark {
  --color-bg: oklch(16% 0.010 80);
  --color-surface: oklch(21% 0.008 80);
  --color-border: oklch(32% 0.010 80);
  --color-text-primary: oklch(90% 0.006 80);
  --color-text-sub: oklch(65% 0.008 80);
  --color-accent: oklch(68% 0.13 55);
  --color-accent-bg: oklch(28% 0.06 55);
}
```

---

## 작업 2 — `src/main.tsx` 수정

### 변경 내용
시스템 다크모드 감지 후 `<html>`에 `.dark` 클래스 자동 적용 + 변경 감지 추가.
`createRoot` 호출 이전에 삽입.

### 삽입 위치 및 코드

`import './index.css'` 다음 줄에 추가:

```tsx
// 시스템 다크모드 감지 → <html class="dark"> 토글
const _mql = window.matchMedia('(prefers-color-scheme: dark)');
const _applyDark = (e: MediaQueryList | MediaQueryListEvent) => {
  document.documentElement.classList.toggle('dark', e.matches);
};
_applyDark(_mql);
_mql.addEventListener('change', _applyDark);
```

---

## 작업 3 — 전체 컴포넌트 CSS 클래스 일괄 수정

### 방법
PowerShell로 `src/` 하위 모든 `.tsx` 파일에서 정규식 일괄 치환:

```
패턴: [--color-variableName]
치환: [var(--color-variableName)]
```

**PowerShell 명령어** (프로젝트 루트에서 실행):

```powershell
Get-ChildItem -Path "src" -Recurse -Filter "*.tsx" | ForEach-Object {
  $content = Get-Content $_.FullName -Raw -Encoding utf8
  $newContent = $content -replace '\[--color-([a-z-]+)\]', '[var(--color-$1)]'
  if ($content -ne $newContent) {
    Set-Content -Path $_.FullName -Value $newContent -NoNewline -Encoding utf8
    Write-Host "Updated: $($_.Name)"
  }
}
```

### 적용 대상 파일 (확인용)
- `src/pages/HomePage.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/NewItemPage.tsx`
- `src/pages/ItemDetailPage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/components/FilterBar.tsx`
- `src/components/ItemCard.tsx`

---

## 작업 4 — `src/pages/LandingPage.tsx` 신규 생성

### 설명
비인증 사용자가 `/`에서 보는 랜딩 페이지.
디자인 기준: `docs/UI_GUIDE.md` (warm-minimal, off-white 배경, terracotta accent).

### 레이아웃
```
┌─────────────────────────────────┐
│ Check Later          [로그인]    │  ← sticky header, 로그인 버튼 → /login
├─────────────────────────────────┤
│                                 │
│   나중에 볼 것들을 빠르게 저장하고  │  ← 소개 문구 (2줄)
│   원할 때 바로 찾아보세요.         │
│                                 │
│      [ 시작하기  →  ]            │  ← accent 버튼, onClick → /login
│                                 │
│  ─────────────────────────────  │  ← 구분선
│  ✓ URL, 영상, 메모를 한 곳에      │  ← 기능 소개 3줄
│  ✓ 형태·상태로 분류              │
│  ✓ 필터로 30초 안에 찾기          │
│                                 │
└─────────────────────────────────┘
```

### 컴포넌트 코드

```tsx
import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  'URL, 영상, 메모를 한 곳에 저장',
  '형태·상태 3축으로 분류',
  '필터로 30초 안에 다시 찾기',
];

// 비인증 사용자용 랜딩 페이지
export default function LandingPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-10 bg-[var(--color-bg)] border-b border-[var(--color-border)] flex items-center justify-between px-4 h-14">
        <span className="font-semibold text-[var(--color-text-primary)] text-base">
          Check Later
        </span>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="px-3 py-1.5 rounded-[8px] border border-[var(--color-border)] text-sm text-[var(--color-text-sub)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors"
        >
          로그인
        </button>
      </header>

      <main className="px-6 py-16 max-w-sm mx-auto flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)] leading-snug">
              나중에 볼 것들을 빠르게 저장하고,
              <br />
              원할 때 바로 찾아보세요.
            </h1>
            <p className="text-sm text-[var(--color-text-sub)]">
              URL, 영상, 메모를 던져두고, 필터로 30초 안에 다시 꺼내는 개인 보관함.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="self-start px-5 py-2.5 rounded-[8px] bg-[var(--color-accent)] text-white text-sm font-medium"
          >
            시작하기 →
          </button>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        <ul className="flex flex-col gap-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-text-sub)]">
              <span className="text-[var(--color-accent)] mt-px">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
```

---

## 작업 5 — `src/App.tsx` 수정

### 변경 내용
- `LandingPage` import 추가
- `useAuth` import 추가
- `RootPage` 컴포넌트 추가 (파일 내, App 함수 위)
- `/` 라우트를 `ProtectedRoute` 밖으로 분리

### 변경 후 전체 파일

```tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ItemDetailPage from './pages/ItemDetailPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NewItemPage from './pages/NewItemPage';
import SettingsPage from './pages/SettingsPage';

// 루트 경로: 인증 여부에 따라 메인화면 또는 랜딩페이지
function RootPage() {
  const { session, loading } = useAuth();
  if (loading) return null;
  return session ? <HomePage /> : <LandingPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/new" element={<NewItemPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 작업 6 — ESLint 오류 수정 (3개)

### 6-1. `src/pages/ItemDetailPage.tsx`

**오류 위치**: line 52–57 (`useEffect`로 편집 상태 초기화)

**제거 대상**:
```tsx
// 항목 로드 시 편집 초기값 세팅
useEffect(() => {
  if (item) {
    setEditTitle(item.title);
    setEditMemo(item.memo ?? '');
  }
}, [item]);
```

**편집 버튼 onClick 수정** (두 곳):

제목 편집 버튼:
```tsx
// Before:
onClick={() => setIsEditingTitle(true)}

// After:
onClick={() => { setEditTitle(item.title); setIsEditingTitle(true); }}
```

메모 편집 버튼:
```tsx
// Before:
onClick={() => setIsEditingMemo(true)}

// After:
onClick={() => { setEditMemo(item.memo ?? ''); setIsEditingMemo(true); }}
```

`editTitle`, `editMemo` 초기값은 `''` 유지. 비편집 상태에서는 `item.title`, `item.memo`를 직접 표시하므로 문제 없음.

---

### 6-2. `src/pages/NewItemPage.tsx`

**오류 위치**: line 55–57 (`useEffect`로 type 도출)

**현재 코드 (제거 대상)**:
```tsx
const [type, setType] = useState<ItemType>(() =>
  detectType({ hasImage: false, url: initUrl })
);

// URL 또는 이미지 변경 시 type 재판정
useEffect(() => {
  setType(detectType({ hasImage: !!imageFile, url }));
}, [url, imageFile]);
```

**수정 후**:
```tsx
const [typeOverride, setTypeOverride] = useState<ItemType | null>(null);
const detectedType = useMemo(
  () => detectType({ hasImage: !!imageFile, url }),
  [url, imageFile]
);
const type = typeOverride ?? detectedType;
```

유형 칩 선택 onClick도 수정:
```tsx
// Before:
onClick={() => setType(t)}

// After:
onClick={() => setTypeOverride(t)}
```

`useMemo` import 추가 (`useState`, `useEffect`와 함께).
`useEffect` (type 재판정 용) 제거.

**미사용 import 제거**:
`import type { JSX } from 'react'` 안의 `JSX`만 남기고, 나머지 미사용 named import 정리.
`React.FormEvent` → `React` import 없이 사용하고 있다면 타입 선언 수정:
```tsx
// Before:
async function handleSubmit(e: React.FormEvent) {

// After:
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
```
그리고 파일 상단에 `import React from 'react'`가 없다면 타입만 사용하는 경우:
```tsx
import type { FormEvent, JSX } from 'react';
// ...
async function handleSubmit(e: FormEvent<HTMLFormElement>) {
```

---

### 6-3. `src/pages/SettingsPage.tsx`

**오류 위치**: line 29 (`useEffect` 안에서 `setIsInstalled`)

**현재 코드**:
```tsx
const [isInstalled, setIsInstalled] = useState(false);

useEffect(() => {
  const handler = (e: Event) => { ... };
  window.addEventListener('beforeinstallprompt', handler);

  const mql = window.matchMedia('(display-mode: standalone)');
  if (mql.matches) setIsInstalled(true);  // ← 오류

  return () => window.removeEventListener('beforeinstallprompt', handler);
}, []);
```

**수정 후**:
```tsx
// lazy initializer로 초기값 설정 → useEffect 안에서 setState 호출 불필요
const [isInstalled] = useState(
  () => window.matchMedia('(display-mode: standalone)').matches
);

useEffect(() => {
  const handler = (e: Event) => { ... };
  window.addEventListener('beforeinstallprompt', handler);
  // setIsInstalled 호출 제거
  return () => window.removeEventListener('beforeinstallprompt', handler);
}, []);
```

---

## 검증

```bash
npm run lint
npm run build
```

빌드 성공 + ESLint 오류 0개 확인.
빌드 후 `dist/assets/*.css` 파일에서 `:root { --color-accent` 문자열 확인.
