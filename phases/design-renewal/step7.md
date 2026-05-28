# Step 7: new-item-page-renewal

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md` — type 자동 판정 우선순위, Web Share Target 파라미터
- `docs/PRD.md` — Web Share Target 동작, MVP 제외 항목 확인
- `docs/UI_GUIDE.md` — 토큰, 안티패턴 가드레일
- `fix3_design.md` — §4.2 새 항목 명세 전체
- `src/pages/NewItemPage.tsx` — 현재 구현 파악
- `src/components/ui/Button.tsx`, `src/components/ui/Chip.tsx`, `src/components/ui/Textarea.tsx` — step 2에서 생성
- `src/components/ui/BottomSheet.tsx` — step 3에서 생성
- `src/lib/form-type-detect.ts` — 기존 type 자동 판정 로직

## 작업

`src/pages/NewItemPage.tsx`를 fix3_design.md §4.2 기준으로 리뉴얼한다.

### 레이아웃

- **모바일**: BottomSheet 스타일 (화면 하단에서 위로 슬라이드. 단, 실제로 BottomSheet 컴포넌트로 감싸는 방식이 아닌 BottomSheet와 같은 비주얼. 라우트(`/new`)로 접근하므로 페이지 자체가 BottomSheet처럼 보이도록 스타일링)
- **데스크탑**: 중앙 카드 (max-w-480, mx-auto, mt-16, bg-surface, border, rounded-lg, p-24~32)

### 구조

```
┌─ 헤더 ───────────────────────────────────────┐
│  새로운 기록                          [×]     │
└──────────────────────────────────────────────┘

[링크]  [텍스트]  [이미지]  ← 3-grid quick option chip

┌─ Textarea ──────────────────────────────────┐
│  무엇을 기록할까요?                          │
│  (autofocus, min-h-120px)                   │
└─────────────────────────────────────────────┘

─────────────────────────────────────────────
[글 · 자동 감지]                      [저장] →
  ↑ type 자동 판정 결과 chip(읽기 전용)   ↑ primary Button
```

### 기능 요구사항

1. **URL 자동 감지**: textarea 입력 중 URL 패턴 감지 시 → type chip 자동 변경 (기존 `form-type-detect.ts` 활용)
2. **quick option chip**: 링크/텍스트/이미지 클릭 → type 수동 오버라이드
3. **이미지 업로드**: 이미지 quick option 선택 시 파일 input 트리거 → 선택된 이미지 미리보기 표시
4. **태그/폴더 버튼 없음** — PRD 보존
5. **저장 중**: 저장 버튼 spinner + disabled
6. **저장 완료**: Toast "저장됨" 4s + Home으로 navigate
7. **저장 실패**: inline error (textarea 위에 표시)

### Web Share Target 진입 (`/new?title=&text=&url=`)

```tsx
// URL 파라미터 자동 채움
const [searchParams] = useSearchParams();
const sharedTitle = searchParams.get('title') ?? '';
const sharedText  = searchParams.get('text')  ?? '';
const sharedUrl   = searchParams.get('url')   ?? '';
```

- 파라미터 채움 후 type 자동 판정 실행
- **자동 저장 아님** — 확인 화면 유지
- primary 버튼이 즉시 클릭 가능한 위치에 있어야 함 (텍스트 수정 없이 바로 저장 가능)

## Acceptance Criteria

```bash
npm run build
npm run test -- --run
```

빌드 통과, 기존 테스트 회귀 없음. Web Share Target 경로(`?title=&text=&url=`) 진입 시 파라미터 채워지는 회귀 테스트 통과.

## 검증 절차

1. `npm run build && npm run test -- --run`
2. Web Share Target 시나리오 테스트:
   - `?url=https://youtube.com/watch?v=test` → type chip "영상" 자동 감지 확인
   - `?text=메모내용` → type chip "메모" 자동 감지 확인
3. 안티패턴 grep:
   ```bash
   grep -r "border-left\|backdrop-filter\|background-clip" src/pages/NewItemPage.tsx
   grep -r "#000\|#fff" src/pages/NewItemPage.tsx
   ```
   모두 0건
4. 결과에 따라 `phases/design-renewal/index.json`의 step 7 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "NewItemPage 리뉴얼 — BottomSheet 스타일, 3-grid chip, URL 자동 감지, Web Share Target 회귀 테스트 통과"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- 태그 선택, 폴더 선택 UI를 추가하지 마라. 이유: PRD MVP 제외 항목.
- 자동 저장 로직을 추가하지 마라. 이유: PRD에서 확인 화면 유지를 명시함.
- Web Share Target `?title=&text=&url=` 파라미터 처리를 제거하지 마라. 이유: PWA 핵심 기능. 회귀 금지.
- `src/lib/form-type-detect.ts`를 수정하지 마라. 이유: 기존 type 판정 로직을 그대로 쓴다.
- `src/hooks/*`, `src/services/*`를 수정하지 마라. 이유: UI 레이어만 수정.
