# fix6 — URL 정규화 · 타입 우선순위 · YouTube 썸네일 버그 수정

> 작성: 2026-05-29 / 브랜치: feat-design-renewal-fix  
> 상태: **✅ 모든 수정 완료 (2026-05-29)**  
> 이 문서만 읽고 새 세션에서 바로 착수할 수 있도록 자기완결적으로 작성한다.

---

## 0. 배경

`design-renewal-fix` Phase(step0~8) 완료 후 발견된 4가지 버그. 하네스 없이 파일 단위로 순서대로 수정한다.

---

## 1. 버그 분석

### Bug A — `www.naver.com` 입력 시 메모 카테고리 + 링크 이동 오류

**증상**:
- `www.naver.com` 입력 → 폼 타입 칩이 '글'이 아닌 '메모'로 표시
- 저장 후 상세 페이지에서 링크 클릭 → `http://localhost:517x/items/www.naver.com` 로 이동
- Supabase `id=eq.www.naver.com` 400 Bad Request

**원인 1** (`NewItemPage.tsx:49`):
```typescript
const validUrl = values.urls.find((u) => /^https?:\/\//i.test(u.trim()))?.trim();
```
`www.naver.com`은 `^https?:\/\/` 미매칭 → `validUrl = undefined` → `detectType({ url: undefined })` → `'memo'`

**원인 2** (`ItemDetailPage.tsx:449`):
```tsx
<a href={attachment.value}>  // attachment.value = "www.naver.com"
```
protocol 없는 href → 브라우저가 상대경로 처리 → 현재 URL(`/items/<uuid>`) 기준으로 `/items/www.naver.com` 이동

---

### Bug B — URL + 이미지 첨부 → "캡처" 단일 카테고리

**증상**: YouTube URL + 이미지 첨부 시 '캡처' 카드만 표시 (영상 카드 미표시)

**원인** (`src/lib/form-type-detect.ts:10`):
```typescript
export function detectType(params: DetectTypeParams): ItemType {
  if (params.hasImage) return 'screenshot';  // 이미지가 URL보다 우선
  ...
}
```
이미지 여부가 URL보다 우선 → URL + 이미지 → 항상 screenshot

---

### Bug C — YouTube URL → 피드 목록 회색 썸네일

**증상**: YouTube URL만 있는 항목이 피드 목록에서 회색 박스만 표시

**원인** (`src/components/items/VideoCard.tsx:30`):
```typescript
const signedImageUrl = useSignedUrl(item.image_path);
// item.image_path가 null이면 썸네일 없음
```
YouTube 썸네일 추출 로직(`getYouTubeThumbnail`)이 `ItemDetailPage.tsx`에만 존재. VideoCard에 없음.

---

### Bug D — YouTube URL 입력 시 console CORS 에러

**증상**: 콘솔에 빨간 CORS 에러 (`Access-Control-Allow-Origin`, `ERR_FAILED`)

**원인** (`src/lib/og-parser.ts:4`):
```typescript
const res = await fetch(url);  // YouTube 포함 대부분 사이트 CORS 차단
```
이미 catch로 null 반환하지만, 브라우저 콘솔 CORS 에러는 JS에서 막을 수 없음.

---

## 2. 수정 계획 (9개 파일, 신설 2 + 수정 7)

### ✅ Step 1: `src/lib/normalizeUrl.ts` 신설

```typescript
// URL protocol 자동 추가
export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w-]+\.[\w.-]+/.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}
```

---

### ✅ Step 2: `src/lib/youtube.ts` 신설

`ItemDetailPage.tsx`의 로컬 `getYouTubeThumbnail` 함수(line 37~51)를 공용 유틸로 추출.

```typescript
// YouTube URL에서 thumbnail URL 추출
export function getYouTubeThumbnail(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;
    if (parsed.hostname.includes('youtu.be')) {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.hostname.includes('youtube.com')) {
      videoId = parsed.searchParams.get('v');
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}
```

`ItemDetailPage.tsx`의 로컬 함수 삭제 후 이 import 사용.

---

### ✅ Step 3: `src/lib/form-type-detect.ts` 수정

**타입 우선순위 변경: URL > 이미지**

```typescript
// BEFORE (line 9~18):
export function detectType(params: DetectTypeParams): ItemType {
  if (params.hasImage) return 'screenshot';
  const url = params.url?.trim();
  if (url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'video';
    return 'article';
  }
  return 'memo';
}

// AFTER:
export function detectType(params: DetectTypeParams): ItemType {
  const url = params.url?.trim();
  if (url) {
    if (/youtube\.com|youtu\.be/i.test(url)) return 'video';
    return 'article';
  }
  if (params.hasImage) return 'screenshot';
  return 'memo';
}
```

