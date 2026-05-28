# Step 4: font-loading

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/UI_GUIDE.md` — 폰트 조합 명세 (Pretendard/Geist/JetBrains Mono)
- `fix3_design.md` — §2 타이포그래피 (font-family 변수)
- `src/index.css` — step 1에서 갱신된 `--font-body`, `--font-mono` 변수 확인
- `index.html` — 현재 폰트 로딩 방식 확인 (link preload 여부)
- `public/` — 기존 Pretendard 폰트 파일 경로 확인

## 작업

세 가지 폰트(Pretendard, Geist, JetBrains Mono)를 로딩한다.

### 현황 파악

먼저 `public/` 디렉토리와 `src/index.css`를 확인하여:
- Pretendard가 이미 self-hosted인지, CDN인지 확인
- 기존 `@font-face` 선언 위치 파악

### 폰트 로딩 전략

**Pretendard (이미 있음):** 기존 방식 유지. `index.html`의 `<link rel="preload">` 태그 확인 후 누락이면 추가.

**Geist:** Google Fonts CDN을 사용하지 말 것 (GDPR/privacy 이슈). 대신:
- `@fontsource/geist` npm 패키지가 있으면 사용: `import '@fontsource/geist'`
- 없으면 jsDelivr CDN `@font-face`를 `src/index.css`에 추가 (self-host 대안)
- 또는 `public/fonts/geist/` 에 woff2 파일 배치 후 `@font-face` 선언

**JetBrains Mono:** 동일 방식으로 처리. `@fontsource/jetbrains-mono` npm 패키지 우선.

### 로딩 최적화

- `@font-face`에 `font-display: swap` 명시 — FOUT 허용으로 LCP 보호
- `index.html`에 중요 폰트 woff2 `<link rel="preload" as="font" crossorigin>` 추가 (Pretendard 최소 1 weight, Geist 최소 1 weight)
- JetBrains Mono는 label-mono 역할(소량)이므로 preload 불필요

### CSS 확인

`src/index.css`의 `--font-body`와 `--font-mono` 변수 fallback chain:

```css
--font-body: "Pretendard", "Geist", -apple-system, system-ui, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, monospace;
```

이 순서를 유지한다.

## Acceptance Criteria

```bash
npm run build
```

빌드 통과 (폰트 파일이 dist/ 또는 CDN으로 서빙 가능한 상태). `font-display: swap` 선언 확인.

## 검증 절차

1. `npm run build` 실행 → 에러 없음
2. 빌드 결과 확인:
   ```bash
   grep -r "font-display" src/index.css
   ```
   `font-display: swap` 있어야 함
3. LCP 회귀 확인 방법 (dev 서버에서):
   - `npm run dev` 실행
   - 브라우저 DevTools Network 탭 → Fonts 필터 → 세 폰트 파일 로딩 확인
   - FOUT는 허용, FOIT는 안 됨 (`font-display: swap` 보장)
4. 결과에 따라 `phases/design-renewal/index.json`의 step 4 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "Pretendard/Geist/JetBrains Mono 로딩 설정 완료, font-display:swap 적용"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- Google Fonts CDN을 직접 link 태그로 추가하지 마라. 이유: 외부 CDN 의존성 및 프라이버시 이슈.
- 폰트 로딩이 render-blocking이 되지 않도록 하라. 이유: LCP 보호. `font-display: swap`을 반드시 명시.
- `src/services/*`, `src/hooks/*`, `src/stores/*`, `src/types/*`는 건드리지 마라. 이유: 이 step은 폰트 에셋과 CSS만 변경한다.
- 이미 있는 Pretendard 폰트 파일을 삭제하거나 이동하지 마라. 이유: 기존 빌드 경로가 깨질 수 있다.
