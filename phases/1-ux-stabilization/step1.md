# Step 1: theme-system

## 읽어야 할 파일

먼저 아래 파일들을 읽고 현재 테마 초기화와 UI 패턴을 파악하라:

- `docs/UI_GUIDE.md` — 컬러 토큰, 다크모드 원칙, 터치 타깃 기준
- `src/main.tsx` — 시스템 테마 감지와 localStorage override 초기화
- `src/pages/HomePage.tsx` — 현재 홈 전용 다크모드 토글
- `src/pages/LandingPage.tsx` — 비인증 랜딩 헤더
- `src/pages/HomePage.test.tsx` — 현재 다크모드 테스트
- `phases/1-ux-stabilization/step0.md` — 이전 step 의도

## 작업

### 1. 재사용 가능한 테마 훅 추가

`src/hooks/useTheme.ts`를 추가하고 아래 인터페이스를 제공하라:

```typescript
export type ThemeMode = 'light' | 'dark';

export function useTheme(): {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
}
```

동작 규칙:

- 초기값은 `document.documentElement.classList.contains('dark')`를 기준으로 한다.
- `toggleTheme`은 `document.documentElement.classList`와 `localStorage.theme`을 함께 갱신한다.
- `main.tsx`의 기존 초기화 정책을 유지한다: 저장된 `theme`이 있으면 저장값 우선, 없으면 시스템 선호를 따른다.
- 훅 안에서 불필요한 전역 이벤트 구독을 추가하지 마라. 이 step의 목적은 현재 수동 토글을 안전하게 공유하는 것이다.

### 2. 아이콘 버튼 컴포넌트 추가

`src/components/ThemeToggleButton.tsx`를 추가하라.

```typescript
interface ThemeToggleButtonProps {
  className?: string;
}

export function ThemeToggleButton({ className }: ThemeToggleButtonProps): JSX.Element
```

표시 규칙:

- 다크모드 상태에서는 라이트 모드로 전환하는 의미의 아이콘을 보여준다.
- 라이트모드 상태에서는 다크 모드로 전환하는 의미의 아이콘을 보여준다.
- 버튼의 접근 가능한 이름은 기존과 동일하게 `라이트 모드로 전환` 또는 `다크 모드로 전환`이어야 한다.
- 버튼 안에 `다크`, `라이트` 같은 표시 텍스트를 넣지 마라.
- 현재 프로젝트에 lucide 아이콘 의존성이 없으므로 새 패키지를 추가하지 말고, 작고 명확한 inline SVG를 사용하라.

### 3. HomePage에 적용

`HomePage`의 로컬 `dark` state와 `toggleDark` 함수를 제거하고 `ThemeToggleButton`을 사용하라. 기존 테스트가 접근 가능한 이름으로 토글을 찾을 수 있어야 한다.

## Acceptance Criteria

```bash
npm run build
npm test
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 홈에서 테마 버튼 클릭 시 `html.dark`와 `localStorage.theme`이 함께 갱신되는 테스트가 통과하는지 확인한다.
3. `phases/1-ux-stabilization/index.json`의 step 1을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "useTheme와 ThemeToggleButton 추가, 홈 다크모드 토글을 아이콘 버튼으로 변경"`
   - 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
4. `phases/1-ux-stabilization/feature_list.json`에서 `feat-3`, `feat-5`를 통과 처리한다.
5. `phases/1-ux-stabilization/progress.md`의 다음 할 일과 주의사항을 갱신한다.

## 금지사항

- 테마 상태 관리를 Zustand로 옮기지 마라. 이유: 현재 요구는 localStorage + html class 동기화만으로 충분하다.
- 새 아이콘 패키지를 설치하지 마라. 이유: 아이콘 2개 때문에 의존성을 추가하는 것은 과하다.
- `main.tsx`의 시스템 선호 감지와 저장값 우선 정책을 제거하지 마라. 이유: 앱 최초 진입 테마가 여기서 결정된다.
- 기존 테스트를 깨뜨리지 마라.