---

### ✅ Step 4: `src/lib/og-parser.ts` 수정

YouTube → oEmbed API (CORS 허용). 그 외 → 조기 반환 (CORS 에러 방지).

```typescript
// URL에서 제목 추출. YouTube는 oEmbed, 나머지는 CORS 차단으로 skip.
export async function fetchOgTitle(url: string): Promise<string | null> {
  try {
    if (/youtube\.com|youtu\.be/i.test(url)) {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      );
      if (!res.ok) return null;
      const data = await res.json();
      return (data.title as string) ?? null;
    }
    // 비YouTube: 브라우저 CORS 차단으로 실패하므로 시도하지 않음
    return null;
  } catch {
    return null;
  }
}
```

---

### ✅ Step 5: `src/components/items/ItemForm.tsx` 수정

`detectedType` useMemo(line 94~99)에서 `normalizeUrl` 적용. `www.naver.com` 입력 시 라이브 타입 칩이 '글'로 표시되도록.

```typescript
import { normalizeUrl } from '../../lib/normalizeUrl';
// ...
// 기존 line 97 교체:
// const validUrl = urls.find((u) => /^https?:\/\//i.test(u.trim()));
const rawUrl = urls.find((u) => u.trim())?.trim() ?? '';
const validUrl = rawUrl ? normalizeUrl(rawUrl) : undefined;
return detectType({ hasImage, url: validUrl });
```

---

### ✅ Step 6: `src/components/items/VideoCard.tsx` 수정

YouTube 썸네일 폴백 추가. 이미지도 있을 때 '캡처' 칩 추가.

```tsx
import { getYouTubeThumbnail } from '../../lib/youtube';
// ...
const signedImageUrl = useSignedUrl(item.image_path);
const youtubeThumbnail = item.url ? getYouTubeThumbnail(item.url) : null;
const thumbSrc = signedImageUrl ?? youtubeThumbnail;

// JSX 썸네일 영역 (기존 img src 교체):
{thumbSrc && (
  <img src={thumbSrc} alt={`${item.title} 썸네일`} className="h-full w-full object-cover" />
)}

// 칩 영역 (기존 <Chip variant="type">영상</Chip> 뒤에 추가):
{item.image_path && <Chip variant="type">캡처</Chip>}
```

---

### ✅ Step 7: `src/components/items/ArticleCard.tsx` 수정

이미지도 있을 때 '글' 칩 뒤에 '캡처' 칩 추가.

```tsx
// 칩 영역 (기존 <Chip variant="type">글</Chip> 뒤에 추가):
{item.image_path && <Chip variant="type">캡처</Chip>}
```

---

### ✅ Step 8: `src/pages/NewItemPage.tsx` 수정

URL 저장 전 `normalizeUrl` 적용. attachment 값도 정규화.

```typescript
import { normalizeUrl } from '../lib/normalizeUrl';
// ...

// 기존 line 49 교체:
// const validUrl = values.urls.find((u) => /^https?:\/\//i.test(u.trim()))?.trim();
const validUrl = values.urls
  .map((u) => normalizeUrl(u.trim()))
  .find((u) => /^https?:\/\//i.test(u));

// ...

// 기존 line 65~69 교체 (attachments 정규화):
const attachments: Array<{ kind: 'url' | 'image'; value: string }> = [
  ...values.urls
    .filter((u) => u.trim())
    .map((u) => ({ kind: 'url' as const, value: normalizeUrl(u.trim()) })),
  ...uploadedPaths.map((p) => ({ kind: 'image' as const, value: p })),
];
```

---

### ✅ Step 9: `src/pages/ItemDetailPage.tsx` 수정

**9-1. 로컬 `getYouTubeThumbnail` 함수(line 37~51) 삭제** → `import { getYouTubeThumbnail } from '../lib/youtube'` 추가

**9-2. URL 링크 href 정규화** (line 449):
```tsx
import { normalizeUrl } from '../lib/normalizeUrl';
// ...
// href={attachment.value} → href={normalizeUrl(attachment.value)}
<a href={normalizeUrl(attachment.value)} target="_blank" rel="noopener noreferrer" ...>
```

