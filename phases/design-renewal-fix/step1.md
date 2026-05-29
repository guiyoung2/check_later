# Step 1: login-copy

## 읽어야 할 파일

- `fix5.md` — §2-C(로그인 페이지 회원가입 제거)
- `src/pages/LoginPage.tsx` — 현재 로그인 화면
- `src/pages/LoginPage.test.tsx` — 유지/갱신할 테스트 계약
- `docs/PRD.md` — 인증은 Google OAuth 단일(이메일/회원가입 없음)

## 작업

`src/pages/LoginPage.tsx`의 **카피만** 수정한다(동작 무변경).

- 현재 "로그인 / 회원가입" 표기를 제거한다. 우리 서비스는 **Google OAuth 단일**이라 별도 회원가입 개념이 없어 오해를 준다.
- 정리안(택1, 자연스러운 쪽으로):
  - 제목 "Check Later" 유지 + 부제는 "로그인" 또는 제거, 핵심은 "Google로 계속하기" 버튼.
  - "로그인 / 회원가입" 줄은 삭제하거나 "로그인"으로 단순화.
- 하단 보조문구("홈 화면에 추가하면…")는 유지해도 됨.

## 핵심 규칙
- Google 로그인 버튼의 동작(`signInWithOAuth`)과 redirect 로직은 **변경 금지**.
- 버튼 라벨 "Google로 계속하기"는 유지(테스트가 이 이름으로 조회할 수 있음 — 확인 후 유지).

## Acceptance Criteria

```bash
npm run build
npm run test
```

빌드·테스트 통과. `LoginPage.test.tsx`에서 "회원가입" 텍스트를 단언하는 부분이 있으면 함께 제거/갱신하라.

## 검증 절차
1. `npm run build && npm run test`
2. `grep -n "회원가입" src/pages/LoginPage.tsx` → 0건
3. `phases/design-renewal-fix/feature_list.json`의 feat-4를 `passes: true`로.
4. `index.json` step 1 상태 갱신(성공/에러).

## 금지사항
- OAuth 호출·redirect·queryParams를 변경하지 마라. 이유: 인증 동작 회귀 금지. 카피만 수정.
- 새 로그인 수단(이메일 등)을 추가하지 마라. 이유: PRD에서 Google 단일로 확정.
- 기존 테스트를 깨뜨리지 마라.
