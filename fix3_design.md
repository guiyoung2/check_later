# fix3_design.md — Check Later UI/디자인 전면 리뉴얼 계획서

> 이 문서는 새 세션에서 하네스(`/harness`)로 곧장 진입하기 위한 자기완결적 계획서다.
> 진입 시 반드시 함께 읽을 것: `docs/PRD.md`, `docs/ARCHITECTURE.md`.

---

## 0. Context (왜 이 변경이 필요한가)

**문제:**
- 현재 UI는 "단순"을 넘어 "부실"하다는 사용자 피드백. 차별점이 시각적으로 드러나지 않음.
- 컴포넌트가 4개뿐(`ItemCard`, `FilterBar`, `ThemeToggleButton`, `ProtectedRoute`)이고 페이지 인라인 로직이 많아 디자인 위계가 잡혀있지 않음.
- 현재 가이드(`docs/UI_GUIDE.md`)의 amber/terracotta accent가 사용자 취향과 어긋남 — "Claude 페이지 같은 주황색"이라 거부. 대신 "cursor/docs 같은 정돈된 문서 톤"을 원함.

**의도된 결과:**
- 정돈된 모노톤 문서 톤(warm off-white + near-black, accent 없음) + Geist/JetBrains Mono/Pretendard 폰트 혼합.
- 타입별 변형 카드 피드(메모/비디오/이미지/글) — "내가 저장한 다양한 형태가 한눈에 보이는 피드"가 차별점.
- 컴포넌트 원자화 — Button, Card, Chip, BottomSheet, EmptyState, Skeleton, Toast 등 기본 원자 신설.
- PRD의 3축(type/status/날짜) 원칙은 그대로. Search·자유 태그·자유 폴더는 V2도 미정의(완전 제외).

---

## 1. 최종 디자인 결정 (Phase 1 답변 잠금)

| 항목 | 결정 |
|---|---|
| **비주얼 톤** | 참조 톤 채택, 단 amber accent 제거 → **순수 모노톤** |
| **PRD 충돌 기능** | 태그/blockquote/Search/자유 폴더 모두 제외. Folders 화면은 type×status 카운트 그리드 |
| **카드 패턴** | type별 변형 카드 (메모/비디오/이미지/글 각자 다른 형태) |
| **다크 모드** | 현재 라이트 기본 유지. 다크는 시스템 따라가기(글래스/블러 안티패턴은 절대 도입 안 함) |
| **폰트 조합** | 본문 한글: Pretendard, 영문/숫자: Geist, mono 라벨: JetBrains Mono |
| **출력 위치** | 프로젝트 루트 `fix3_design.md` |

---

## 2. 디자인 토큰 (UI_GUIDE.md 전면 대체)

### 컬러 (HEX 직관성을 위해 HEX + 보조 OKLCH 병기. 실제 구현은 OKLCH로)

```css
/* Light (기본) */
--bg:            #F7F7F4;   /* warm off-white, oklch(97% 0.004 80) */
--surface:       #FFFFFF;   /* card/panel */
--surface-sub:   #EEEEEB;   /* surface-container, 비활성/배지 */
--border:        #E3E3DE;   /* divider, card border */
--border-strong: #CBC6BC;   /* 입력 포커스, focus ring */
--text-primary:  #080603;   /* near-black, 절대 #000 금지 */
--text-secondary:#49473F;   /* 본문 보조 */
--text-muted:    #605E58;   /* meta/label */
--error:         oklch(58% 0.13 25);  /* 강도 낮춤 */
/* 강조 accent 없음 — 강조는 weight/size/fill/position으로만 */

/* Dark (시스템 따라가기, 기본 아님) */
--bg:            #131313;
--surface:       #1C1B1B;
--surface-sub:   #201F1F;
--border:        #2A2A2A;
--border-strong: #444748;
--text-primary:  #E5E2E1;
--text-secondary:#C4C7C8;
--text-muted:    #8E9192;
--error:         oklch(75% 0.13 25);
```