**9-3. 편집 저장 시 URL 정규화**: ItemDetailPage의 edit 저장 로직에서 URL attachment 수집 부분에 `normalizeUrl` 적용 (NewItemPage Step 8과 동일 패턴)

---

## 3. 변경 파일 목록

| 파일 | 변경 |
|------|------|
| `src/lib/normalizeUrl.ts` | **신설** — URL protocol 정규화 유틸 |
| `src/lib/youtube.ts` | **신설** — YouTube 썸네일 추출 유틸 |
| `src/lib/form-type-detect.ts` | 타입 우선순위 URL > 이미지로 변경 |
| `src/lib/og-parser.ts` | YouTube oEmbed 사용, 비YouTube skip |
| `src/components/items/ItemForm.tsx` | detectedType에 normalizeUrl 적용 |
| `src/components/items/VideoCard.tsx` | YouTube 썸네일 폴백 + 캡처 칩 조건부 추가 |
| `src/components/items/ArticleCard.tsx` | 캡처 칩 조건부 추가 |
| `src/pages/NewItemPage.tsx` | URL normalizeUrl 적용 (validUrl + attachments) |
| `src/pages/ItemDetailPage.tsx` | href 정규화 + youtube.ts import + edit normalizeUrl |

---

## 4. 검증 게이트

```bash
npm run build       # tsc --noEmit 포함
npm run test        # 기존 74개 테스트 통과 확인
npm run lint
```

육안 확인:
- `www.naver.com` 입력 → 폼 타입 칩 '글' 표시 → 저장 → 상세 링크 클릭 → `https://www.naver.com` 정상 이동
- YouTube URL 입력 → 피드 목록 YouTube 썸네일 (회색 X)
- YouTube URL 입력 시 콘솔 CORS 에러 없음
- YouTube + 이미지 첨부 → 피드 카드에 '영상' + '캡처' 칩 모두 표시
- 일반 URL + 이미지 첨부 → 피드 카드에 '글' + '캡처' 칩 모두 표시
- 이미지만 → 피드 카드에 '캡처' 칩 하나만 표시
- 텍스트만 → 피드 카드에 '메모' 칩

---

## 5. 주의사항

- `detectType` 우선순위 변경으로, 기존 DB에 `type = 'screenshot'`으로 저장된 항목 중 실제로 URL도 있는 경우는 피드에서 여전히 ImageCard로 표시됨 (신규 저장부터 변경 적용).
- `getYouTubeThumbnail`를 `ItemDetailPage.tsx` 로컬 → `lib/youtube.ts`로 이전 시 기존 로컬 함수 **반드시 삭제** (타입 에러 방지).
- `form-type-detect.ts` 변경으로 기존 단위 테스트 있으면 우선순위 변경에 맞게 갱신.

---

## 6. 추가 수정 (2026-05-29 2차)

> 상태: **✅ 완료**

### 버그 A — 복합 첨부 시 상세 페이지 이미지 미표시

**원인**: `ItemDetailPage.tsx`의 이미지 렌더링 조건이 `type === 'screenshot'`인 경우에만 표시.  
URL + 이미지 조합은 type이 'article'/'video'여서 이미지가 숨겨졌다.

**수정**: `type === 'screenshot'` 조건 제거 → `imageAttachments.length > 0` 이면 항상 표시.

---

### 버그 B — 상세 페이지 카테고리 칩에 '캡처' 미표시

**원인**: 상세 페이지 칩이 DB `type` 값만 표시하고, 이미지 첨부 여부를 반영하지 않음.

**수정**: `currentItem.image_path`가 있으면 '캡처' 칩 추가.

---

### 버그 C — VideoCard 썸네일: YouTube + 이미지 조합 시 이미지 썸네일 위에 PlayBadge

**원인**: `thumbSrc = signedImageUrl ?? youtubeThumbnail` — 이미지 우선.

**수정**: `thumbSrc = youtubeThumbnail ?? signedImageUrl` — YouTube URL 우선.

---

### 버그 D — 복수 URL 입력 시 YouTube가 두 번째여도 type/url 올바르게 저장

**원인**: `values.urls.find(...)` 가 첫 번째 유효 URL만 선택. `naver.com` + `youtube.com` 순서면 type='article'로 저장.

**수정**: `NewItemPage.tsx`와 `ItemForm.tsx`에서 YouTube URL이 있으면 우선 선택.

---

### 기능 E — 이미지 슬라이더 (다중 이미지)

이미지가 여러 장일 때 세로 스택 대신 슬라이더로 표시.

