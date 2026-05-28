# Step 12: login-landing-renewal

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md` — Supabase Auth, 라우트 구조
- `docs/PRD.md` — Google OAuth 전용, 이메일 로그인 제외 확인
- `docs/UI_GUIDE.md` — 토큰, 타이포, 안티패턴 가드레일
- `fix3_design.md` — §4.6 Login & Landing 명세 전체
- `src/pages/LoginPage.tsx` — 현재 구현 파악
- `src/pages/LandingPage.tsx` — 현재 구현 파악 (폐기 또는 단순화 대상)
- `src/components/ui/Button.tsx` — step 2에서 생성
- `src/lib/supabase.ts` (또는 auth client) — Google OAuth 호출 방식 파악

## 작업

`src/pages/LoginPage.tsx`와 `src/pages/LandingPage.tsx`를 리뉴얼한다.

### LoginPage

**레이아웃 (중앙 카드, max-w-400, `bg-surface`, border, rounded-lg):**

```
                  [Check Later]
               로그인 / 회원가입
          조용한 메모 도구 ← body-sm text-muted

  ┌─────────────────────────────────────────┐
  │  G  Google로 계속하기                   │  ← secondary Button
  └─────────────────────────────────────────┘

      홈 화면에 추가하면 더 빠르게 쓸 수 있어요  ← text-xs muted
```

- 워드마크 "Check Later": headline 24px, weight 600
- Google OAuth 버튼: `<Button variant="secondary">` + Google 로고 (SVG) + "Google로 계속하기"
- 이메일 로그인 UI 없음 (PRD: Google OAuth 전용)
- 화면 중앙 수직 정렬 (`min-h-screen flex items-center justify-center`)
- PWA 설치 안내: 하단 소형 텍스트 (`text-sm text-muted`)

### LandingPage (비로그인 `/` 접근 시)

**현재 `LandingPage.tsx`를 단순화:**

```
┌─ 1 viewport (min-h-screen) ─────────────────┐
│                                              │
│                                              │
│  공유 한 번이면 끝,                          │  ← display 32px (모바일 26px)
│  30초 안에 찾는다                            │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  저장    │  │  분류    │  │  조회    │   │  ← 3-grid
│  │ 공유 메뉴│  │ 유형·상태│  │ 필터+정렬│   │
│  │ 한 번으로│  │ 자동분류 │  │ 30초 내  │   │
│  └──────────┘  └──────────┘  └──────────┘   │
│                                              │
│           [시작하기 →]                        │  ← primary Button → /login
│                                              │
└──────────────────────────────────────────────┘
```

- 3-grid: 텍스트 중심 (아이콘 optional)
- 하단 CTA "시작하기 →": `/login`으로 navigate
- 배경: `bg-bg`, 텍스트: `text-primary`

### 라우팅 로직

비로그인 상태에서 `/` 접근:
- 현재 `ProtectedRoute`가 `/login`으로 redirect하는지, 또는 LandingPage를 보여주는지 확인
- fix3_design.md에서는 Landing이 별도. 필요시 `App.tsx`에서 비로그인 `/` → LandingPage, 로그인 `/` → HomePage로 분기

## Acceptance Criteria

```bash
npm run build
npm run test -- --run
```

빌드 통과, 비로그인/로그인 분기 정상 동작 확인.

## 검증 절차

1. `npm run build && npm run test -- --run`
2. 비로그인 상태 분기 테스트:
   - 비인증 사용자 `/` 접근 → LandingPage 또는 `/login` 리다이렉트 정상 확인
3. 안티패턴 grep:
   ```bash
   grep -r "border-left\|backdrop-filter\|background-clip" src/pages/LoginPage.tsx src/pages/LandingPage.tsx
   grep -r "#000\|#fff" src/pages/LoginPage.tsx src/pages/LandingPage.tsx
   ```
   모두 0건
4. 결과에 따라 `phases/design-renewal/index.json`의 step 12 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "LoginPage 중앙 카드 스타일, LandingPage 1-viewport 단순화 완료, 비로그인 분기 정상"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- 이메일/비밀번호 로그인 UI를 추가하지 마라. 이유: PRD에서 Google OAuth만 지원.
- 그라디언트 텍스트, blur, 글래스 효과를 Landing에 추가하지 마라. 이유: 안티패턴.
- Landing에 다수의 섹션(Hero + Features + Pricing 등)을 추가하지 마라. 이유: 1 viewport 짜리 단순 소개로 명시됨.
- `src/lib/supabase.ts` 또는 인증 관련 코드를 수정하지 마라. 이유: UI 레이어만 수정.
