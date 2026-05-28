# Step 8: item-detail-page-renewal

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md` — items 테이블 스키마, 라우트 구조
- `docs/UI_GUIDE.md` — 토큰, 타이포, 안티패턴 가드레일
- `fix3_design.md` — §4.3 상세 페이지 명세 전체
- `src/pages/ItemDetailPage.tsx` — 현재 구현 파악
- `src/components/ui/` — step 2, 3에서 생성된 컴포넌트 목록 확인
- `src/hooks/` — 상세 조회 훅, 상태 변경 mutation 훅 파악

## 작업

`src/pages/ItemDetailPage.tsx`를 fix3_design.md §4.3 기준으로 리뉴얼한다.

### 레이아웃

```
┌─ sticky 헤더 ────────────────────────────────┐
│ ← Back                         공유 수정 🗑  │
└──────────────────────────────────────────────┘

[type별 헤드 영역]

meta: [글] · 2026-03-12 · 안봤음

제목 (display 32px, weight 600)

https://example.com ↗  ← URL (있으면, mono font, 밑줄)

────────────────────────────────────────────────

┌─ 메모 섹션 (bg-surface, border, p-6~8) ─────┐
│  메모 내용...                                │
└──────────────────────────────────────────────┘

[안봤음] [봤음] [보관]  ← 3-segment status toggle
```

### 타입별 헤드 영역

- **video**: `aspect-video` 섬네일 + play overlay + duration badge(우하단, label-mono)
- **screenshot (image)**: full-width 이미지 (height auto, `max-h-[70vh]`, object-contain)
- **article**: 없음 (메타 영역만)
- **memo**: 없음

### 구현 상세

**sticky 헤더:**
- `← Back`: `useNavigate(-1)` 또는 Home으로 이동
- 수정 아이콘: 클릭 시 수정 모드 진입 (또는 edit 모달)
- 삭제 아이콘: `color: var(--error)`, 클릭 시 ConfirmDialog

**ConfirmDialog (삭제 확인):**
- 모달 형태 (`shadow-modal`, `rounded-lg(8px)`)
- "정말 삭제할까요?" + 취소/삭제 버튼
- 확인 → 삭제 API 호출 → Home으로 + Toast "삭제됨 · 되돌리기" (undo 4s)

**메모 섹션:**
- `blockquote` 사용 금지 — 단순 `<p>` + `<ul>` + `<pre>` 만 사용
- 수정 버튼은 헤더의 수정 아이콘으로 통합, 메모 섹션에 별도 버튼 없음
- 메모가 없으면 섹션 숨김 (또는 "메모 없음" placeholder)

**status 3-segment toggle:**
- 안봤음(pending) / 봤음(reviewed) / 보관(archived) 3개 세그먼트
- 현재 status를 강조 (filled/active state)
- 클릭 시 즉시 API 호출 + 낙관적 업데이트

## Acceptance Criteria

```bash
npm run build
npm run test -- --run
```

빌드 통과, 기존 테스트 회귀 없음. ConfirmDialog 삭제 시나리오 테스트 추가 및 통과.

## 검증 절차

1. `npm run build && npm run test -- --run`
2. 안티패턴 grep:
   ```bash
   grep -r "blockquote" src/pages/ItemDetailPage.tsx
   grep -r "border-left\|backdrop-filter\|background-clip" src/pages/ItemDetailPage.tsx
   grep -r "#000\|#fff" src/pages/ItemDetailPage.tsx
   ```
   모두 0건
3. 결과에 따라 `phases/design-renewal/index.json`의 step 8 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "ItemDetailPage 리뉴얼 — sticky 헤더, type별 헤드, status 3-segment, blockquote 제거, ConfirmDialog 추가"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- `blockquote` 또는 `border-left` side-stripe를 메모 섹션에 사용하지 마라. 이유: 안티패턴. 단순 `<p>` + `<ul>` 사용.
- 삭제를 ConfirmDialog 없이 처리하지 마라. 이유: 파괴적 액션은 반드시 확인 단계 필요.
- status toggle을 BottomSheet나 dropdown으로 구현하지 마라. 이유: fix3_design.md에서 3-segment toggle로 명시함.
- `src/hooks/*`, `src/services/*`를 수정하지 마라. 이유: UI 레이어만 수정한다.
