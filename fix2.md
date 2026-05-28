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

---

## 후속 수정 — 로그인 후 빈 목록 홈 개선

문제:

- 로그인 후 `/`는 랜딩페이지가 아니라 글 목록 페이지로 진입한다.
- 저장한 항목이 없을 때 화면이 너무 비어 보이고, 우측 상단 `+` 외에 사용자가 무엇을 해야 하는지 알기 어렵다.
- 로그아웃과 다크모드 토글이 홈 화면에서 바로 보이지 않아 계정·테마 조작이 불편하다.

수정:

- `src/pages/HomePage.tsx`
  - 홈 헤더에 `다크/라이트` 텍스트 토글, 설정 링크, 로그아웃 버튼을 노출했다.
  - 로그아웃 버튼은 `supabase.auth.signOut()`을 직접 호출한다.
  - 빈 목록 상태를 랜딩에 가까운 안내 화면으로 확장했다.
  - 빈 목록에는 앱 목적 문구, `첫 항목 저장하기` CTA, 저장·필터·상태 관리 안내를 표시한다.
- `src/pages/HomePage.test.tsx`
  - 홈 헤더의 다크모드 토글, 설정 링크, 로그아웃 버튼을 검증한다.
  - 로그아웃 클릭 시 `supabase.auth.signOut()` 호출을 검증한다.
  - 빈 목록 안내 문구와 `첫 항목 저장하기` 링크가 표시되는지 검증한다.

추가 검증:

```bash
npm run test -- src/pages/HomePage.test.tsx
npm run test
npm run build
```

---

## 후속 수정 — 2차 UX 안정화 잔여 이슈

사용자가 2차 수정 후 확인한 문제:

1. 설정 페이지에서 로그아웃하면 메인 랜딩(`/`)이 아니라 `/login`으로 바로 이동했다.
2. 작성한 항목의 상세 페이지에서 제목/URL/메모를 명시적으로 수정하는 기능이 부족했다.
3. 모바일 화면에서 `영상`, `글`, `캡처`, `메모`, `안 봤음`, `봤음`, `보관` 필터가 데스크톱과 거의 같아 보여 반응형 UI 변화가 부족했다.
4. 목록 썸네일이 회색 빈 박스로만 표시됐다.
5. 상세 페이지 첨부 이미지가 `object-cover`로 잘려 보였다.

수정:

- `src/pages/SettingsPage.tsx`
  - 로그아웃 클릭 시 먼저 `navigate('/', { replace: true })`를 실행하고 이후 `supabase.auth.signOut()`을 호출하도록 순서를 바꿨다.
  - 이유: `signOut()`으로 인증 상태가 먼저 비면 보호 라우트가 `/settings`를 `/login`으로 리다이렉트할 수 있다.
- `src/pages/SettingsPage.test.tsx`
  - `signOut()`이 아직 resolve되지 않은 상태에서도 로그아웃 클릭 직후 `/` 랜딩으로 이동하는 테스트를 추가했다.
- `src/pages/ItemDetailPage.tsx`
  - 상단에 `수정` 버튼을 추가했다.
  - 수정 모드에서 `제목`, `URL`, `메모`를 한 번에 편집하고 저장하도록 했다.
  - 상세 이미지는 `object-cover max-h-64` 대신 `object-contain max-h-[70vh]`로 표시해 이미지가 잘리지 않게 했다.
- `src/pages/ItemDetailPage.test.tsx`
  - `수정` 버튼으로 제목/URL/메모 저장 mutation이 호출되는지 검증했다.
  - 상세 이미지가 `object-contain`으로 렌더링되는지 검증했다.
- `src/components/FilterBar.tsx`
  - 모바일 기본 레이아웃을 두 줄 구조로 바꿨다.
  - `유형` 그룹은 4칸 그리드, `상태` 그룹은 3칸 그리드로 표시한다.
  - `sm` 이상에서는 기존처럼 가로 칩 바 형태로 돌아간다.
- `src/components/FilterBar.test.tsx`
  - 모바일 기본 레이아웃에서 `유형 필터`, `상태 필터` 그룹이 분리되어 렌더링되는지 검증했다.
- `src/components/ItemCard.tsx`
  - `image_path`가 있는 항목은 `storageService.getSignedUrl(image_path)`로 signed URL을 받아 실제 썸네일 이미지를 표시한다.
- `src/components/ItemCard.test.tsx`
  - signed URL 썸네일 표시를 검증했다.

추가로 발견된 콘솔 경고:

```text
storageService.ts:21 POST https://elxliaakfyjpsqdwkdzc.supabase.co/storage/v1/object/sign/item-images/{user_id}/{item_id}.webp 400 (Bad Request)
```

원인 추정:

- 목록 썸네일 표시를 위해 `ItemCard`에서도 `createSignedUrl()`을 호출하게 되면서, `items.image_path`에는 값이 있지만 실제 `item-images` Storage 객체가 없거나 접근할 수 없는 항목이 드러났다.
- Supabase Storage의 `createSignedUrl()`은 존재하지 않는 객체 또는 접근 불가 객체에 대해 400을 반환한다.
- 컴포넌트에서 `.catch(() => null)`로 UI는 깨지지 않지만, 브라우저 네트워크/콘솔에는 실패한 POST 요청이 보일 수 있다.

수정:

- `src/services/storageService.ts`
  - `getSignedUrl(path)`가 바로 `createSignedUrl()`을 호출하지 않도록 바꿨다.
  - 먼저 `path`를 `folder`와 `fileName`으로 나눈 뒤 `supabase.storage.from('item-images').list(folder, { search: fileName, limit: 1 })`로 객체 존재 여부를 확인한다.
  - 파일이 없거나 목록 조회가 실패하면 `createSignedUrl()`을 호출하지 않고 `null`을 반환한다.
  - 파일이 실제로 있을 때만 `createSignedUrl(path, 3600)`을 호출한다.
- `src/services/storageService.test.ts`
  - 파일이 없으면 signed URL 요청을 보내지 않고 `null`을 반환하는 테스트를 추가했다.

주의:

- 이 수정은 깨진 `image_path`가 있는 기존 DB 레코드를 자동 복구하지 않는다.
- 실제 Storage에 파일이 없는 항목은 썸네일/상세 이미지가 숨겨진다.
- 기존 데이터를 정리하려면 Supabase에서 `items.image_path`와 `storage.objects.name`을 비교해 없는 파일 경로를 `null`로 정리하는 별도 데이터 마이그레이션이 필요하다.

검증:

```bash
npm run test -- src/services/storageService.test.ts src/components/ItemCard.test.tsx src/pages/ItemDetailPage.test.tsx
npm run test
npm run lint
npm run build
```
