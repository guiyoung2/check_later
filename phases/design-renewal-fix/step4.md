# Step 4: filter-chips

## 읽어야 할 파일

- `fix5.md` — §2-F(필터 칩 가독성/부드러움), §5(잔여 결정: 칩 코너)
- `docs/UI_GUIDE.md` — 토큰, Chip 스펙(타이포 스케일/radius)
- `src/components/ui/Chip.tsx` — 현재 칩(type=`rounded-xs` mono 12px, status=`rounded-full`, active는 fill `bg-text-primary text-bg`)
- `src/components/FilterBar.tsx` — 칩 사용처(유형/상태 그룹)
- `src/components/FilterBar.test.tsx` — aria-pressed/클릭 동작 계약(유지)
- `src/components/ui/AtomicComponents.test.tsx` — Chip 단위 테스트(`rounded-xs`, `font-mono`, `text-[12px]`, aria-pressed 단언 — 변경 시 함께 갱신)

## 작업

`Chip.tsx`(필요 시 `FilterBar.tsx`)를 손봐 222.png의 "딱딱한 네모 박스, 글자 얇음" 인상을 완화한다.

개선 포인트:
1. **코너 일관화/부드럽게**: type 칩의 `rounded-xs`(2px, 각짐)를 완화. type/status 칩 코너를 일관되게(전부 `rounded-full` 또는 전부 `rounded-sm` — fix5 §5-4 미결이면 `rounded-full`로 통일 권장).
2. **가독성**: 글자 크기/두께 보강(예: 12→13px, weight 보강). type 칩이 mono라 얇아 보이면 본문 폰트 고려.
3. **터치/패딩**: 44×44 유지하되 패딩·정렬 정돈.
4. active(fill)/inactive 대비는 이미 양호 → 과하게 바꾸지 말 것.

## 핵심 규칙
- 칩의 동작 계약 유지: 인터랙티브 칩은 `<button>`, `aria-pressed`, `onClick` 유지. 라벨 칩은 `<span>` 유지.
- active 강조는 fill 모델(`bg-text-primary text-bg`) 유지(색 accent 추가 금지).

## Acceptance Criteria

```bash
npm run build
npm run test
```

빌드·테스트 통과. `Chip` 클래스 단언을 바꿨다면 `AtomicComponents.test.tsx`도 함께 갱신해 통과시킨다. `FilterBar.test.tsx`(aria-pressed/클릭) 회귀 없음.

## 검증 절차
1. `npm run build && npm run test`
2. 안티패턴 grep: `grep -nE "background-clip|backdrop-filter|border-left:" src/components/ui/Chip.tsx src/components/FilterBar.tsx` → 0건
3. `phases/design-renewal-fix/feature_list.json`의 feat-7을 `passes: true`로.
4. `index.json` step 4 상태 갱신.

## 금지사항
- 필터 로직(`filterStore`, 적용 방식)을 변경하지 마라. 이유: 시각/가독성만 다룸.
- 새 chromatic accent 토큰 추가 금지. 이유: 모노톤 유지.
- 기존 테스트를 깨뜨리지 마라(단언 클래스 변경 시 테스트 동반 갱신은 허용).
