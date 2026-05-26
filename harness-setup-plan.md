# Harness Framework 적용 계획

> 새 세션에서 이 파일을 읽고 순서대로 실행하세요.
> 원본 기획서: `plan.md` (MVP), `plan_design.md` (디자인) — 삭제하지 말 것.

---

## 사전 준비 (이 세션 시작 전 수동으로)

```bash
# Python 3.11 확인 (자동 설치 안 함)
python3.11 --version 2>/dev/null || echo "MISSING: brew install python@3.11 실행 필요"
```

Python 3.11이 없으면 먼저 설치 후 세션 시작.

---

## Step 0: 환경 검증

```bash
git rev-parse --show-toplevel
test -f package.json && test -f plan.md && test -f plan_design.md && echo "OK"
python3.11 --version
```

→ 모두 통과해야 Step 1 진행.

---

## Step 1: 하네스 파일 복사

**제외**: `README.md`, `.gitignore`  
**베이스 URL**: `https://raw.githubusercontent.com/guiyoung2/harness_framework/main/`

아래 파일을 순서대로 다운로드 후 동일 경로에 저장:

```bash
BASE="https://raw.githubusercontent.com/guiyoung2/harness_framework/main"

# .claude/commands
mkdir -p .claude/commands
curl -fsSL "$BASE/.claude/commands/harness.md" -o .claude/commands/harness.md
curl -fsSL "$BASE/.claude/commands/review.md"  -o .claude/commands/review.md

# .claude/rules
mkdir -p .claude/rules
curl -fsSL "$BASE/.claude/rules/coding-principles.md" -o .claude/rules/coding-principles.md
curl -fsSL "$BASE/.claude/rules/token-saving.md"       -o .claude/rules/token-saving.md

# .claude/skills/harness
mkdir -p .claude/skills/harness/templates
curl -fsSL "$BASE/.claude/skills/harness/SKILL.md"                   -o .claude/skills/harness/SKILL.md
curl -fsSL "$BASE/.claude/skills/harness/templates/feature_list.json" -o .claude/skills/harness/templates/feature_list.json
curl -fsSL "$BASE/.claude/skills/harness/templates/phase-index.json"  -o .claude/skills/harness/templates/phase-index.json
curl -fsSL "$BASE/.claude/skills/harness/templates/progress.md"       -o .claude/skills/harness/templates/progress.md
curl -fsSL "$BASE/.claude/skills/harness/templates/step.md"           -o .claude/skills/harness/templates/step.md
curl -fsSL "$BASE/.claude/skills/harness/templates/top-index.json"    -o .claude/skills/harness/templates/top-index.json

# 루트 설정 파일
curl -fsSL "$BASE/.claudeignore"       -o .claudeignore
curl -fsSL "$BASE/AGENTS.md"           -o AGENTS.md
curl -fsSL "$BASE/CLAUDE.md"           -o CLAUDE.md
curl -fsSL "$BASE/harness.config.json" -o harness.config.json

# scripts
mkdir -p scripts
curl -fsSL "$BASE/scripts/execute.py"      -o scripts/execute.py
curl -fsSL "$BASE/scripts/test_execute.py" -o scripts/test_execute.py

# docs (Step 6에서 내용을 채울 템플릿)
mkdir -p docs
curl -fsSL "$BASE/docs/PRD.md"          -o docs/PRD.md
curl -fsSL "$BASE/docs/ARCHITECTURE.md" -o docs/ARCHITECTURE.md
curl -fsSL "$BASE/docs/ADR.md"          -o docs/ADR.md
curl -fsSL "$BASE/docs/UI_GUIDE.md"     -o docs/UI_GUIDE.md
```

> `-fsSL` 플래그: `-f` 404/권한 오류 시 실패 코드 반환, `-sS` 진행률 숨기되 에러는 표시, `-L` 리다이렉트 추적.

**검증:**
```bash
ls .claude/commands .claude/rules .claude/skills/harness/templates docs scripts
test -f AGENTS.md && test -f CLAUDE.md && test -f harness.config.json && echo "OK"
```

---

## Step 2: `.gitignore` 병합

기존 `.gitignore` 끝에 아래 추가 (기존 내용 덮어쓰지 말 것):

```
# Harness phase outputs
phases/**/phase*-output.json
phases/**/step*-output.json
scripts/__pycache__/
```

**검증:** `grep "phase\*-output" .gitignore`

---

## Step 3: Vitest 셋업 (Step 4 hook 추가 전에 반드시 먼저)

> ⚠️ Step 4의 Stop hook이 `npm run test`를 호출하므로, **Step 3이 먼저** 완료되어야 한다.

### 3-1. 의존성 설치

