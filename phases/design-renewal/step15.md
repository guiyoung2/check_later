# Step 15: antipattern-guard

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/UI_GUIDE.md` — 안티패턴 가드레일 체크리스트 전체
- `fix3_design.md` — §5 안티패턴 가드레일 전체, §8 검증 방법의 grep 명령어

## 작업

`scripts/check-antipatterns.mjs`를 신설하여 안티패턴 검사를 자동화한다.

### 검사 항목 (fix3_design.md §5 기준)

```js
const checks = [
  {
    name: 'side-stripe (border-left 3px+)',
    // border-left: 3px, 4px, ... 이상인 경우. 1px subtle border는 OK.
    pattern: /border-left:\s*[3-9]\d*px|border-left:\s*[1-9]\d+px/,
    glob: 'src/**/*.{tsx,ts,css}',
    allowedCount: 0,
  },
  {
    name: 'gradient text (background-clip: text)',
    pattern: /background-clip:\s*text/,
    glob: 'src/**/*.{tsx,ts,css}',
    allowedCount: 0,
  },
  {
    name: 'glassmorphism (backdrop-filter)',
    pattern: /backdrop-filter/,
    glob: 'src/**/*.{tsx,ts,css}',
    allowedCount: 0,
  },
  {
    name: 'blend overlay (mix-blend-overlay)',
    pattern: /mix-blend-overlay/,
    glob: 'src/**/*.{tsx,ts,css}',
    allowedCount: 0,
  },
  {
    name: 'pure black/white (#000 or #fff)',
    // #000, #000000, #fff, #ffffff (대소문자 무관)
    pattern: /#(?:000(?:000)?|fff(?:fff)?)\b/i,
    glob: 'src/**/*.{tsx,ts,css}',
    allowedCount: 0,
  },
  {
    name: 'chromatic accent token (amber/blue/green/violet)',
    // CSS 변수 또는 Tailwind 클래스에서 amber/blue/green/violet 색상
    pattern: /(?:amber|violet|emerald|teal|cyan|sky|indigo|purple|fuchsia|pink|rose)-\d{2,3}|--amber|--blue|--green|--violet/,
    glob: 'src/**/*.{tsx,ts,css}',
    allowedCount: 0,
  },
];
```

### 스크립트 구조

```js
// scripts/check-antipatterns.mjs
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// glob 패턴으로 파일 목록 수집 → 각 파일을 check → 위반 출력
// 위반이 1개 이상이면 process.exit(1)

// 출력 형식:
// [FAIL] side-stripe (border-left 3px+): 2 violations
//   src/components/SomeCard.tsx:42  border-left: 4px solid var(--error)
//   src/pages/HomePage.tsx:18  border-left: 3px solid red
// [PASS] gradient text: 0 violations
// ...
// Total: 2 violations found. Fix before merge.
```

### npm script 등록

`package.json`의 `scripts`에 추가:

```json
"check:antipatterns": "node scripts/check-antipatterns.mjs"
```

### CI 통합 (선택)

`package.json`의 기존 `lint` 또는 별도 스크립트에 추가하거나, README 또는 ARCHITECTURE.md에 실행 방법 기록. CI 파이프라인(`/.github/workflows/`) 파일 수정은 사용자 확인 없이 하지 않는다.

## Acceptance Criteria

```bash
node scripts/check-antipatterns.mjs
```

현재 `src/` 코드베이스에서 위반 0건으로 통과. 종료 코드 0.

```bash
npm run build
npm run test -- --run
```

빌드 및 기존 테스트 회귀 없음.

## 검증 절차

1. `node scripts/check-antipatterns.mjs` → 위반 0건 확인
2. 위반이 발견되면 해당 파일을 수정하여 0건으로 만든다
3. `npm run build && npm run test -- --run`
4. 결과에 따라 `phases/design-renewal/index.json`의 step 15 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "scripts/check-antipatterns.mjs 신설, 현재 src/ 위반 0건 확인, npm run check:antipatterns 등록"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- 위반을 0건으로 만들기 위해 스크립트의 검사 기준을 낮추지 마라. 이유: 가드레일 자체를 약화시키는 것은 의미가 없다.
- `.github/workflows/` 파일을 사용자 확인 없이 수정하지 마라. 이유: CI 파이프라인 변경은 공유 인프라에 영향을 준다.
- `src/` 외의 경로(예: `public/`, `dist/`)를 검사하지 마라. 이유: 빌드 산출물에는 안티패턴 grep이 의미 없다.
