# Step 17: a11y-check

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/UI_GUIDE.md` — 안티패턴 가드레일 (터치 타깃 ≥44×44 등)
- `fix3_design.md` — §5 체크리스트 중 a11y 관련 항목
- `src/components/ui/` — step 2, 3에서 생성된 원자 컴포넌트들
- `src/components/items/` — step 6에서 생성된 카드 컴포넌트들

## 작업

접근성(a11y) 기준을 전수 점검하고 미비한 부분을 보완한다.

### 점검 체크리스트

**키보드 네비게이션:**
- [ ] 모든 인터랙티브 요소(버튼, 링크, 카드)가 Tab으로 접근 가능
- [ ] Enter/Space로 버튼/카드 클릭 가능
- [ ] Escape로 BottomSheet/Modal 닫힘
- [ ] BottomSheet 열릴 때 포커스가 내부로 이동 (focus trap)

**focus ring:**
- [ ] `focus-visible` 상태에서 `ring-2 ring-border-strong` 표시
- [ ] `:focus:not(:focus-visible)` 에서 outline 숨김 (마우스 클릭 시 ring 없음)

**ARIA:**
- [ ] `<IconButton>`에 `aria-label` 필수 (step 2에서 시그니처에 required로 명시)
- [ ] BottomSheet에 `role="dialog"`, `aria-modal="true"`, `aria-labelledby` 적용
- [ ] BottomNav 탭에 `aria-current="page"` (active 탭)
- [ ] Skeleton에 `aria-busy="true"` 또는 `aria-label="로딩 중"` 또는 `role="status"`
- [ ] EmptyState에 적절한 heading 구조
- [ ] 카드 클릭 영역에 `role="button"` 또는 `<a>`/`<button>` 래퍼 사용

**색 대비 WCAG AA:**
- `--text-primary`(#080603) on `--bg`(#F7F7F4): 대비 확인
- `--text-secondary`(#49473F) on `--bg`: 4.5:1 이상 필요
- `--text-muted`(#605E58) on `--bg`: 본문용 아닌 label이므로 3:1 이상이면 허용
- 다크 모드에서도 동일 기준 적용

대비 계산: DevTools 또는 https://webaim.org/resources/contrastchecker/

**이미지 대체 텍스트:**
- [ ] 카드 이미지에 `alt` 속성 (item.title 또는 "섬네일 이미지")
- [ ] 장식용 이미지(아이콘)는 `alt=""` 또는 `aria-hidden="true"`

**터치 타깃:**
- [ ] 모든 버튼, 탭, 카드 클릭 영역 ≥ 44×44px
- [ ] `min-h-[44px]` 또는 `min-w-[44px]` 적용 여부 grep:
  ```bash
  grep -r "IconButton\|BottomNav.*tab" src/ --include="*.tsx"
  ```

### 보완 방법

발견된 a11y 문제를 각 컴포넌트 파일에서 직접 수정한다. 별도 wrapper 컴포넌트 신설은 피한다.

## Acceptance Criteria

```bash
npm run build
npm run test -- --run
```

빌드 통과, 테스트 회귀 없음. 위 체크리스트 항목을 코드에서 grep으로 확인 가능.

## 검증 절차

1. `npm run build && npm run test -- --run`
2. ARIA grep 확인:
   ```bash
   grep -r "aria-label" src/components/ui/IconButton.tsx  # 반드시 존재
   grep -r "role=\"dialog\"" src/components/ui/BottomSheet.tsx  # 반드시 존재
   grep -r "aria-current=\"page\"" src/  # BottomNav에 존재
   ```
3. 색 대비 수동 확인 (DevTools 또는 외부 도구)
4. 결과에 따라 `phases/design-renewal/index.json`의 step 17 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "a11y 전수 점검 — focus ring, ARIA 레이블, 키보드 네비, 색 대비 WCAG AA, 터치 타깃 ≥44px 보완 완료"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- a11y를 위해 `tabIndex={0}`을 `<div>`에 남용하지 마라. 이유: 네이티브 `<button>` 또는 `<a>` 사용이 우선. div에 onClick을 넣어야 할 경우에만 tabIndex 추가.
- `outline: none`을 전역으로 제거하지 마라. 이유: focus ring을 완전히 숨기면 키보드 사용자가 현재 위치를 알 수 없다. `focus-visible` 방식으로 제어.
- 색 대비 문제를 해결하기 위해 토큰 값을 임의로 수정하지 마라. 이유: 컬러 시스템 결정은 step 0-1에서 확정됨. 문제가 있으면 사용자에게 먼저 보고할 것.
