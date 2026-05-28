# Step 1: design-tokens

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md`
- `docs/UI_GUIDE.md` — step 0에서 재작성된 파일. 컬러/타이포/간격/반경/그림자 토큰의 기준.
- `fix3_design.md` — §2 디자인 토큰 전체
- `src/index.css` — 현재 파일. 기존 Tailwind v4 구조 파악 후 교체

## 작업

`src/index.css`를 **전면 교체**하여 fix3_design.md §2 기준 디자인 토큰을 적용한다.

### CSS 변수 구조

```css
/* 1. 폰트 family 변수 */
:root {
  --font-body: "Pretendard", "Geist", -apple-system, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}

/* 2. 컬러 토큰 (라이트 기본) */
:root {
  --bg:            #F7F7F4;
  --surface:       #FFFFFF;
  --surface-sub:   #EEEEEB;
  --border:        #E3E3DE;
  --border-strong: #CBC6BC;
  --text-primary:  #080603;
  --text-secondary:#49473F;
  --text-muted:    #605E58;
  --error:         oklch(58% 0.13 25);
}

/* 3. 다크 모드 (시스템 따라가기) */
@media (prefers-color-scheme: dark) {
  :root {
    --bg:            #131313;
    --surface:       #1C1B1B;
    --surface-sub:   #201F1F;
    --border:        #2A2A2A;
    --border-strong: #444748;
    --text-primary:  #E5E2E1;
    --text-secondary:#C4C7C8;
    --text-muted:    #8E9192;
    --error:         oklch(75% 0.13 25);
  }
}

/* 4. 그림자 토큰 */
:root {
  --shadow-card:    0 1px 3px rgba(8,6,3,0.04);
  --shadow-overlay: 0 4px 16px rgba(8,6,3,0.08);
  --shadow-modal:   0 8px 32px rgba(8,6,3,0.12);
}

@media (prefers-color-scheme: dark) {
  :root {
    --shadow-card:    none;
    --shadow-overlay: none;
    --shadow-modal:   none;
  }
}

/* 5. radius 토큰 */
:root {
  --radius-xs:   2px;
  --radius-sm:   4px;
  --radius-md:   6px;
  --radius-lg:   8px;
  --radius-full: 9999px;
}
```

### Tailwind v4 @theme inline 갱신

기존 Tailwind v4 `@theme inline` 블록을 업데이트하여 위 CSS 변수를 Tailwind 유틸리티로 노출한다:

```css
@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-sub: var(--surface-sub);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  --color-error: var(--error);

  --font-family-body: var(--font-body);
  --font-family-mono: var(--font-mono);

  --shadow-card: var(--shadow-card);
  --shadow-overlay: var(--shadow-overlay);
  --shadow-modal: var(--shadow-modal);

  --radius-xs: var(--radius-xs);
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-full: var(--radius-full);
}
```

### base 스타일

```css
@layer base {
  body {
    background-color: var(--bg);
    color: var(--text-primary);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
  }
}
```

기존 `index.css`에 있던 amber/terracotta 관련 토큰(`--amber-*`, `--terracotta-*` 등)은 모두 제거한다.

## Acceptance Criteria

```bash
npm run build
```

빌드 에러 없음. amber/terracotta 키워드 0개 확인:

```bash
grep -i "amber\|terracotta" src/index.css
```

## 검증 절차

1. `npm run build` 실행하여 컴파일 에러 없음 확인
2. `grep -i "amber\|terracotta" src/index.css` → 0건 확인
3. `grep -i "#000\b\|#fff\b" src/index.css` → 0건 확인 (warm tint 토큰만 허용)
4. 결과에 따라 `phases/design-renewal/index.json`의 step 1 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "src/index.css 모노톤 CSS 변수 + Tailwind v4 @theme inline 갱신 완료, amber/terracotta 제거"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- `#000` 또는 `#fff`를 직접 사용하지 마라. 이유: warm hue 80도 미세 tint를 유지해야 한다.
- chromatic accent(amber/blue/green/violet) 토큰을 추가하지 마라. 이유: 순수 모노톤 설계 결정.
- `src/services/*`, `src/hooks/*`, `src/stores/*`, `src/types/*`는 건드리지 마라. 이유: 이 step은 CSS 토큰만 변경한다.
- 기존 `@import`, `@tailwind` 디렉티브 구조를 파악한 뒤 그것을 유지하면서 교체하라. 이유: Tailwind v4는 import 순서에 민감하다.