**금지:**
- `#000`/`#fff` 절대 금지(중성색은 warm hue 80도 미세 tint 유지)
- 채색 accent(amber/blue/green 등) 추가 금지
- 글래스모피즘, blur, mix-blend-overlay, 그라디언트 텍스트 모두 금지
- `border-left: 3px+ color` (side-stripe) 절대 금지 — blockquote 포함

### 타이포그래피

```css
font-family-body: "Pretendard", "Geist", -apple-system, system-ui, sans-serif;
font-family-mono: "JetBrains Mono", ui-monospace, monospace;
/* 영문은 Pretendard에 Geist가 흡수되도록 fallback chain 구성 */
```

| Role | Size | Line-height | Weight | Letter-spacing |
|---|---|---|---|---|
| display | 32px | 1.2 | 600 | -0.02em |
| display-mobile | 26px | 1.3 | 600 | 0 |
| headline | 24px | 1.4 | 500 | 0 |
| subhead | 18px | 1.5 | 500 | 0 |
| body | 16px | 1.6 | 400 | 0 |
| body-sm | 14px | 1.5 | 400 | 0 |
| label | 13px | 1.2 | 500 | 0.02em |
| label-mono | 12px | 1.2 | 500 | 0.04em (JetBrains Mono) |

- 줄 길이 65ch 이하
- 본문 한글은 Pretendard, 숫자/카운트/타임스탬프는 JetBrains Mono로 분리

### Spacing & Radius

```
spacing: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 (base 4px)
gutter-mobile: 16px
gutter-desktop: 24~32px
max-content-width: 800px (단일 칼럼) / 1200px (Folders 그리드만)

radius:
  xs: 2px   (chip)
  sm: 4px   (button, input)
  md: 6px   (card)    ← 참조의 2px는 모바일 터치감 부족, 6px 유지
  lg: 8px   (modal, bottomsheet)
  full: 9999px (avatar, status pill)
```

### 그림자/모션

```
shadow-card:    0 1px 3px rgba(8,6,3,0.04)
shadow-overlay: 0 4px 16px rgba(8,6,3,0.08)
shadow-modal:   0 8px 32px rgba(8,6,3,0.12)
/* 다크 모드는 그림자 없음 */

transition: 150–200ms cubic-bezier(0.16, 1, 0.3, 1)  /* ease-out-quint */
/* bounce/elastic 금지, layout 속성 애니메이션 금지 */
```

---

## 3. 컴포넌트 원자 설계 (신설 또는 리뉴얼)

`src/components/`에 폴더링 도입:

```
components/
 ├ ui/                     ← 원자
 │  ├ Button.tsx           (primary/secondary/ghost/danger)
 │  ├ IconButton.tsx
 │  ├ Chip.tsx             (type chip, count chip)
 │  ├ Input.tsx
 │  ├ Textarea.tsx
 │  ├ Card.tsx             (base wrapper, hover state 포함)
 │  ├ BottomSheet.tsx      (mobile only, drag handle 포함)
 │  ├ Skeleton.tsx
 │  ├ Toast.tsx
 │  ├ EmptyState.tsx       (warm copy + 행동 유도)
 │  ├ Divider.tsx
 │  └ TopAppBar.tsx
 ├ items/                  ← 도메인 카드
 │  ├ ItemCard.tsx         (기존 리뉴얼)
 │  ├ MemoCard.tsx
 │  ├ VideoCard.tsx
 │  ├ ImageCard.tsx
 │  └ ArticleCard.tsx
 ├ filters/
 │  └ FilterBar.tsx        (기존 리뉴얼)
 ├ nav/
 │  ├ BottomNav.tsx        (mobile, 4 tab)
 │  └ SideNav.tsx          (desktop, 240px)
 └ ProtectedRoute.tsx
```

**컴포넌트 인터페이스(시그니처 수준만, 구현은 step에서 결정):**

