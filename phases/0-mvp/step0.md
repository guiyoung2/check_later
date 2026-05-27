# Step 0: foundation

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md` — 디렉토리 구조, items 스키마, 라우트 목록
- `docs/ADR.md` — 기술 스택 결정 배경
- `src/main.tsx` — QueryClient가 이미 설정되어 있음. 건드리지 않는다.
- `src/index.css` — Tailwind v4 디자인 토큰이 이미 정의되어 있음. 건드리지 않는다.
- `package.json` — 현재 설치된 패키지 확인

## 현재 상태

- `@tanstack/react-query`, `zustand`, `vite-plugin-pwa`는 이미 설치됨
- `react-router-dom`, `@supabase/supabase-js`는 **미설치** → 이 step에서 설치
- `src/App.tsx`는 빈 껍데기

## 작업

### 1. 패키지 설치

```bash
npm install react-router-dom @supabase/supabase-js
```

### 2. `src/lib/supabase.ts` 생성

환경변수 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY`로 Supabase 클라이언트를 생성하고 export한다.

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
);
```

### 3. `src/types/index.ts` 생성

아래 타입들을 정의하라. `docs/ARCHITECTURE.md`의 items 스키마와 정확히 일치해야 한다.

```typescript
// DB enum과 일치시킨다
export type ItemType = 'video' | 'article' | 'screenshot' | 'memo';
export type ItemStatus = 'pending' | 'reviewed' | 'archived';

export interface Item {
  id: string;
  user_id: string;
  type: ItemType;
  status: ItemStatus;
  title: string;
  memo: string | null;
  url: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateItemInput {
  type: ItemType;
  status?: ItemStatus;
  title: string;
  memo?: string;
  url?: string;
  image_path?: string;
}

export interface UpdateItemInput {
  type?: ItemType;
  status?: ItemStatus;
  title?: string;
  memo?: string | null;
  url?: string | null;
  image_path?: string | null;
}

export interface ItemFilters {
  type?: ItemType;
  status?: ItemStatus;
}
```

### 4. `src/App.tsx` 업데이트 — 라우팅 구조

`docs/ARCHITECTURE.md`의 라우트 목록대로 구성하라:
- `/login` → `LoginPage`
- `/` → `HomePage` (인증 필요)
- `/new` → `NewItemPage` (인증 필요)
- `/items/:id` → `ItemDetailPage` (인증 필요)
- `/settings` → `SettingsPage` (인증 필요)

ProtectedRoute는 이 step에서는 단순히 `<Outlet />`만 렌더링하는 placeholder로 구현하라. 실제 인증 체크는 Step 2에서 추가한다.

`BrowserRouter`로 전체를 감싸고 `Routes` + `Route`로 경로를 정의하라.

### 5. 페이지 스텁 생성

아래 파일 각각을 생성하라. 컴포넌트 이름과 경로가 맞으면 내용은 최소한으로 작성해도 된다:

- `src/pages/LoginPage.tsx` — `<div>로그인</div>` 수준 스텁
- `src/pages/HomePage.tsx` — `<div>홈</div>` 수준 스텁
- `src/pages/NewItemPage.tsx` — `<div>새 항목</div>` 수준 스텁
- `src/pages/ItemDetailPage.tsx` — `<div>상세</div>` 수준 스텁
- `src/pages/SettingsPage.tsx` — `<div>설정</div>` 수준 스텁
- `src/components/ProtectedRoute.tsx` — `<Outlet />` 렌더링하는 placeholder

## Acceptance Criteria

```bash
npm run build   # TypeScript 컴파일 에러 없음, 빌드 성공
npm test        # 기존 sanity test 통과
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 디렉토리 구조를 따르는가? (lib/, types/, pages/, components/)
   - ADR 기술 스택을 벗어나지 않았는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 0을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "react-router-dom·@supabase/supabase-js 설치, 타입 정의, 라우팅 스켈레톤, 페이지 스텁 생성"`
   - 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`

## 금지사항

- `src/main.tsx`의 QueryClient 설정을 수정하지 마라. 이미 올바르게 설정되어 있다.
- `src/index.css`의 디자인 토큰을 수정하지 마라. 이미 UI_GUIDE.md 기준으로 정의되어 있다.
- 기존 테스트(`src/test/sanity.test.ts`)를 깨뜨리지 마라.
- 페이지 스텁에 불필요한 로직이나 스타일을 추가하지 마라. 이후 step에서 구현한다.