```bash
npm i -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### 3-2. `vitest.config.ts` 생성

> ⚠️ `vite.config.ts`를 덮어쓰지 않도록 `mergeConfig` 필수.  
> 안 쓰면 `tailwindcss()`, `VitePWA()` 플러그인이 테스트 Vite 설정에서 누락된다.

```ts
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
    },
  })
)
```

### 3-3. `src/test/setup.ts` 생성

```ts
import '@testing-library/jest-dom/vitest'
```

### 3-4. `package.json` scripts 추가

기존 scripts 객체에 다음 3개 추가:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

### 3-5. `tsconfig.json` types 보강

기존 `"types": ["vite/client"]`를 다음으로 교체 (`vite/client` 유지 필수):

```json
"types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]
```

### 3-6. `src/test/sanity.test.ts` 생성 (필수)

> ⚠️ `vitest run`은 테스트 파일 0개면 exit 1로 실패. Stop hook이 매 세션 깨지지 않으려면 필수 생성.

```ts
import { describe, it, expect } from 'vitest'

// vitest 셋업 동작 확인용 sanity test
describe('vitest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

**검증 (이 순서대로):**
```bash
npm run lint    # ESLint 규칙과 sanity.test.ts 충돌 없음 확인
npm run test    # → "1 passed" + exit 0
npm run build   # → TypeScript 에러 없음
```

> lint를 test/build보다 먼저 실행하는 이유: sanity.test.ts나 setup.ts 파일이 ESLint 규칙과 충돌하면, Step 4의 Stop hook 추가 후 발견하는 것보다 여기서 미리 잡는 게 낫다.

---

## Step 4: `.claude/settings.json` 생성

> ⚠️ `command` 값은 반드시 한 줄 문자열. 줄바꿈 금지.

**`settings.local.json`이 있는 경우 — 병합 후 삭제:**
1. 기존 `permissions.allow` 항목을 읽어 아래 예시의 `allow` 배열에 합집합으로 병합한다 (중복 제거).
2. 기존 `outputStyle` 값이 있으면 유지한다.
3. 병합 완료 후 `settings.local.json` 삭제.

**`settings.local.json`이 없는 경우** — 아래 예시 그대로 새로 생성:

> 현재 프로젝트의 `settings.local.json`에는 `"outputStyle": "Front Advice"`와 일부 `permissions.allow` 항목(WebFetch, Bash 등)이 있다. 아래 예시는 이 값들을 이미 포함하고 있어 그대로 써도 되지만, 기존 파일이 있으면 반드시 합집합 병합을 거칠 것.

```json
{
  "permissions": {
    "allow": [
      "WebFetch(domain:claude-workbook.vercel.app)",
      "WebFetch(domain:raw.githubusercontent.com)",
      "WebFetch(domain:api.github.com)",
      "Bash(/opt/homebrew/bin/jq --version)",
      "Bash(/usr/local/bin/jq --version)",
      "Bash(bash *)"
    ]
  },
  "outputStyle": "Front Advice",
  "hooks": {
    "Stop": [
      { "matcher": "", "hooks": [ { "type": "command", "command": "npm run lint 2>&1 && npm run build 2>&1 && npm run test 2>&1" } ] }
    ],
    "PreToolUse": [
      { "matcher": "Bash", "hooks": [ { "type": "command", "command": "if echo \"$CLAUDE_TOOL_INPUT\" | grep -qE 'rm\\s+-rf|git\\s+push\\s+--force|git\\s+reset\\s+--hard|DROP\\s+TABLE'; then echo 'BLOCKED: 위험한 명령어가 감지되었습니다.' >&2; exit 1; fi" } ] }
    ]
  }
}
```

이후 `.claude/settings.local.json` 삭제(존재 시).

**검증:**
```bash
# JSON 파싱 확인
python3 -c "import json; json.load(open('.claude/settings.json'))"

# PreToolUse command가 한 줄인지 확인
python3 -c "import json; print(json.load(open('.claude/settings.json'))['hooks']['PreToolUse'][0]['hooks'][0]['command'])"

# Stop hook 시뮬레이션 (핵심)
npm run lint && npm run build && npm run test
```

→ 모두 exit 0이어야 함.

---

## Step 5: `AGENTS.md` placeholder 채우기

다운로드된 `AGENTS.md`에서 아래 항목을 교체:

| placeholder | 교체 값 |
|---|---|
| `{프로젝트명}` | `check_later` |
| 기술 스택 | `Vite 8 + React 19 + TypeScript + Tailwind CSS v4 + Supabase + TanStack Query + Zustand + vite-plugin-pwa` |
| 테스트 프레임워크 추가 | `Vitest + @testing-library/react + jsdom` |
| 빌드 | `npm run build` |
| 테스트 | `npm run test` |
| 테스트(watch) | `npm run test:watch` |
| 린트 | `npm run lint` |
| 타입체크 | `tsc --noEmit  (build 스크립트에 포함됨)` |
| 포맷 | `npm run format` |

Python 환경 섹션 추가:

```markdown
# Python 환경

- 필요 버전: Python 3.11
- Mac: `python3.11 scripts/execute.py <task-name>`
- Windows: `py -3.11 scripts/execute.py <task-name>`
```

나머지 섹션(CRITICAL, 토큰 절약, 코딩 원칙, Harness 워크플로우, 참고 문서)은 그대로 유지.

**검증:** `grep -E '\{프로젝트명\}|\{예:' AGENTS.md` → 출력 없음.

---

## Step 6: docs/ 작성

> 하네스 레포의 docs 템플릿을 아래 내용으로 **완전히 덮어씀**.

### 6-1. `docs/PRD.md`

`plan.md` §1~3(문제 정의, 목표, 범위)을 하네스 PRD 구조(목표 / 사용자 / 핵심 기능 / MVP 제외 / 디자인)에 맞게 재작성. 내용 출처:
- 목표 ← `plan.md` §2
- 사용자 ← `plan_design.md` 섹션1의 PRODUCT.md §Users
- 핵심 기능 ← `plan.md` §3 MVP 포함 항목
- MVP 제외 ← `plan.md` §3 제외 표
- 디자인 ← "Warm-Minimal Personal Tool" 요약 + `docs/UI_GUIDE.md` 링크

### 6-2. `docs/ARCHITECTURE.md`

`plan.md` §4~6(기술 스택, 데이터 모델, 화면 구조)을 정리. Vite SPA 기준으로 작성:

```
src/
 ├ pages/         (라우트 컴포넌트)
 ├ components/    (UI 컴포넌트)
 ├ lib/           (supabase client, utils, og-parser, form-type-detect)
 ├ services/      (items, storage repository)
 ├ stores/        (Zustand UI 상태)
 ├ hooks/         (TanStack Query 훅)
 ├ types/         (DB 생성 타입 + 도메인 타입)
 └ test/          (Vitest setup, sanity test)
```

포함 내용: 패턴(TanStack/Zustand/RLS), 데이터 흐름, items 테이블 스키마 + RLS 정책, Storage 버킷 규칙, 라우트 표.

### 6-3. `docs/ADR.md`

`plan.md`에 명시된 기술 결정을 ADR 형식으로 정리:

| ADR | 결정 | 근거 | 트레이드오프 |
|---|---|---|---|
| 001 | Vite + React (Next.js 아님) | SSR 불필요, PWA=SPA, 빌드 단순 | App Router 이점 포기 |
| 002 | Supabase (Firebase/자체 서버 아님) | Postgres 직관성 + RLS + 무료 티어 | Firebase 특화 기능 별도 구현 |
| 003 | PWA 단독 (디스코드 봇 V2 보류) | Web Share Target으로 저마찰, 인프라 단일화 | 채팅 기반 입력 UX 포기 |
| 004 | TanStack Query + Zustand (Redux 아님) | 서버/UI 상태 분리, 보일러플레이트 최소 | 두 라이브러리 학습 |
| 005 | Vitest (Jest 아님) | Vite 동일 진영, ESM 네이티브, 셋업 5분 | Jest 특화 플러그인 일부 미지원 |

### 6-4. `docs/UI_GUIDE.md`

> ⚠️ 하네스 원본은 다크 SaaS 대시보드 가이드로 우리 방향과 정반대. **일부 병합 금지, 통째로 덮어씀.**

`plan_design.md` 섹션2~5를 이식:
- 테마 씬 문장 ("저녁 7시, 소파에...")
- 컬러 토큰 (oklch 기반, 라이트/다크)
- 타이포 (Pretendard, 12/14/16/20px)
- 간격 (4px 베이스)
- 컴포넌트 룰 (border-radius 6/8/999, 그림자)
- 모션 (150~200ms ease-out-quint)
- 안티패턴 표 (`plan_design.md` §5 전체)

---

## Step 7: 최종 검증

```bash
# 1. 파일 구조 확인
ls .claude/commands .claude/rules .claude/skills/harness/templates docs scripts
test -f vitest.config.ts && test -f src/test/sanity.test.ts && echo "구조 OK"

# 2. placeholder 미잔존
grep -RE '\{프로젝트명\}|\{예:' AGENTS.md docs/  # 출력 없어야 함

# 3. JSON 유효성
python3 -c "import json; [json.load(open(f)) for f in ['.claude/settings.json','harness.config.json']]" && echo "JSON OK"

# 4. Stop hook 전체 검증 (가장 중요)
npm run lint && npm run build && npm run test

# 5. execute.py 호환성
python3.11 scripts/execute.py --help
python3.11 -m unittest scripts.test_execute -v

# 6. settings.local.json 삭제됐는지 확인
test ! -f .claude/settings.local.json && echo "local 삭제 OK"
```

모두 통과하면 `/harness` 슬래시 커맨드 확인 후 M1(인증+CRUD) phase 시작.

---

## 보존 목록 (손대지 않는 파일)

- `plan.md`, `plan_design.md` — 루트 그대로 유지
- `.claude/output-styles/front-advice.md`
- `.claude/skills/deep-interview/`, `.claude/skills/impeccable/`
- `.agents/skills/deep-interview/`
- `skills-lock.json`
- `src/` 기존 파일 일체 (`src/test/` 하위만 신규 추가)
- `vite.config.ts`, `index.html`, `eslint.config.js`, `.prettierrc`

---

## Windows 병행 작업 시

- execute.py 호출: `py -3.11 scripts/execute.py <task-name>`
- 경로는 항상 POSIX 슬래시 사용 (`src/test/setup.ts`)
