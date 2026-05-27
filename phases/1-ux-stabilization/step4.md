# Step 4: landing-mobile-polish

## 읽어야 할 파일

먼저 아래 파일들을 읽고 랜딩, 모바일, PWA 의도를 파악하라:

- `docs/PRD.md` — 저장/조회 중심 MVP와 PWA 요구사항
- `docs/UI_GUIDE.md` — Warm-Minimal Personal Tool, AI Slop 금지사항
- `docs/ARCHITECTURE.md` — 라우트 목록
- `src/pages/LandingPage.tsx` — 현재 비인증 랜딩
- `src/components/ThemeToggleButton.tsx` — step 1 산출물
- `src/pages/LoginPage.tsx` — 로그인 CTA 연결 대상
- `vite.config.ts` — PWA manifest, Web Share Target
- `phases/1-ux-stabilization/feature_list.json` — 완료 게이트 목록

## 작업

### 1. 랜딩페이지 디자인 보강

`LandingPage`를 현재보다 완성도 있게 개선하라. 단, 과한 마케팅 페이지가 아니라 개인 도구의 첫 화면이어야 한다.

필수 구조:

- 헤더: `Check Later`, `ThemeToggleButton`, 로그인 버튼
- 메인: 저장할 수 있는 대상(URL, 영상, 메모)과 다시 찾는 흐름이 한 화면에서 이해되는 구성
- CTA: `시작하기` 버튼은 `/login`으로 이동
- 보조 정보: PWA/공유 메뉴로 저장할 수 있다는 모바일 사용 맥락을 짧게 보여준다

스타일 규칙:

- `docs/UI_GUIDE.md`의 색상 토큰을 사용한다.
- 그라디언트 텍스트, glassmorphism, 글로우, 큰 통계 숫자, 카드 그리드 남발을 쓰지 않는다.
- 모바일 우선으로 작성하고, 넓은 화면에서는 `max-w`와 간격만 자연스럽게 확장한다.
- 버튼과 아이콘 버튼 터치 타깃은 44px 이상을 유지한다.

### 2. 랜딩 다크모드 토글 적용

`LandingPage` 헤더에 `ThemeToggleButton`을 추가하라. 로그아웃 후 랜딩으로 돌아와도 다크모드가 풀리지 않아야 한다.

### 3. 테스트 추가 또는 갱신

필요하면 `LandingPage.test.tsx`를 추가하라. 최소 확인 항목:

- 로그인 CTA가 존재하고 클릭 시 `/login` 이동 의도를 가진다.
- 다크모드 토글 버튼이 존재하고 클릭 시 `localStorage.theme`과 `html.dark`가 갱신된다.
- 모바일 사용 맥락 문구가 존재한다.

### 4. 모바일/PWA 확인

정적 검증으로 아래를 확인하라:

- `vite.config.ts`의 `display: 'standalone'`, `start_url: '/'`, `scope: '/'`, `share_target.action: '/new'`가 유지된다.
- 랜딩과 홈의 주요 버튼 높이가 44px 이상이다.
- 작은 화면 폭에서 헤더 액션과 텍스트가 겹치지 않도록 Tailwind 클래스가 구성되어 있다.

가능하면 로컬에서 `npm run build` 후 `npm run preview` 또는 `npm run dev`로 모바일 폭을 확인하라. execute.py 환경에서 장시간 서버 실행이 어렵다면 코드와 테스트 기반 확인만 수행하고, `progress.md` 주의사항에 수동 확인 방법을 남겨라.

## Acceptance Criteria

```bash
npm run build
npm test
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 랜딩페이지가 UI_GUIDE 금지 패턴을 쓰지 않는지 확인한다.
3. 랜딩의 테마 토글이 `feat-3`의 유지 정책과 같은 방식으로 동작하는지 확인한다.
4. PWA manifest의 standalone/share_target 설정이 유지되는지 확인한다.
5. `phases/1-ux-stabilization/index.json`의 step 4를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "랜딩페이지 디자인 보강, 랜딩 테마 토글 추가, 모바일/PWA 설정 확인"`
   - 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
6. `phases/1-ux-stabilization/feature_list.json`에서 `feat-4`, `feat-8`, `feat-9`를 통과 처리한다.
7. 모든 feature가 `passes: true`인지 확인한다.
8. `phases/1-ux-stabilization/progress.md`의 다음 할 일과 주의사항을 최종 상태로 갱신한다.

## 금지사항

- 랜딩을 제품 마케팅용 히어로 페이지처럼 과장하지 마라. 이유: 이 앱은 개인용 저장 도구이고 UI_GUIDE는 도구가 배경으로 사라지는 방향을 요구한다.
- 새 이미지 에셋이나 외부 폰트 패키지를 추가하지 마라. 이유: 랜딩 보강은 현재 디자인 토큰과 텍스트/레이아웃만으로 충분하다.
- 카드 안에 카드를 중첩하지 마라. 이유: UI가 무거워지고 모바일에서 정보가 답답해진다.
- PWA share_target 또는 Supabase 인증 설정을 변경하지 마라. 이유: 이 step의 범위 밖이다.
- 기존 테스트를 깨뜨리지 마라.
