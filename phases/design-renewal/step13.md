# Step 13: bottomnav-routing

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md` — 라우트 구조
- `fix3_design.md` — §4.1 BottomNav 4탭 명세
- `src/components/ui/BottomNav.tsx` (또는 `src/components/nav/BottomNav.tsx`) — step 3에서 생성된 파일
- `src/App.tsx` — 라우트 등록 현황 파악
- `src/pages/FoldersPage.tsx` — step 10에서 생성

## 작업

BottomNav의 라우트 활성 상태를 현재 경로 기준으로 정확히 동기화한다.

### 활성 탭 판정 규칙

```tsx
// react-router useLocation 사용
const { pathname } = useLocation();

const tabs = [
  { path: '/',         label: 'Home',     icon: 'home'     },
  { path: '/new',      label: 'New',      icon: 'add'      },
  { path: '/folders',  label: 'Folders',  icon: 'folder'   },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

// 활성 판정: pathname이 tab.path와 일치하거나 시작하는 경우
// 단, '/'는 정확히 일치 또는 '/items'로 시작할 때만 active
const isActive = (tabPath: string): boolean => {
  if (tabPath === '/') return pathname === '/' || pathname.startsWith('/items');
  return pathname.startsWith(tabPath);
};
```

### 스타일 규칙

- **active 탭**: 아이콘 `text-text-primary`, 라벨 `text-text-primary`, weight 500
- **비활성 탭**: 아이콘 `text-text-muted`, 라벨 `text-text-muted`, weight 400
- active indicator: 아이콘 위 dot 또는 underline (선택 사항, 과하지 않게)
- `/new` 탭: 강조 스타일 (다른 탭보다 눈에 띄게. 단, chromatic accent 금지)

### 전체 통합 확인

step 3에서 BottomNav를 구현했으나, 이 step에서:
1. active 판정 로직이 정확한지 확인 및 수정
2. `/folders` 탭이 step 10에서 라우트 추가된 FoldersPage로 정상 이동하는지 확인
3. `/new` 탭 클릭 시 navigate('/new') 정상 동작 확인
4. 모든 페이지(Home/New/Folders/Settings/Detail)에서 BottomNav가 표시되는지 확인 (`ItemDetailPage`에서도 Bottom Nav 노출 여부 결정 — fix3_design.md 확인)

### `/items/:id` 에서 BottomNav 처리

fix3_design.md §4.3: 상세 페이지는 sticky 헤더 중심. BottomNav 표시 여부는 명시되지 않음. 모바일 UX 일관성을 위해 숨기거나 표시하되 일관성 유지.

## Acceptance Criteria

```bash
npm run build
npm run test -- --run
```

빌드 통과, 기존 테스트 회귀 없음. 각 탭 클릭 시 라우팅 정상 및 active 탭 강조 확인.

## 검증 절차

1. `npm run build && npm run test -- --run`
2. 라우팅 테스트:
   - `/` → Home 탭 active
   - `/folders` → Folders 탭 active
   - `/settings` → Settings 탭 active
   - `/items/some-id` → Home 탭 active (items 경로는 Home에 속함)
3. 결과에 따라 `phases/design-renewal/index.json`의 step 13 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "BottomNav 라우트 활성 상태 동기화 완료 — 4탭 경로 매칭 정확, /folders 탭 정상 동작"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- BottomNav에 Search 탭을 추가하지 마라. 이유: PRD MVP 제외 항목.
- active 탭 강조에 chromatic accent(amber/blue/green)를 사용하지 마라. 이유: 모노톤 설계.
- `src/services/*`, `src/hooks/*`, `src/stores/*`를 수정하지 마라. 이유: 라우팅 및 UI 레이어만 수정.
