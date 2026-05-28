# Step 9: mobile-gestures

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md` — items 테이블 스키마 (status enum: pending/reviewed/archived)
- `docs/UI_GUIDE.md` — 안티패턴 가드레일
- `fix3_design.md` — §4.1 인터랙션 명세 (스와이프, 길게 누르기, 데스크탑 hover 메뉴)
- `src/components/items/ItemCard.tsx` (또는 dispatch 파일) — step 6에서 수정된 파일
- `src/components/ui/BottomSheet.tsx` — step 3에서 생성
- `src/hooks/` — status 변경 mutation 훅 파악
- `src/components/ui/Toast.tsx` (또는 useToast) — step 3에서 생성

## 작업

카드 인터랙션 3가지를 구현한다: 모바일 스와이프, 모바일 길게 누르기 BottomSheet, 데스크탑 hover ⋯ 메뉴.

### 1. 스와이프 status 토글 (모바일)

**트리거**: 카드를 좌→우로 스와이프 (threshold: 80px 이상)

**동작:**
- status 순환: `pending → reviewed → archived → pending`
- 즉시 낙관적 업데이트 (status mutation 호출)
- undo toast: "상태 변경됨 · 되돌리기" (4s)
- undo 클릭 시 이전 status로 되돌림

**구현 방식:**
- `onTouchStart`, `onTouchMove`, `onTouchEnd` 이벤트 직접 처리 (라이브러리 없이)
- 스와이프 중 카드 translateX로 시각적 피드백 (최대 120px, ease-out)
- threshold 미달 시 원위치 복원

### 2. 길게 누르기 BottomSheet (모바일)

**트리거**: 카드를 500ms 이상 누름 (pointerdown → 500ms 후 실행)

**BottomSheet 내용:**
```
─── [핸들] ────────────────────
  수정                    ✎
  공유                    ↗
  ─────────────────────────
  상태 변경:
  [안봤음] [봤음] [보관]
  ─────────────────────────
  삭제                   🗑  ← error color
```

- 수정: `/items/:id` 수정 모드로 이동
- 공유: Web Share API (`navigator.share`) 호출, 미지원 시 URL 복사 fallback
- 상태 변경: 탭 클릭 즉시 적용 + BottomSheet 닫힘
- 삭제: BottomSheet 닫힘 → step 8에서 구현한 ConfirmDialog 열기

### 3. 데스크탑 hover ⋯ 메뉴

**트리거**: 카드 우상단 hover 시 `⋯` 아이콘 표시

**메뉴 내용** (dropdown, shadow-overlay):
- 수정
- 공유 (URL 복사)
- 삭제 (error color)

- 카드 밖 클릭 시 닫힘 (`onBlur` 또는 외부 클릭 감지)

### 구현 위치

- 스와이프/길게 누르기 로직은 각 변형 카드(MemoCard, VideoCard 등) 내부 또는 공통 hook(`useCardGestures`)으로 추출
- 데스크탑 메뉴는 공통 `CardMenu.tsx` 컴포넌트 신설 추천

## Acceptance Criteria

```bash
npm run build
npm run test -- --run
```

빌드 통과, 기존 테스트 회귀 없음. `@testing-library/user-event` pointer events 테스트로 스와이프 threshold 및 길게 누르기 500ms 시나리오 확인.

## 검증 절차

1. `npm run build && npm run test -- --run`
2. 스와이프 테스트:
   - 80px 미만 → status 변경 없음 확인
   - 80px 이상 → status 순환 및 toast 확인
3. 길게 누르기 테스트: 500ms pointerdown → BottomSheet open 확인
4. 결과에 따라 `phases/design-renewal/index.json`의 step 9 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "스와이프 status 토글, 길게 누르기 BottomSheet, 데스크탑 hover 메뉴 구현 완료"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- `react-swipeable` 등 외부 제스처 라이브러리를 추가하지 마라. 이유: touch 이벤트로 직접 구현해도 충분하고 번들 크기 증가를 피한다.
- 스와이프 중 layout 속성(width, height, margin, padding)을 애니메이션하지 마라. 이유: UI_GUIDE.md 모션 규칙 — transform만 사용.
- 길게 누르기 BottomSheet에서 삭제를 바로 실행하지 마라. 이유: ConfirmDialog 없이 파괴적 액션 금지.
- `src/hooks/*`, `src/services/*`를 수정하지 마라. 이유: UI/제스처 레이어만 추가한다.
