# Step 16: dark-mode-check

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/UI_GUIDE.md` — 다크 모드 토큰, 그림자 없음 원칙
- `fix3_design.md` — §1 다크 모드 결정(시스템 따라가기), §2 다크 토큰, §3 금지사항
- `src/index.css` — step 1에서 갱신된 @media/dark 토큰, step 11에서 추가된 .dark 클래스 오버라이드

## 작업

다크 모드에서 모든 페이지의 시각적 품질을 점검하고 회귀 없이 동작하도록 보완한다.

### 점검 체크리스트

`src/index.css`에 두 가지 다크 모드 진입 경로가 모두 동작해야 한다:

**1. 시스템 자동 (기본):**
```css
@media (prefers-color-scheme: dark) {
  :root { /* 다크 토큰 */ }
}
```

**2. 수동 토글 (Settings 테마 선택):**
```css
.dark {
  --bg: #131313;
  /* ... 나머지 토큰 */
  --shadow-card: none;
  --shadow-overlay: none;
  --shadow-modal: none;
}
```

두 경로 모두 동일한 CSS 변수를 덮어써야 한다. 중복을 피하려면 CSS 변수를 `@layer base`에 집중시킨다.

### 페이지별 다크 모드 점검 항목

각 페이지에서 확인:
- [ ] 배경 `var(--bg)` 적용 여부
- [ ] 카드 `var(--surface)`, 테두리 `var(--border)` 적용 여부
- [ ] 텍스트 `var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)` 적용 여부
- [ ] 그림자 없음 (`--shadow-card: none` 확인)
- [ ] Skeleton 색상 (`bg-surface-sub`) 다크에서 정상 표시 여부
- [ ] BottomSheet/Modal 배경 다크 토큰 적용 여부
- [ ] Toast 다크 토큰 적용 여부
- [ ] BottomNav/TopAppBar 다크 토큰 적용 여부

### 하드코딩 색상 검사

```bash
grep -r "bg-white\|bg-gray\|bg-slate\|text-black\|text-white" src/
```

발견 시 `bg-surface`, `bg-bg`, `text-text-primary` 등 토큰으로 교체.

### 라이트/다크 전환 테스트

```bash
npm run dev
```

DevTools → 브라우저 다크 모드 에뮬레이션 (Chrome: DevTools > Rendering > Emulate CSS media feature prefers-color-scheme: dark)으로 모든 페이지 확인.

## Acceptance Criteria

```bash
npm run build
npm run test -- --run
node scripts/check-antipatterns.mjs
```

모두 통과. 모든 페이지에서 라이트/다크 전환 시 텍스트·배경·경계선이 올바른 토큰 색상으로 표시됨.

## 검증 절차

1. `npm run build && npm run test -- --run && node scripts/check-antipatterns.mjs`
2. 하드코딩 색상 grep → 0건 확인:
   ```bash
   grep -r "bg-white\|bg-gray-[0-9]\|text-black\|text-white" src/
   ```
3. 결과에 따라 `phases/design-renewal/index.json`의 step 16 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "다크 모드 전수 점검 — 하드코딩 색상 제거, 시스템/.dark 두 경로 모두 동작, 그림자 없음 확인"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- 다크 모드에서 그림자를 사용하지 마라. 이유: fix3_design.md 결정 — 다크에서 그림자 없음.
- 글래스모피즘, blur를 다크 모드 전용으로 추가하지 마라. 이유: 동일 안티패턴.
- 다크 모드 토큰에 chromatic accent를 추가하지 마라. 이유: 라이트와 동일하게 모노톤 유지.
- `src/services/*`, `src/hooks/*`를 수정하지 마라. 이유: CSS/스타일 레이어만 수정한다.