**구현**: `ItemDetailPage.tsx`에 `ImageSlider` 컴포넌트 추가.  
- CSS `scroll-snap` + `overflow-x-auto` → 모바일 swipe 네이티브 지원  
- 1/N 카운터 (우상단)  
- 이전/다음 화살표 버튼 (데스크톱용)

---

### 버그 F — CardMenu 드롭다운이 다음 카드 뒤로 숨는 문제

**원인**: 카드 목록의 각 `group relative` wrapper가 z-index 없이 DOM 순서로 쌓임.  
열린 드롭다운이 카드 높이를 넘어 아래로 뻗으면 다음 카드 wrapper가 그 위에 그려져 가려짐.

**수정**:  
- `CardMenu.tsx`: `onOpenChange?: (open: boolean) => void` prop 추가, open 상태 변경 시 콜백 호출  
- `ItemCard.tsx`: `menuOpen` state 추가, 열려 있을 때 wrapper에 `z-50` 적용

**변경 파일**:
| 파일 | 변경 |
|------|------|
| `src/pages/ItemDetailPage.tsx` | 이미지 렌더링 조건 + 캡처 칩 + ImageSlider |
| `src/components/items/VideoCard.tsx` | YouTube 썸네일 우선순위 변경 |
| `src/pages/NewItemPage.tsx` | YouTube URL 우선 선택 |
| `src/components/items/ItemForm.tsx` | YouTube URL 우선 선택 |
| `src/components/items/CardMenu.tsx` | onOpenChange prop 추가 |
| `src/components/ItemCard.tsx` | menuOpen state + z-50 조건부 적용 |

---

## 7. 추가 수정 (2026-05-29 3차)

> 상태: **✅ 완료**

### 버그 A — URL 링크 클릭 영역이 가로 전체

**증상**: 상세 페이지 URL 링크가 컨테이너 전체 너비로 클릭 영역이 활성화됨.

**원인**: `ItemDetailPage.tsx` URL 링크 `<a>` 가 `flex-col` 컨테이너 안에서 기본 `align-items: stretch`로 full-width가 됨.

**수정**: `<a>` 태그에 `self-start` 추가.

---

### 버그 B — 파일 선택 영역이 가로 전체

**증상**: 글 작성/수정 폼에서 이미지 파일 선택 input이 컨테이너 전체 너비를 차지함.

**원인**: `ItemForm.tsx`의 `<input type="file">` 가 `flex-col` 컨테이너 안에서 full-width.

**수정**: `<input>` 에 `self-start` 추가.

---

### 버그 C — 영상+이미지 첨부 글 상세에서 캡처 이미지만 표시

**증상**: `type === 'video'` 항목에 이미지도 첨부된 경우, 상세 페이지 헤드에 영상 썸네일 대신 이미지 슬라이더가 표시됨.

**원인**: `ItemDetailPage.tsx`의 `headArea` 계산에서 `imageAttachments.length > 0` 체크가 `type === 'video'` 체크보다 앞에 있어 이미지가 우선 표시됨.

**수정**: headArea 우선순위를 video > image로 변경. video 타입이면 항상 영상 썸네일을 headArea에 표시.

---

### 버그 D — naver.com + YouTube URL 조합 시 상세에서 빈 화면

**증상**: naver.com을 첫 번째 URL, YouTube를 두 번째로 입력 시 상세 페이지 영상 헤드가 회색 빈 화면으로 표시됨.

**원인**: `headArea`에서 `urlAttachments[0]?.value`(= naver.com)로 YouTube 썸네일 시도 → null → 빈 화면.

**수정**: `urlAttachments.find(a => /youtube\.com|youtu\.be/i.test(a.value))?.value` 로 YouTube URL 우선 탐색.

---

### 버그 E — 글 작성 폼 카테고리에 타입 칩 하나만 표시

**증상**: YouTube URL + 이미지 첨부 시 폼 하단에 "영상" 칩만 표시되고 이미지 첨부 여부가 표시되지 않음.

**원인**: `ItemForm.tsx`에서 `detectedType` 기반 단일 칩만 렌더링. 이미지 유무를 별도로 표시하지 않음.

**수정**: 이미지가 첨부된 경우 "캡처" 칩을 추가로 표시.

**변경 파일**:
| 파일 | 변경 |
|------|------|
| `src/pages/ItemDetailPage.tsx` | headArea 우선순위 변경 + YouTube URL 우선 탐색 + `<a>` self-start |
| `src/components/items/ItemForm.tsx` | file input self-start + 이미지 칩 추가 |
