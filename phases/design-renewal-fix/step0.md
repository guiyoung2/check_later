# Step 0: landing-redesign

## 읽어야 할 파일

먼저 아래를 읽고 설계 의도를 파악하라:

- `fix5.md` — §2-A(랜딩 꾸밈), §2-B(카피), §5(확정: "절제된 elevation", 로그인 우상단)
- `docs/UI_GUIDE.md` — 토큰, 안티패턴 가드레일(gradient text·glass·side-stripe·#000/#fff 금지)
- `docs/PRD.md` — 제품 정체성/디자인 레인(Warm-Minimal Personal Tool)
- `src/pages/LandingPage.tsx` — 현재 랜딩(브랜드+토글 헤더, h1, 보조문구, 3카드, 시작하기/로그인 버튼)
- `src/components/ThemeToggleButton.tsx` — 헤더 토글(그대로 재사용)
- `src/components/ui/Button.tsx` — Button variant(primary/secondary/ghost)
- `src/pages/LandingPage.test.tsx` — 유지해야 할 테스트 계약

## 작업

`src/pages/LandingPage.tsx`를 **절제된 elevation**으로 개선한다(브랜드 표면이므로 제품 UI보다 표현 자유도는 크되, warm-minimal 기조와 안티패턴 금지는 유지).

### 레이아웃/꾸밈
1. **우상단 헤더 진입 변경**: 헤더 우측을 `[테마 토글] [Login 버튼]` 순으로(토글 오른쪽에 Login). Login은 `Button` secondary 또는 ghost, `onClick={() => navigate('/login')}`. 라벨은 `Login`.
2. **히어로의 보조 "로그인" 버튼 제거** — 1차 CTA는 `시작하기`만 유지(아래 테스트 계약 참고).
3. **히어로 강화**: 타이포 스케일·여백 리듬으로 위계 강화. 큰 제목 + 보조문구 + 1차 CTA.
4. **소형 제품 프리뷰**: 별도 이미지 asset 없이 기존 토큰/컴포넌트로 조립한 정적 미니 프리뷰(예: 카드 한두 개를 흉내 낸 목업 스택)를 히어로 하단/측면에 배치해 "완성된 제품" 인상을 준다. 인터랙션·실데이터 불필요.
5. 1뷰포트 고집은 완화 가능(스크롤 허용). 단 과한 섹션 남발 금지(절제).

### 카피 (B)
- 현재 문구("공유 한 번이면 끝, 30초 안에 찾는다" / "나중에 볼 링크·메모·캡처를 던지듯 저장하고, 필요할 때 바로 꺼내 보세요." / 저장·분류·조회 2줄)는 AI스럽다는 피드백. **담백하고 구체적인 카피로 교체**한다.
- 2~3개 카피 안을 코드 주석이나 PR 설명이 아니라 **실제 채택안 1개로 반영**하되, 다음 원칙을 지킨다: em dash(—) 금지, 제목 반복/군더더기 금지, 과장 광고체 지양.

## 핵심 규칙 (벗어나지 말 것)
- `시작하기` 1차 CTA는 클릭 시 `/login`으로 이동해야 한다. **접근성 이름(accessible name)에 "시작하기"가 포함**되어야 한다(아래 테스트가 `name: '시작하기 →'`로 조회).
- 테마 토글은 `ThemeToggleButton`을 재사용한다(새 토글 구현 금지).
- gradient text(`background-clip:text`), glassmorphism(`backdrop-filter:blur`), side-stripe(`border-left: Npx color`), `#000`/`#fff` 직접 사용 금지.

## Acceptance Criteria

```bash
npm run build
npm run test
```

빌드 통과, 기존 테스트 회귀 없음. `LandingPage.test.tsx`(시작하기 CTA → /login 이동, 핵심 문구/블록 노출)가 통과해야 한다. **카피를 바꾸면 `LandingPage.test.tsx`의 텍스트 단언도 함께 갱신**하라(테스트가 새 카피를 검증하도록).

## 검증 절차
1. `npm run build && npm run test`
2. 안티패턴 grep:
   ```bash
   grep -nE "background-clip|backdrop-filter|border-left:" src/pages/LandingPage.tsx
   grep -nE "#000|#fff" src/pages/LandingPage.tsx
   ```
   모두 0건
3. `phases/design-renewal-fix/feature_list.json`의 feat-1·feat-2·feat-3을 `passes: true`로 갱신.
4. `phases/design-renewal-fix/index.json` step 0: 성공 시 `completed` + summary, 실패 3회 시 `error` + error_message.

## 금지사항
- 로그인 동작/플로우를 변경하지 마라. 이 step은 랜딩(브랜드 표면)만. 이유: 인증 로직은 범위 밖.
- chromatic accent 토큰을 새로 추가하지 마라. 이유: warm-minimal 모노톤 유지.
- 제품 프리뷰를 위해 외부 이미지/라이브러리를 추가하지 마라. 이유: 기존 토큰/컴포넌트로 충분, 의존성 증가 금지.
- 기존 테스트를 깨뜨리지 마라(카피 변경 시 테스트를 함께 갱신하는 것은 허용).
