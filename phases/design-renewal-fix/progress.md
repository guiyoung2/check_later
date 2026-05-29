# design-renewal-fix 진행 현황

## 마지막 업데이트
2026-05-29T11:24:53+0900 — Step 5/9 완료

## 완료된 작업
- Step 0: landing-redesign — LandingPage: 헤더 우상단 Login 버튼 추가, 히어로 2칼럼(텍스트+MiniPreview 목업), 카피 교체, 테스트 갱신. 빌드·68 테스트 통과.
- Step 1: login-copy — LoginPage: '로그인 / 회원가입' 문단 제거(Google OAuth 단일 반영). 동작 무변경. 빌드·68 테스트 통과.
- Step 2: home-header-theme — HomePage TopAppBar rightAction에 ThemeToggleButton 추가(계정 아이콘 왼쪽). 빌드·68 테스트 통과.
- Step 3: settings-remove-theme — SettingsPage에서 THEME 섹션·theme state·effect·themeOptions·joinClasses·lib/theme import 제거, 테마 테스트 1건 제거. 빌드·67 테스트 통과.
- Step 4: filter-chips — Chip.tsx type 변형: rounded-xs→rounded-full, font-mono text-[12px]→font-body text-[13px]로 type/status 일관화. AtomicComponents.test.tsx 단언 동반 갱신. 빌드·67 테스트 통과.

## 현재 진행 중
- Step 5: feed-card-redesign

## 다음 할 일
- 피드 카드를 컴팩트 리스트 행(좌측 소형 썸네일 + 제목/메타)으로 재설계
- 썸네일 object-cover → 크롭 최소화 방향 검토
- ItemCard.tsx 제스처(스와이프/롱프레스/메뉴) 회귀 없음 반드시 확인
- 카드 관련 테스트 회귀 없음 확인

## 주의사항
- step 0에서 `MiniPreview`가 `LandingPage.tsx` 내부 함수로 정의됨 (별도 파일 아님). 외부 재사용 불필요.
- `ThemeToggleButton`은 `useState(isDarkActive)` 초기값에 `isDarkActive`(함수 레퍼런스)를 사용하므로 테스트 환경에서 초기값이 false로 잡힌다. ThemeToggleButton 관련 테스트 시 주의.
- 헤더 Login 버튼은 `variant="ghost" size="sm"` 사용. 접근성 name은 "Login"(children 텍스트).
- HomePage에서 `rightAction`을 `<div className="flex items-center">` 래퍼로 묶어 두 컨트롤을 가로 배치했다.
- 테마 변경 수단은 랜딩/홈 헤더 토글로 일원화됨. 'system' 자동추종 선택지는 UI에서 사라지고 부트스트랩 기본값으로만 존재.
- `lib/theme.ts`·`main.tsx`·`ThemeToggleButton.tsx`는 step 3에서 수정하지 않음. 테마 부트스트랩/토글 동작 그대로 유지.
- Chip `type` 변형이 `font-mono`에서 `font-body`로 바뀜. `count` 변형은 여전히 `font-mono` 유지(숫자 표시용).
- AtomicComponents.test.tsx의 Chip 단언이 `font-body`, `text-[13px]`, `rounded-full`로 갱신됨 — step 4 이전 단언(`font-mono`, `text-[12px]`, `rounded-xs`)은 더 이상 유효하지 않음.