- `<Button variant="primary"|"secondary"|"ghost"|"danger" size="sm"|"md" leftIcon/rightIcon />`
- `<Chip variant="type"|"status"|"count" leftIcon> text </Chip>` — type 칩은 `surface-sub` 배경 + label-mono 폰트
- `<Card hoverable as="article|a"> ... </Card>` — 6px radius, border, no shadow by default
- `<BottomSheet open onClose dragHandle> ... </BottomSheet>` — 모바일 전용, 드래그 핸들 12×4
- `<EmptyState title description action />` — "따뜻한 비어있음" 원칙(`UI_GUIDE.md` 원칙은 유지)

---

## 4. 페이지별 리뉴얼 명세

### 4.1 `/` Home (목록 피드)

**레이아웃:**
- 상단 고정 `TopAppBar` (h-16): 좌측 menu 아이콘 / 가운데 "Check Later" 워드마크(headline 24, weight 600) / 우측 account_circle
- 본문 max-w-800, mobile gutter 16, desktop 24
- 상단에 `FilterBar` sticky (type 4개 chip + status 3개 chip, 가로 스크롤 가능)
- 아래로 **타입별 변형 카드** 세로 흐름 (gap-24)
- 모바일 하단 `BottomNav` (h-16, fixed): Home / New / Folders / Settings 4-tab. **Search 탭 없음**

**카드 변형:**

```
┌─ MemoCard ────────────────────┐
│ [메모] · 오늘 14:23           │   ← type chip + 시각
│ 오늘의 생각                   │   ← headline 24
│ 디자인 시스템에서…             │   ← body 16, 3-line clamp
│                               │
└───────────────────────────────┘

┌─ VideoCard ───────────────────┐
│  ┌─────────────────────────┐  │
│  │     [▶ overlay]         │  │   ← aspect-video, dim 20% mask
│  │     섬네일              │  │
│  └─────────────────────────┘  │
│ [영상] · 어제 20:15           │
│ React 18 동시성 가이드        │   ← headline 24
│ youtube.com/watch?v=…  ↗      │   ← body-sm muted, mono URL
└───────────────────────────────┘

┌─ ImageCard ───────────────────┐
│  ┌─────────────────────────┐  │
│  │                         │  │   ← h-64, object-cover
│  │     큰 이미지           │  │
│  └─────────────────────────┘  │
│ [캡처] · 3월 12일             │
│ 영감을 주는 데스크 셋업       │
│ memo가 있으면 1줄             │
└───────────────────────────────┘

┌─ ArticleCard ─────────────────┐
│ [글] · 3시간 전               │
│ 좋은 컴포넌트는 무엇인가      │
│ memo (있으면)                 │
│ ─────────────────────────     │
│ small.thumbnail  example.com  │   ← 좌측 64×64 OG, 우측 url
└───────────────────────────────┘
```

**상태:**
- Empty (저장 0개): EmptyState — "아직 저장한 것이 없어요" + "공유 메뉴에서 던지거나 + 버튼으로 적어보세요" + 행동 버튼
- Empty (필터 적용 후 0개): "조건에 맞는 것이 없어요" + 필터 초기화 버튼
- Loading: Skeleton 카드 3개 (혼합 변형)
- Error: 카드 상단에 inline error banner

**인터랙션:**
- 카드 클릭 → `/items/:id`
- 좌→우 스와이프(모바일) → status 토글(안봤음→봤음→보관, 즉시 적용, undo toast 4s)
- 길게 누르기(모바일) → BottomSheet (수정/삭제/공유/status 직접 선택)
- 데스크탑은 카드 우상단 hover ⋯ 메뉴

### 4.2 `/new` 새 항목

**레이아웃 (모바일 = BottomSheet, 데스크탑 = 중앙 카드):**
- 헤더 "새로운 기록" + close
- 3-grid quick option chip (링크/텍스트/이미지) — 자동 type 판정 트리거
- textarea autofocus, placeholder "무엇을 기록할까요?", min-h-120
- URL 자동 감지 → 타입 변경 + OG title fetch (실패 시 URL 그대로)
- 액션 바: 좌측 type 자동 판정 결과 chip(읽기 전용), 우측 "저장" 버튼(primary)
- **태그/폴더 선택 버튼 없음** — PRD 보존

