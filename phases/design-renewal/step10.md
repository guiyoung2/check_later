# Step 10: folders-page

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md` — 라우트 구조, items 테이블 스키마 (type/status enum)
- `docs/PRD.md` — 분류 3축 원칙, 자유 폴더 미정의 확인
- `docs/UI_GUIDE.md` — 토큰, 타이포, 안티패턴 가드레일
- `fix3_design.md` — §4.4 Folders 화면 명세 전체
- `src/App.tsx` (또는 라우트 정의 파일) — 라우트 등록 위치 파악
- `src/components/ui/TopAppBar.tsx`, `src/components/ui/BottomNav.tsx` — step 3에서 생성
- `src/hooks/` — items 카운트 조회 방법 파악

## 작업

`src/pages/FoldersPage.tsx`를 신설하고 `/folders` 라우트를 등록한다.

### 레이아웃

```
┌─ TopAppBar ───────────────────────────────────┐
│     Folders                                   │
└───────────────────────────────────────────────┘

Folders
유형과 상태로 정리해서 보세요  ← body-sm text-muted

┌─ 2칼럼 그리드 (모바일) / 3칼럼 (데스크탑) ──┐
│                                               │
│ [전체] ──────────────────── col-span-2(모바일)│
│  총 1,204개                                   │
│                                               │
│ [영상]           [글]                         │
│  42개              198개                      │
│                                               │
│ [캡처]           [메모]                       │
│  31개              933개                      │
│                                               │
│ ── 상태별 ──────────────────────────────────  │
│ [안봤음]         [봤음]         [보관]        │
│  102개             780개          322개       │
│                                               │
└───────────────────────────────────────────────┘

┌─ BottomNav ───────────────────────────────────┘
```

### 그리드 카드 명세

- gap: 24px
- 카드: `bg-surface`, `border border-border`, `rounded-md(6px)`, `p-4`~`p-6`
- 카드 내부: 아이콘 + 카운트(JetBrains Mono label-mono) + 이름(label 13px)
- 카운트 0인 카드: `text-muted` + opacity 60% 스타일 (하지만 클릭 가능)
- "전체" 카드: 모바일에서 `col-span-2`, 데스크탑에서 `col-span-1`

### 클릭 인터랙션

```tsx
// type 카드 클릭 → Home으로 type 필터 적용
const handleTypeCard = (type: ItemType) => navigate(`/?type=${type}`);

// status 카드 클릭 → Home으로 status 필터 적용
const handleStatusCard = (status: ItemStatus) => navigate(`/?status=${status}`);

// 전체 카드 클릭 → Home (필터 없음)
const handleAllCard = () => navigate('/');
```

### 카운트 데이터

기존 `useItems` 훅 또는 별도 `useItemCounts` 훅으로 type별/status별 카운트 가져오기. 가능하면 단일 쿼리로 처리 (모든 items select 후 클라이언트 집계, 또는 Supabase RPC).

### 라우트 등록

`src/App.tsx`에서 `/folders` 라우트를 `ProtectedRoute`로 감싸 추가:

```tsx
<Route path="/folders" element={<ProtectedRoute><FoldersPage /></ProtectedRoute>} />
```

## Acceptance Criteria

```bash
npm run build
npm run test -- --run
```

빌드 통과, 기존 테스트 회귀 없음. `/folders` 라우트 진입 시 type 카드 클릭 → `/?type=video` 이동 동작 확인 테스트.

## 검증 절차

1. `npm run build && npm run test -- --run`
2. 라우트 확인: App.tsx에 `/folders` 경로 존재 여부
3. 안티패턴 grep:
   ```bash
   grep -r "border-left\|backdrop-filter" src/pages/FoldersPage.tsx
   grep -r "#000\|#fff" src/pages/FoldersPage.tsx
   ```
   모두 0건
4. 결과에 따라 `phases/design-renewal/index.json`의 step 10 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "/folders 페이지 신설 — type×status 카운트 그리드, 클릭 시 Home 필터 이동, 라우트 등록 완료"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- "새 폴더" 생성 또는 dashed slot UI를 추가하지 마라. 이유: PRD 보존 — type/status는 고정 분류.
- Search 기능이나 태그 목록을 추가하지 마라. 이유: PRD MVP 제외 항목.
- max-content-width를 800px 이상으로 설정하지 마라. 이유: Folders 그리드만 1200px, 본문 텍스트는 800px 제한.
- `src/services/*`, `src/hooks/*`를 수정하지 마라. 이유: 기존 훅을 읽기만 한다.
