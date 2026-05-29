# Step 3: settings-remove-theme

## 읽어야 할 파일

- `fix5.md` — §2-E(설정 THEME 섹션 제거)
- `src/pages/SettingsPage.tsx` — 현재 설정(ACCOUNT/APP/THEME/DATA 섹션). THEME는 system/light/dark 3-옵션
- `src/pages/SettingsPage.test.tsx` — "테마 세그먼트 선택" 테스트가 있음 → 함께 제거/수정 필요
- `src/lib/theme.ts` — 공용 테마 모듈(토글이 사용). 부트스트랩은 `main.tsx`가 담당
- `src/components/ThemeToggleButton.tsx` — 테마 변경은 이제 토글이 담당(랜딩+홈 헤더)

## 작업

`src/pages/SettingsPage.tsx`에서 **THEME 섹션을 제거**한다. 테마 변경 수단은 랜딩/홈 헤더의 토글로 일원화됐으므로 설정의 3-옵션은 중복이다.

제거 대상:
- THEME `<section>`(SectionHeader "THEME" + 3-세그먼트 토글 UI)
- 그와만 연결된 state/effect/상수: `theme` state, 테마 적용 `useEffect`, `themeOptions`, 그리고 `lib/theme`에서 THEME 섹션 전용으로만 쓰던 import(`applyThemePreference`, `getStoredTheme`, `setThemePreference`, `ThemePreference`).

남기는 것:
- ACCOUNT / APP / DATA 섹션과 그 동작(로그아웃, 설치, 항목 수)은 그대로 유지.

## 핵심 규칙
- `src/lib/theme.ts`, `src/main.tsx`, `ThemeToggleButton.tsx`는 **수정하지 않는다**. 이유: 테마 부트스트랩/토글 동작은 그대로 유지돼야 함. 이 step은 설정 페이지에서 UI만 제거.
- THEME 제거로 'system' 자동추종 선택지는 UI에서 사라진다(부트스트랩 기본값으로만 존재). 이는 fix5 §5에서 확정된 결정.

## Acceptance Criteria

```bash
npm run build
npm run test
```

빌드·테스트 통과. `SettingsPage.test.tsx`의 "테마 세그먼트 선택에 따라 documentElement class를 토글한다" 테스트는 **제거**한다(THEME UI가 사라지므로). 나머지 설정 테스트(로그아웃, 항목 수, 설치)는 통과 유지.

## 검증 절차
1. `npm run build && npm run test`
2. `grep -n "THEME\|themeOptions\|setTheme(" src/pages/SettingsPage.tsx` → THEME 관련 0건
3. 미사용 import가 남지 않았는지 확인(lint).
4. `phases/design-renewal-fix/feature_list.json`의 feat-6을 `passes: true`로.
5. `index.json` step 3 상태 갱신. 이 step 완료 시 phase 전체 완료.

## 금지사항
- `lib/theme.ts`/`main.tsx`/`ThemeToggleButton.tsx`를 수정하지 마라. 이유: 토글·부트스트랩 회귀 금지.
- ACCOUNT/APP/DATA 섹션 동작을 변경하지 마라. 이유: 범위 밖.
- 기존(테마 외) 테스트를 깨뜨리지 마라.