**Web Share Target 진입 (`/new?title=&text=&url=`):**
- 파라미터 자동 채움 + 자동 type 판정 + 확인 화면 유지(자동 저장 아님)
- "빠른 저장" 강조: 텍스트 안 건드리고 바로 저장 가능하도록 primary 버튼 첫 화면에서 즉시 클릭 가능

**상태:**
- 저장 중: 버튼 spinner + disabled
- 저장 완료: Toast "저장됨" + 4s 자동 닫힘 + Home으로
- 저장 실패: inline error (필드 위)

### 4.3 `/items/:id` 상세

**레이아웃:**
- sticky 헤더: ← Back / 우측 share·edit·delete 아이콘 (delete만 error color)
- 본문 max-w-800, 세로 흐름
- type별 헤드 영역:
  - Video: aspect-video 섬네일 + play overlay + duration badge(우하단)
  - Image: full-width 이미지 (height auto, max-h 70vh)
  - Article: 없음(메타 영역만)
  - Memo: 없음
- 메타 라인: type chip · 저장 날짜 · status(읽기) — 가로 wrap
- title (display 32)
- URL 링크 (있으면, mono font, 밑줄 ↗)
- ─── divider
- **메모 섹션** — 카드 형태 (`bg-surface`, border, p-24/32)
  - blockquote 안 씀. 단순 `<p>` + `<ul>`만 사용
  - "수정" 버튼은 상단 헤더 edit 아이콘으로 통합 (별도 버튼 X)
- status 변경: 상세 하단에 3-segment toggle (안봤음 / 봤음 / 보관)

**삭제 흐름:**
- delete 아이콘 → ConfirmDialog (모달 OK — 진짜 파괴적 액션)
- 확인 → 삭제 + Home으로 + Toast "삭제됨 · 되돌리기"(undo 4s)

### 4.4 `/folders` (새 화면) — Folders/카테고리 그리드

**현재 라우트에 없는 새 페이지**. BottomNav의 Folders 탭이 여기로.

**레이아웃:**
- 헤더: display "Folders" + body-sm muted "유형과 상태로 정리해서 보세요"
- 2칼럼(모바일) / 3칼럼(데스크탑) 그리드, gap-24
- 카드 1: "전체" (col-span-2 모바일, col-span-1 데스크탑) — h-32, 아이콘 + 카운트 + 이름
- 카드 2-5: 영상 / 글 / 캡처 / 메모 (각 type)
- 카드 6-8: 상태 카드 — 안봤음 / 봤음 / 보관 (별도 섹션 또는 같은 그리드 하단)
- **"새 폴더" dashed slot 없음** — PRD 보존, type/status 고정

**카드 인터랙션:**
- 클릭 → `/?type=video`처럼 Home으로 query 채워 이동

**상태:**
- 모든 카드의 카운트는 mono label로 표시 (e.g., `1,204`)
- 카운트가 0인 카드는 muted text + 비활성처럼 보이게(하지만 클릭 가능)

### 4.5 `/settings`

**레이아웃:**
- 단일 칼럼 max-w-600, padding 24
- 섹션 1: 계정 (이메일 + 로그아웃)
- 섹션 2: PWA 설치 안내 (이미 설치 여부 감지, 미설치 시 install prompt)
- 섹션 3: 테마 (시스템/라이트/다크 3-segment toggle)
- 섹션 4: 데이터 (현재 항목 수 표시, 향후 export 자리)
- 섹션 사이 divider, 섹션 헤더는 label-mono 12px uppercase

### 4.6 `/login` & Landing

**Login:**
- 중앙 카드(max-w-400) + "Check Later" 워드마크 + body-sm "조용한 메모 도구"
- Google OAuth 버튼 (secondary 스타일, Google 로고 + "Google로 계속하기")
- 하단 작은 텍스트: PWA 설치 안내 링크

