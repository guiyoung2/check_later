# Step 2: home-header-theme

## 읽어야 할 파일

- `fix5.md` — §2-D(홈 헤더 테마 토글)
- `src/pages/HomePage.tsx` — 현재 홈. TopAppBar `rightAction`에 `AccountLink`만 있음
- `src/components/ui/TopAppBar.tsx` — `leftAction`/`title`/`rightAction` 슬롯 구조
- `src/components/ThemeToggleButton.tsx` — 재사용할 토글
- `src/pages/HomePage.test.tsx` — banner에 'Check Later' 단언 등 유지할 계약

## 작업

`src/pages/HomePage.tsx`의 TopAppBar `rightAction`을 **`[ThemeToggleButton][AccountLink]`** 순서로 변경한다(테마 토글이 계정 아이콘 **왼쪽**).

- `ThemeToggleButton`을 import해서 `rightAction`에 `AccountLink`보다 앞에 배치한다.
- 두 컨트롤을 가로로 묶되 정렬·간격은 기존 헤더 톤에 맞춘다(예: `flex items-center`).
- 터치 타깃 44×44 유지(ThemeToggleButton은 이미 h-11 w-11).

## 핵심 규칙
- `ThemeToggleButton`을 재사용한다(새 토글 만들지 말 것). 이유: 랜딩/설정과 동일 영속 로직 공유(`src/lib/theme.ts`).
- TopAppBar의 `title="Check Later"`는 유지(테스트가 banner 텍스트로 조회).

## Acceptance Criteria

```bash
npm run build
npm run test
```

빌드·테스트 통과. `HomePage.test.tsx` 회귀 없음.

## 검증 절차
1. `npm run build && npm run test`
2. `phases/design-renewal-fix/feature_list.json`의 feat-5를 `passes: true`로.
3. `index.json` step 2 상태 갱신.

## 금지사항
- 데이터 로딩/필터/피드 로직을 건드리지 마라. 이유: 이 step은 헤더 슬롯 추가만.
- 새 chromatic accent 토큰 추가 금지. 이유: 모노톤 유지.
- 기존 테스트를 깨뜨리지 마라.
