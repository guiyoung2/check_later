# Step 3: layout-components

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md`
- `docs/UI_GUIDE.md` — 토큰, 반경, 안티패턴 가드레일
- `fix3_design.md` — §3 컴포넌트 인터페이스, §4.1 TopAppBar/BottomNav 명세
- `src/components/ui/Button.tsx`, `src/components/ui/IconButton.tsx` — step 2에서 생성된 원자 컴포넌트 확인
- `src/stores/` — Zustand store 파악 (Toast 상태 관리 방식 결정에 필요)

## 작업

아래 5개 레이아웃/오버레이 컴포넌트를 구현한다.

### 디렉토리 구조

```
src/components/ui/
├ EmptyState.tsx
├ Toast.tsx         (+ useToast hook 또는 Zustand slice)
├ BottomSheet.tsx
├ TopAppBar.tsx
└ BottomNav.tsx
```

> `BottomNav.tsx`는 `src/components/nav/BottomNav.tsx`로 배치해도 되고, `ui/` 안에 배치해도 된다. 프로젝트 구조 일관성에 따라 결정하라.

### 컴포넌트 인터페이스 (시그니처)

```tsx
// EmptyState: 따뜻한 비어있음
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Toast: 4초 자동 닫힘, undo 지원
interface ToastProps {
  message: string;
  undo?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;  // 기본 4000ms
}

// BottomSheet: 모바일 전용, 드래그 핸들 포함
interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  dragHandle?: boolean;
  children: React.ReactNode;
}

// TopAppBar: h-16 고정 헤더
interface TopAppBarProps {
  title?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

// BottomNav: 4탭 fixed 하단 내비게이션
// 탭: Home('/', home_icon), New('/new', add_icon), Folders('/folders', folder_icon), Settings('/settings', settings_icon)
// 현재 경로 기준 active 탭 강조 — react-router useLocation 사용
interface BottomNavProps {
  // props 없음, 내부에서 useLocation으로 현재 경로 감지
}
```

### 구현 상세

**Toast:**
- 화면 하단 중앙 고정 (z-50 이상)
- `duration`ms 후 자동 닫힘 (`setTimeout` + cleanup)
- undo 버튼이 있으면 클릭 시 콜백 실행 후 Toast 닫힘
- 전역 toast를 띄울 수 있도록 Zustand store 또는 Context + hook(`useToast`) 구현
- Toast 컴포넌트 자체는 `ToastProvider`가 감싸거나 `App.tsx`에서 렌더

**BottomSheet:**
- 모바일에서만 표시 (데스크탑 breakpoint에서 숨김: `md:hidden` 또는 JS로 감지)
- `open=true`일 때 아래에서 위로 슬라이드 (`transform + transition`)
- 배경 overlay: `bg-text-primary/20`, 클릭 시 `onClose`
- `dragHandle=true`이면 상단 12×4 핸들 바 표시 (`bg-border`, radius-full)
- radius: `radius-lg(8px)` — 상단 좌우 모서리에만 적용
- `open=false`일 때도 DOM에 마운트 유지 (transition out을 위해)

**TopAppBar:**
- `h-16`(64px), `bg-surface`, `border-b border-border`
- 좌/우 영역에 `leftAction`/`rightAction` 슬롯
- `title`이 있으면 가운데 headline 24px weight 600

**BottomNav:**
- `h-16`(64px) fixed bottom-0, `bg-surface`, `border-t border-border`
- 아이콘 + 라벨 텍스트 조합, active 탭은 `text-text-primary`, 비활성은 `text-text-muted`
- `/new` 탭은 중앙에 IconButton 스타일로 강조 (선택 사항 — 구현 재량)
- **Search 탭 없음**. 탭 순서: Home / New / Folders / Settings

## Acceptance Criteria

```bash
npm run build
npm run test -- --run
```

빌드 통과, 기존 테스트 회귀 없음.

## 검증 절차

1. `npm run build` — 컴파일 에러 없음 확인
2. `npm run test -- --run` — 기존 테스트 회귀 없음 확인
3. 안티패턴 수동 grep:
   ```bash
   grep -r "backdrop-filter\|blur" src/components/ui/
   grep -r "border-radius.*[1-9][0-9]px" src/components/ui/
   ```
   결과 0건이어야 함
4. 결과에 따라 `phases/design-renewal/index.json`의 step 3 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "EmptyState/Toast/BottomSheet/TopAppBar/BottomNav 구현 완료, useToast hook 포함"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- BottomSheet에 `backdrop-filter: blur`를 사용하지 마라. 이유: 글래스모피즘 안티패턴.
- BottomSheet의 radius를 8px 초과로 설정하지 마라. 이유: `radius-lg(8px)`가 이 프로젝트의 최대치.
- BottomNav에 Search 탭을 추가하지 마라. 이유: PRD에서 검색은 MVP 제외 항목.
- Toast에 chromatic color(amber/blue/green)를 쓰지 마라. 이유: 모노톤 설계.
- `src/services/*`, `src/hooks/*`, `src/stores/*`의 기존 파일을 수정하지 마라. 이유: 이 step은 UI 컴포넌트만 추가한다. (Zustand slice 추가는 허용)
