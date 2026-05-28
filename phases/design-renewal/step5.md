# Step 5: home-page-renewal

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md`
- `docs/UI_GUIDE.md` — 토큰, 타이포, 안티패턴 가드레일
- `fix3_design.md` — §4.1 Home 페이지 명세 전체
- `src/pages/HomePage.tsx` — 현재 구현 파악
- `src/components/ui/TopAppBar.tsx` — step 3에서 생성
- `src/components/ui/BottomNav.tsx` (또는 `src/components/nav/BottomNav.tsx`) — step 3에서 생성
- `src/components/ui/EmptyState.tsx` — step 3에서 생성
- `src/components/ui/Skeleton.tsx` — step 2에서 생성
- `src/components/FilterBar.tsx` — 기존 파일 (리뉴얼 대상)
- `src/hooks/` — TanStack Query 훅 파악

## 작업

`src/pages/HomePage.tsx`와 `src/components/FilterBar.tsx`(또는 `src/components/filters/FilterBar.tsx`)를 리뉴얼한다.

### HomePage 레이아웃

```
┌─ TopAppBar (h-16, sticky top-0) ──────────────┐
│ ≡  Check Later                        👤       │
└───────────────────────────────────────────────┘
┌─ FilterBar (sticky, 바로 아래) ───────────────┐
│ [전체] [영상] [글] [캡처] [메모]  │ [안봤음] … │
└───────────────────────────────────────────────┘
┌─ 본문 (max-w-800, mx-auto, px-4 md:px-6) ───┐
│  <ItemCard /> (gap-y-6)                       │
│  <ItemCard />                                 │
│  ...                                          │
└───────────────────────────────────────────────┘
┌─ BottomNav (h-16, fixed bottom-0) ────────────┐
```

- `bg-bg` 전체 배경
- 카드 피드: `flex flex-col gap-6`
- 하단 BottomNav 높이만큼 `pb-16` 패딩 추가

### FilterBar 리뉴얼

`src/components/filters/FilterBar.tsx` (또는 기존 경로 유지):

- type 칩 4개: 영상 / 글 / 캡처 / 메모 + "전체" (Chip variant="type")
- status 칩 3개: 안봤음 / 봤음 / 보관 (Chip variant="status")
- 가로 스크롤 가능 (`overflow-x-auto`, 스크롤바 숨김)
- 선택된 칩은 `active` prop으로 강조

### 상태별 처리

- **로딩**: `<Skeleton />` 카드 3개 (혼합 높이로 자연스럽게)
- **빈 목록 (필터 없음)**: `<EmptyState title="아직 저장한 것이 없어요" description="공유 메뉴에서 던지거나 + 버튼으로 적어보세요" action={{ label: "새로 추가", onClick: () => navigate('/new') }} />`
- **빈 목록 (필터 적용)**: `<EmptyState title="조건에 맞는 것이 없어요" action={{ label: "필터 초기화", onClick: clearFilters }} />`
- **에러**: 카드 목록 상단에 inline error banner (EmptyState 아님)

### ItemCard 임시 처리

이 step에서는 기존 `ItemCard`를 그대로 사용한다. 타입별 변형 카드(MemoCard/VideoCard 등)는 step 6에서 구현한다.

## Acceptance Criteria

```bash
npm run build
npm run test -- --run
```

빌드 통과, 기존 테스트 전부 통과.

## 검증 절차

1. `npm run build && npm run test -- --run` 실행
2. 안티패턴 grep:
   ```bash
   grep -r "border-left\|backdrop-filter\|background-clip.*text" src/pages/HomePage.tsx src/components/filters/
   grep -r "#000\|#fff" src/pages/HomePage.tsx src/components/filters/
   ```
   모두 0건
3. 결과에 따라 `phases/design-renewal/index.json`의 step 5 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "HomePage 리뉴얼 — TopAppBar/FilterBar/BottomNav 적용, 3가지 상태(로딩/빈/에러) 처리 완료"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- FilterBar에 Search 입력창을 추가하지 마라. 이유: PRD MVP 제외 항목.
- FilterBar에 태그 또는 자유 폴더 선택 UI를 추가하지 마라. 이유: PRD 보존.
- TopAppBar와 BottomNav를 이 step에서 처음 구현하지 마라. 이유: step 3에서 이미 구현된 컴포넌트를 가져다 쓴다.
- 기존 `src/hooks/*`, `src/stores/*`의 로직을 변경하지 마라. 이유: UI 레이어만 수정한다.
