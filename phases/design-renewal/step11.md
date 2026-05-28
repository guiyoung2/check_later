# Step 11: settings-page-renewal

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/UI_GUIDE.md` — 토큰, 타이포, 안티패턴 가드레일
- `fix3_design.md` — §4.5 Settings 명세 전체
- `src/pages/SettingsPage.tsx` — 현재 구현 파악
- `src/components/ui/Divider.tsx` — step 2에서 생성
- `src/stores/` — 테마 상태 관리 파악

## 작업

`src/pages/SettingsPage.tsx`를 fix3_design.md §4.5 기준으로 리뉴얼한다.

### 레이아웃

```
┌─ TopAppBar ───────────────────────────────────┐
│     Settings                                  │
└───────────────────────────────────────────────┘

┌─ 본문 (max-w-600, mx-auto, px-6, py-6) ──────┐
│                                               │
│ ACCOUNT ← label-mono 12px uppercase           │
│ ─────────────────────────────────────────     │
│ user@example.com          [로그아웃]           │
│                                               │
│ APP ← label-mono                              │
│ ─────────────────────────────────────────     │
│ 앱 설치                                       │
│ 홈 화면에 추가하면 더 빠르게 사용할 수 있어요  │
│ [홈 화면에 추가] ← 미설치 시만 표시           │
│                                               │
│ THEME ← label-mono                            │
│ ─────────────────────────────────────────     │
│ [시스템] [라이트] [다크] ← 3-segment toggle   │
│                                               │
│ DATA ← label-mono                             │
│ ─────────────────────────────────────────     │
│ 저장된 항목  1,204개 ← mono font              │
│                                               │
└───────────────────────────────────────────────┘

┌─ BottomNav ───────────────────────────────────┘
```

### 구현 상세

**섹션 헤더:**
- `font-family-mono`, 12px, uppercase, `text-muted`, `letter-spacing: 0.08em`
- 섹션 사이 `<Divider />` (step 2에서 구현)

**PWA 설치 섹션:**
- `window.matchMedia('(display-mode: standalone)')` 또는 `navigator.standalone`으로 이미 설치 감지
- 이미 설치됨: "이미 설치되어 있어요" 텍스트 표시 (버튼 없음)
- 미설치: 설치 유도 버튼 표시 (BeforeInstallPromptEvent 활용)

**테마 3-segment toggle:**
- '시스템' / '라이트' / '다크' 3개 세그먼트
- 선택 값을 localStorage 또는 Zustand store에 저장
- '시스템' 선택 시: `prefers-color-scheme` 미디어 쿼리 따름
- '라이트'/'다크' 선택 시: `<html>` 또는 `<body>`에 `class="light"` / `class="dark"` 토글
- `src/index.css`에서 `.dark` 클래스 기반 다크 모드 오버라이드 추가 (미디어 쿼리 + 클래스 이중 지원)

**데이터 섹션:**
- 현재 저장된 항목 수를 TanStack Query로 조회해서 표시
- 추후 export 기능을 위한 자리 확보 (UI placeholder 불필요 — 현재는 카운트만)

## Acceptance Criteria

```bash
npm run build
npm run test -- --run
```

빌드 통과, 테스트 회귀 없음. 테마 토글 시 `class="dark"` 토글 확인 테스트.

## 검증 절차

1. `npm run build && npm run test -- --run`
2. 테마 toggle 테스트:
   - "다크" 선택 → `document.documentElement.classList` 또는 body에 `dark` 클래스 추가 확인
   - "라이트" 선택 → `dark` 클래스 제거 확인
   - "시스템" 선택 → 미디어 쿼리 따름 확인
3. 안티패턴 grep:
   ```bash
   grep -r "border-left\|backdrop-filter" src/pages/SettingsPage.tsx
   grep -r "#000\|#fff" src/pages/SettingsPage.tsx
   ```
   모두 0건
4. 결과에 따라 `phases/design-renewal/index.json`의 step 11 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "SettingsPage 리뉴얼 — 4섹션 구조, 테마 3-segment toggle(dark class 토글), PWA 설치 감지 완료"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- 테마 토글에 chromatic color(amber/blue 등)를 쓰지 마라. 이유: 모노톤 설계.
- 데이터 섹션에 export 버튼을 구현하지 마라. 이유: PRD MVP 제외 항목.
- `src/services/*`, `src/hooks/*`를 수정하지 마라. 이유: UI 레이어만 수정.
- 글래스모피즘, blur 효과를 설정 UI에 추가하지 마라. 이유: 안티패턴.
