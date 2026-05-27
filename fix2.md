# fix2.md — PWA 아이콘 + 헤더 + OAuth + Tailwind 검증

이 파일은 다른 세션에서 바로 실행하기 위한 자기완결 지시서입니다.

---

## 전제 조건 확인

작업 전 아래 파일 상태를 확인한다:

- `src/index.css` — `@import "tailwindcss"` + `:root { --color-* }` + `.dark { --color-* }`
- `vite.config.ts` — `tailwindcss()` 플러그인 등록
- `src/App.tsx` — `RootPage` 패턴 (session ? HomePage : LandingPage)
- `src/main.tsx` — `.dark` 클래스 토글 로직 존재

---

## 작업 0 — Tailwind CSS v4 설정 검증

공식 문서 기준: https://tailwindcss.com/docs/installation/using-vite

### v4 + Vite 올바른 설정 체크리스트

**`package.json`**
```json
"tailwindcss": "^4.x",
"@tailwindcss/vite": "^4.x"
```

**`vite.config.ts`**
```ts
import tailwindcss from '@tailwindcss/vite'
// plugins 배열에: tailwindcss()
```
`tailwind.config.js` 파일은 v4에서 불필요. CSS에서 `@theme`으로 설정.

**`src/index.css`** — 올바른 구조
```css
@import "tailwindcss";          /* ← 이 한 줄로 전체 포함 */

@theme {
  --font-sans: "Pretendard", -apple-system, "Noto Sans KR", sans-serif;
  /* Tailwind 토큰으로 쓸 것만 여기에 */
}

:root {
  --color-bg: oklch(97% 0.006 80);
  /* CSS 변수는 @theme 밖 :root에 */
}

.dark {
  --color-bg: oklch(16% 0.010 80);
}
```

**컴포넌트 파일 CSS 변수 참조 방식**
```tsx
/* ✅ 올바름 — var() 래핑 필수 */
className="bg-[var(--color-bg)] text-[var(--color-text-primary)]"

/* ❌ 틀림 — 색상이 무시됨 (배경/테두리 전체 안 먹힘) */
className="bg-[--color-bg]"
```

### 검증 커맨드

```bash
# 1. 틀린 패턴 잔존 여부 확인 (결과 0줄이어야 함)
grep -r "\[--color-" src/

# 2. 빌드 후 CSS 파일에 실제 var() 적용 확인
npm run build
grep "var(--color" dist/assets/*.css | head -5
```

만약 `[--color-` 패턴이 남아있으면 아래 PowerShell로 일괄 수정:

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

---

## 작업 1 — PWA 아이콘 생성

현재 `public/pwa-192x192.png`, `public/pwa-512x512.png`가 65바이트(빈 파일)라
브라우저 콘솔에 "resource isn't a valid image" 에러가 발생한다.

### 1-1. `scripts/gen-pwa-icons.mjs` 신규 생성

```js
// PWA 아이콘 생성 스크립트 (Node.js 내장 모듈만 사용, 외부 패키지 없음)
import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';

function crc32(data) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (const b of data) crc = table[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crcBuf]);
}

function makePNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type: RGB
  const row = 1 + size * 3;
  const raw = Buffer.alloc(row * size);
  for (let y = 0; y < size; y++) {
    raw[y * row] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      raw[y * row + 1 + x * 3]     = r;
      raw[y * row + 1 + x * 3 + 1] = g;
      raw[y * row + 1 + x * 3 + 2] = b;
    }
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdrData),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// 브랜드 accent 색상: oklch(62% 0.14 55) ≈ #c2733a (terracotta)
const [R, G, B] = [0xc2, 0x73, 0x3a];

mkdirSync('public', { recursive: true });
writeFileSync('public/pwa-192x192.png',    makePNG(192, R, G, B));
writeFileSync('public/pwa-512x512.png',    makePNG(512, R, G, B));
writeFileSync('public/apple-touch-icon.png', makePNG(180, R, G, B));
console.log('✓ 아이콘 3개 생성 완료 (192×192, 512×512, apple-touch-icon 180×180)');
```

### 1-2. `package.json` scripts에 추가

```json
"gen-icons": "node scripts/gen-pwa-icons.mjs"
```

### 1-3. 실행 및 확인

```bash
node scripts/gen-pwa-icons.mjs
```

`public/pwa-192x192.png` 파일 크기가 100KB 이상인지 확인.

