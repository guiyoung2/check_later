# Step 3: services-and-utils

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 현재 코드를 파악하라:

- `docs/ARCHITECTURE.md` — items 테이블 스키마, type 자동 판정 우선순위, 데이터 흐름, Storage 경로 규칙
- `src/lib/supabase.ts` — Supabase 클라이언트 (step 0 산출물)
- `src/types/index.ts` — Item, CreateItemInput, UpdateItemInput, ItemFilters 타입 (step 0 산출물)

## 작업

### 0. `src/types/index.ts` 수정 — `CreateItemInput`에 `id?: string` 추가

이미지 업로드 시 Storage 경로에 itemId가 필요하다. 업로드 전에 itemId를 미리 정해야 하므로 `CreateItemInput`에 선택적 `id` 필드를 추가한다.

```typescript
export interface CreateItemInput {
  id?: string;      // 미리 지정할 경우 (이미지 업로드 flow에서 사용)
  type: ItemType;
  status?: ItemStatus;
  title: string;
  memo?: string;
  url?: string;
  image_path?: string;
}
```

### 1. `src/services/itemsService.ts` 생성

Supabase PostgREST를 직접 호출하는 순수 함수 모음. TanStack Query나 React에 의존하지 않는다.

```typescript
export const itemsService = {
  // 필터 적용 + created_at desc 정렬로 목록 조회
  async list(filters?: ItemFilters): Promise<Item[]>,

  // 단일 항목 조회. 없으면 null 반환 (throw 금지)
  async getById(id: string): Promise<Item | null>,

  // 새 항목 생성. user_id는 supabase.auth.getUser()로 가져온다.
  // input.id가 있으면 해당 id로 insert (이미지 업로드 flow에서 미리 지정된 id 사용)
  async create(input: CreateItemInput): Promise<Item>,

  // 부분 업데이트. 전달된 필드만 변경된다.
  async update(id: string, input: UpdateItemInput): Promise<Item>,

  // 항목 삭제
  async remove(id: string): Promise<void>,
}
```

구현 규칙:
- `supabase.from('items')` 쿼리에서 에러가 발생하면 `throw error`로 상위에 전파하라.
- `list()`에서 filters.type이 있으면 `.eq('type', filters.type)` 조건 추가.
- `list()`에서 filters.status가 있으면 `.eq('status', filters.status)` 조건 추가.
- `list()`는 항상 `.order('created_at', { ascending: false })`를 적용한다.
- `create()`에서 user_id를 직접 받지 않는다. `supabase.auth.getUser()`로 현재 사용자의 id를 가져온다.
- `create()`에서 `input.id`가 있으면 insert 객체에 `id: input.id`를 포함시킨다.

### 2. `src/services/storageService.ts` 생성

Supabase Storage 파일 업로드와 signed URL 발급.

```typescript
export const storageService = {
  // 파일 업로드. 경로: {userId}/{itemId}.{ext}
  // 성공 시 경로 문자열 반환
  async upload(file: File, userId: string, itemId: string): Promise<string>,

  // signed URL 발급 (유효시간: 3600초)
  async getSignedUrl(path: string): Promise<string>,
}
```

구현 규칙:
- 버킷명은 `'item-images'`로 고정.
- 파일 확장자는 `file.name.split('.').pop()` 으로 추출.
- `supabase.storage.from('item-images').upload(path, file)` 에러 시 throw.

### 3. `src/lib/og-parser.ts` 생성

URL에서 og:title을 추출하는 유틸. CORS 실패 시 null을 반환한다.

```typescript
// URL에서 og:title 추출 시도. CORS 실패 또는 파싱 실패 시 null 반환.
export async function fetchOgTitle(url: string): Promise<string | null>
```

구현 규칙:
- `fetch(url)`로 HTML을 가져오고 `<meta property="og:title" content="...">` 파싱.
- fetch 실패(CORS, 네트워크 에러 등) 시 catch하여 null 반환. throw 금지.
- `<title>` 태그는 fallback으로 시도하지 않는다. 호출 측에서 URL 자체를 fallback으로 사용한다.

### 4. `src/lib/form-type-detect.ts` 생성

입력값으로 ItemType을 자동 판정하는 순수 함수.

```typescript
interface DetectTypeParams {
  hasImage: boolean;   // 이미지 파일이 선택된 경우
  url?: string;        // URL 입력값
}

// ARCHITECTURE.md의 우선순위: 이미지 → YouTube → 일반 URL → 메모
export function detectType(params: DetectTypeParams): ItemType
```

우선순위 (ARCHITECTURE.md 기준):
1. `hasImage === true` → `'screenshot'`
2. url이 `youtube.com` 또는 `youtu.be` 포함 → `'video'`
3. url이 존재하고 비어 있지 않음 → `'article'`
4. 그 외 → `'memo'`

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm test        # 기존 테스트 통과
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. `phases/0-mvp/index.json`의 step 3을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "CreateItemInput에 id?: string 추가, itemsService/storageService/og-parser/form-type-detect 생성"`
   - 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`

## 금지사항

- 서비스 함수 내에서 React hook을 사용하지 마라. 서비스는 순수 async 함수여야 한다.
- `itemsService.create()`에서 user_id를 파라미터로 받지 마라. 이유: auth.getUser()로 가져와야 일관성이 있다.
- `fetchOgTitle()`에서 CORS 에러를 throw하지 마라. 이유: CORS 실패는 정상 상황이며 호출 측에서 URL을 fallback으로 쓴다.
- TanStack Query 훅과 Zustand 스토어는 이 step에서 만들지 마라. 이유: 다음 step(step 4)에서 담당한다.
- 기존 테스트를 깨뜨리지 마라.