**Landing(비로그인 `/`):**
- 현재 LandingPage 폐기 또는 단순화 — 1 viewport 짜리 짧은 소개
- display "공유 한 번이면 끝, 30초 안에 찾는다"
- 3 그리드 (저장·분류·조회) 텍스트 중심 설명
- 하단 "시작하기 →" 단일 CTA (→ /login)

---

## 5. 안티패턴 가드레일 (구현 시 체크리스트)

작업하는 모든 step에서 PR/커밋 전에 반드시 점검:

- [ ] `border-left: Npx (N≥2) color` 사용처 0개 (side-stripe 금지)
- [ ] `background-clip: text` 사용처 0개 (그라디언트 텍스트 금지)
- [ ] `backdrop-filter: blur`, `mix-blend-overlay` 사용처 0개 (글래스/블렌드 금지)
- [ ] `border-radius >= 10px` on cards (앱스토어 카드 느낌 금지)
- [ ] 메인 색 외 chromatic accent(amber/blue/green/violet) 토큰 추가 안 했는지
- [ ] `#000`/`#fff` 직접 사용 0개 (warm tint 토큰만)
- [ ] 모든 새 컴포넌트가 `src/components/ui/` 또는 도메인 폴더에 있고 페이지 인라인 아님
- [ ] 모바일 터치 타깃 ≥ 44×44
- [ ] 모든 카드/버튼/입력의 hover/active/focus/disabled 상태 정의됨
- [ ] em dash(—) 직접 입력 금지 — UI 카피에서 콜론/마침표/괄호 사용
- [ ] 모달은 진짜 파괴적 액션(삭제)만. 그 외 BottomSheet/Inline

---

## 6. Phase 분해 (우선순위 P0→P3, 하네스 step 단위로 mapping)

### **P0 — 디자인 토큰 + 원자 컴포넌트 (선행 의존성)**

| Step | 산출물 | AC |
|---|---|---|
| P0-1 | `docs/UI_GUIDE.md` 전면 재작성 (이 문서 §2 기반) | `npm run lint` 통과 |
| P0-2 | `src/index.css` 토큰 교체 + Tailwind v4 `@theme inline` 갱신 | `npm run build` 통과 |
| P0-3 | `src/components/ui/` 신설: Button, IconButton, Chip, Card, Input, Textarea, Divider, Skeleton | 각 컴포넌트 storybook-스타일 데모 라우트(또는 Vitest snapshot) |
| P0-4 | `EmptyState`, `Toast`, `BottomSheet`, `TopAppBar`, `BottomNav` 신설 | `npm run test` 통과 |
| P0-5 | 폰트 로딩: Pretendard(이미 있음) + Geist + JetBrains Mono `@font-face` 또는 self-host | LCP 회귀 없음 |

### **P1 — 핵심 페이지 리뉴얼 (사용자 가치 흐름)**

| Step | 산출물 | AC |
|---|---|---|
| P1-1 | `HomePage` 리뉴얼 — TopAppBar/FilterBar/카드 피드/BottomNav 적용 | 기존 테스트 전부 통과, 시각 회귀 manual |
| P1-2 | `MemoCard`/`VideoCard`/`ImageCard`/`ArticleCard` 4 변형 카드 구현, `ItemCard`는 type별 dispatch | unit test로 각 변형 렌더 확인 |
| P1-3 | `NewItemPage` 리뉴얼 — BottomSheet 스타일, quick option grid, 자동 type chip 표시 | Web Share Target 경로(`?title=&text=&url=`) 회귀 테스트 |
| P1-4 | `ItemDetailPage` 리뉴얼 — sticky header, type별 헤드, status 3-segment, blockquote 제거 | 기존 테스트 통과 + delete confirm 테스트 추가 |
| P1-5 | 스와이프(좌→우 status 토글) + 길게 누르기 BottomSheet (모바일) | `@testing-library/user-event` pointer events 테스트 |

### **P2 — 보조 페이지 + 새 페이지**

