# UI 디자인 가이드 — Check Later

## 디자인 토큰

Check Later의 디자인은 순수 모노톤 문서형 UI를 기준으로 한다. 강조는 채색 accent가 아니라 weight, size, fill, position으로만 만든다.

### 컬러 토큰

HEX는 직관적 확인용이고, OKLCH는 구현 시 보조 기준이다.

#### Light

| Token | HEX | OKLCH | 용도 |
|---|---:|---:|---|
| `--bg` | `#F7F7F4` | `oklch(97% 0.004 80)` | 기본 배경, warm off-white |
| `--surface` | `#FFFFFF` | `oklch(100% 0 0)` | card/panel |
| `--surface-sub` | `#EEEEEB` | `oklch(94% 0.004 80)` | surface-container, 비활성/배지 |
| `--border` | `#E3E3DE` | `oklch(90% 0.005 80)` | divider, card border |
| `--border-strong` | `#CBC6BC` | `oklch(81% 0.015 80)` | 입력 포커스, focus ring |
| `--text-primary` | `#080603` | `oklch(10% 0.006 80)` | near-black 본문 |
| `--text-secondary` | `#49473F` | `oklch(39% 0.012 80)` | 본문 보조 |
| `--text-muted` | `#605E58` | `oklch(49% 0.010 80)` | meta/label |
| `--error` | `#B94A42` | `oklch(58% 0.13 25)` | 강도 낮춘 오류 |

#### Dark

| Token | HEX | OKLCH | 용도 |
|---|---:|---:|---|
| `--bg` | `#131313` | `oklch(18% 0 0)` | 기본 배경, 시스템 따라가기 |
| `--surface` | `#1C1B1B` | `oklch(23% 0.003 80)` | card/panel |
| `--surface-sub` | `#201F1F` | `oklch(25% 0.003 80)` | surface-container, 비활성/배지 |
| `--border` | `#2A2A2A` | `oklch(30% 0 0)` | divider, card border |
| `--border-strong` | `#444748` | `oklch(40% 0.004 230)` | 입력 포커스, focus ring |
| `--text-primary` | `#E5E2E1` | `oklch(91% 0.004 80)` | 기본 본문 |
| `--text-secondary` | `#C4C7C8` | `oklch(81% 0.004 230)` | 본문 보조 |
| `--text-muted` | `#8E9192` | `oklch(64% 0.004 230)` | meta/label |
| `--error` | `#F38178` | `oklch(75% 0.13 25)` | 다크 모드 오류 |

#### 금지 사항

- `#000`/`#fff` 직접 사용 금지. 중성색도 warm tint 토큰을 사용한다.
- chromatic accent 추가 금지. 강조는 색이 아니라 weight, size, fill, position으로 처리한다.
- glassmorphism, blur, mix-blend-overlay, gradient text 금지.
- `border-left: 3px+ color` side-stripe 금지. blockquote도 예외가 아니다.

### 폰트 조합

- 본문 한글: Pretendard
- 영문/숫자: Geist
- mono 라벨: JetBrains Mono

```css
font-family-body: "Pretendard", "Geist", -apple-system, system-ui, sans-serif;
font-family-mono: "JetBrains Mono", ui-monospace, monospace;
```

### 타이포그래피 스케일

| Role | Size | Line-height | Weight | Letter-spacing |
|---|---:|---:|---:|---:|
| display | 32px | 1.2 | 600 | -0.02em |
| display-mobile | 26px | 1.3 | 600 | 0 |
| headline | 24px | 1.4 | 500 | 0 |
| subhead | 18px | 1.5 | 500 | 0 |
| body | 16px | 1.6 | 400 | 0 |
| body-sm | 14px | 1.5 | 400 | 0 |
| label | 13px | 1.2 | 500 | 0.02em |
| label-mono | 12px | 1.2 | 500 | 0.04em |

- 줄 길이는 65ch 이하로 제한한다.
- 숫자, 카운트, 타임스탬프는 `font-family-mono`를 사용한다.

### Spacing & Radius

```text
spacing: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 (base 4px)
gutter-mobile: 16px
gutter-desktop: 24~32px
max-content-width: 800px (단일 칼럼) / 1200px (Folders 그리드)
```

| Token | Value | 용도 |
|---|---:|---|
| `radius-xs` | 2px | chip |
| `radius-sm` | 4px | button, input |
| `radius-md` | 6px | card |
| `radius-lg` | 8px | modal, bottomsheet |
| `radius-full` | 9999px | avatar, pill |

### 그림자/모션

```text
shadow-card:    0 1px 3px rgba(8,6,3,0.04)
shadow-overlay: 0 4px 16px rgba(8,6,3,0.08)
shadow-modal:   0 8px 32px rgba(8,6,3,0.12)
```

- 다크 모드에서는 그림자를 사용하지 않는다.
- transition은 `150–200ms cubic-bezier(0.16, 1, 0.3, 1)`을 사용한다.
- bounce/elastic 모션 금지.
- layout 속성 애니메이션 금지.

## 안티패턴 가드레일

작업하는 모든 step에서 PR/커밋 전에 반드시 점검:

- [ ] `border-left: Npx (N≥2) color` 사용처 0개 (side-stripe 금지)
- [ ] `background-clip: text` 사용처 0개 (gradient text 금지)
- [ ] `backdrop-filter: blur`, `mix-blend-overlay` 사용처 0개 (glass/blend 금지)
- [ ] `border-radius >= 10px` on cards (앱스토어 카드 느낌 금지)
- [ ] 메인 색 외 chromatic accent 토큰 추가 안 했는지
- [ ] `#000`/`#fff` 직접 사용 0개 (warm tint 토큰만)
- [ ] 모든 새 컴포넌트가 `src/components/ui/` 또는 도메인 폴더에 있고 페이지 인라인 아님
- [ ] 모바일 터치 타깃 ≥ 44×44
- [ ] 모든 카드/버튼/입력의 hover/active/focus/disabled 상태 정의됨
- [ ] em dash(—) 직접 입력 금지. UI 카피에서 콜론/마침표/괄호 사용
- [ ] 모달은 진짜 파괴적 액션(삭제)만. 그 외 BottomSheet/Inline