---

## 작업 2 — Manifest enctype 경고 수정

**파일**: `vite.config.ts`

`share_target` 블록에 `enctype` 한 줄 추가:

```ts
// 변경 전
share_target: {
  action: '/new',
  method: 'GET',
  params: { title: 'title', text: 'text', url: 'url' },
},

// 변경 후
share_target: {
  action: '/new',
  method: 'GET',
  enctype: 'application/x-www-form-urlencoded',
  params: { title: 'title', text: 'text', url: 'url' },
},
```

---

## 작업 3 — Google OAuth 계정 선택 강제

**파일**: `src/pages/LoginPage.tsx`

`handleGoogleLogin` 함수에 `queryParams` 추가:

```tsx
// 변경 전
const handleGoogleLogin = () => {
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/` },
  });
};

// 변경 후
const handleGoogleLogin = () => {
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: { prompt: 'select_account' },
    },
  });
};
```

---

## 작업 4 — 다크모드 토글 + 헤더 버튼

### 4a. `src/main.tsx` — localStorage 우선 적용

기존 다크모드 감지 코드(`_mql`, `_applyDark` 부분)를 아래로 교체:

```tsx
// 시스템 감지 + localStorage override 우선
const _mql = window.matchMedia('(prefers-color-scheme: dark)');
const _stored = localStorage.getItem('theme');
const _isDark = _stored !== null ? _stored === 'dark' : _mql.matches;
document.documentElement.classList.toggle('dark', _isDark);
_mql.addEventListener('change', (e) => {
  // 수동 설정이 없을 때만 시스템 따라감
  if (localStorage.getItem('theme') === null) {
    document.documentElement.classList.toggle('dark', e.matches);
  }
});
```

### 4b. `src/pages/HomePage.tsx` — 헤더 전체 교체

헤더 부분(`<header>...</header>`)을 아래로 교체.
나머지 코드(`<FilterBar />`, `<main>` 등)는 그대로 유지.

추가 import: `useState` (react에서)

```tsx
// 파일 상단 import에 useState 추가
import { useState } from 'react';

// HomePage 함수 내부 최상단에 추가
const [dark, setDark] = useState(
  () => document.documentElement.classList.contains('dark'),
);

// 다크모드 토글 핸들러
function toggleDark() {
  const next = !dark;
  document.documentElement.classList.toggle('dark', next);
  localStorage.setItem('theme', next ? 'dark' : 'light');
  setDark(next);
}
```

헤더 교체:

```tsx
<header className="sticky top-0 z-10 bg-[var(--color-bg)] border-b border-[var(--color-border)] flex items-center justify-between px-4 h-14">
  <span className="font-semibold text-[var(--color-text-primary)] text-base">
    Check Later
  </span>
  <div className="flex items-center gap-1">
    {/* 다크모드 토글 */}
    <button
      type="button"
      onClick={toggleDark}
      aria-label={dark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="flex items-center justify-center w-9 h-9 rounded-[8px] text-[var(--color-text-sub)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] transition-colors"
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
    {/* 새 항목 추가 */}
    <Link
      to="/new"
      aria-label="새 항목 추가"
      className="flex items-center justify-center w-9 h-9 rounded-[8px] bg-[var(--color-accent)] text-white text-xl font-medium"
    >
      +
    </Link>
    {/* 설정 (로그아웃은 설정 페이지에 있음) */}
    <Link
      to="/settings"
      aria-label="설정"
      className="flex items-center justify-center w-9 h-9 rounded-[8px] text-[var(--color-text-sub)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </Link>
  </div>
</header>
```

---

## 최종 검증

```bash
# 아이콘 생성
node scripts/gen-pwa-icons.mjs

# lint + 빌드
npm run lint
npm run build

# CSS에 var() 적용 확인
grep "var(--color" dist/assets/*.css | head -5
```

성공 기준:
1. `public/pwa-192x192.png` 파일 크기 100KB 이상
2. `npm run lint` 에러 0개
3. `npm run build` 성공 (타입 에러 없음)
4. 빌드 CSS에 `background-color:var(--color-bg)` 형태 존재
5. 브라우저 헤더에 다크모드 토글·설정 버튼 표시
6. 설정 페이지에서 로그아웃 가능
7. 브라우저 콘솔에 아이콘 에러·enctype 경고 없음