| Step | 산출물 | AC |
|---|---|---|
| P2-1 | `/folders` 새 페이지 — type×status 카운트 그리드 + 라우트 등록 | 라우트 진입 → query 채워 Home 이동 동작 |
| P2-2 | `SettingsPage` 리뉴얼 — 4 섹션 구조, 테마 3-segment toggle | 테마 토글 시 dark class 토글 확인 |
| P2-3 | `LoginPage` + Landing 리뉴얼 | 비로그인/로그인 분기 정상 |
| P2-4 | BottomNav 라우트 활성 상태 동기화(현재 경로 기준 active tab) | 각 탭 클릭 시 라우팅 정상 |

### **P3 — 다듬기 & 검증**

| Step | 산출물 | AC |
|---|---|---|
| P3-1 | Empty/Loading/Error 상태 전수 점검 (모든 페이지) | 각 페이지 3종 상태 manual 시연 가능 |
| P3-2 | 안티패턴 가드레일 grep 검사 자동화 (`scripts/check-antipatterns.mjs`) | CI에 포함, 위반 0개 |
| P3-3 | 다크 모드 전수 시각 점검, `prefers-color-scheme` 자동 매칭 확인 | 모든 페이지 라이트/다크 양쪽 정상 |
| P3-4 | a11y 점검: 키보드 네비, focus ring, ARIA, 색 대비 WCAG AA | axe 또는 manual 체크리스트 |
| P3-5 | PWA + Web Share Target 회귀 점검 (manifest 변경 없음 확인) | 빌드된 앱 모바일 install 후 공유 메뉴 동작 확인 |

---

## 7. 변경 영향 범위

**수정될 파일 (예상):**
- `docs/UI_GUIDE.md` 전면
- `src/index.css` 전면
- `src/components/` 디렉토리 구조 재편 + 신규 추가
- `src/pages/HomePage.tsx`, `NewItemPage.tsx`, `ItemDetailPage.tsx`, `SettingsPage.tsx`, `LoginPage.tsx`, `LandingPage.tsx` 전면
- 신규 `src/pages/FoldersPage.tsx`
- `App.tsx` 라우트에 `/folders` 추가
- 기존 테스트 일부 업데이트 (DOM 구조 변경)

**건드리지 않을 영역 (외과적 변경 원칙):**
- `src/services/*` (Supabase 통신 로직)
- `src/hooks/*` (TanStack Query 훅)
- `src/lib/*` (og-parser, form-type-detect, supabase client)
- `src/stores/*` (Zustand)
- `src/types/*`
- `supabase/migrations/*` (DB 스키마)
- PRD/ARCHITECTURE는 그대로 유지 — 본 리뉴얼은 디자인만, 데이터/스키마/기능 추가 없음

---

## 8. 검증 방법

매 step AC + 마지막에 통합:

```bash
npm run lint
tsc --noEmit
npm run test
npm run build
```

추가 manual 점검:
- 모바일 뷰포트(390×844)에서 모든 페이지 시연
- 라이트/다크 토글 시 모든 페이지 시각 회귀 없음
- 안티패턴 grep:
  - `grep -r "border-left:.*px" src/` → 0건 (1px subtle border는 OK)
  - `grep -r "background-clip:.*text" src/` → 0건
  - `grep -r "backdrop-filter" src/` → 0건
  - `grep -r "#000\|#fff" src/` → 0건 (대소문자 무관)

---

## 9. 새 세션 진입 시 절차 (하네스용)

```
1. 이 문서(fix3_design.md) 전체 읽기
2. docs/PRD.md, docs/ARCHITECTURE.md 읽기 (정합성 재확인)
3. /harness 호출 → 위 §6 Phase 분해를 phases/{task}/index.json + step{N}.md로 변환
   - task slug 권장: "design-renewal" 또는 "ui-shape-v3"
4. feature_list.json에 P0~P3의 모든 step 산출물 나열, passes:false
5. P0-1부터 순차 실행
```

**원칙(반드시 step 파일에 명시):**
- 단일 step = 단일 모듈 또는 페이지
- 안티패턴 가드레일(§5)을 모든 step의 AC에 포함
- "이전 대화에서…" 같은 외부 참조 금지 (자기완결적)
