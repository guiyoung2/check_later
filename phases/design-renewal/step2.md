# Step 2: atomic-ui-components

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md`
- `docs/UI_GUIDE.md` — 토큰, 타이포, 반경, 안티패턴 가드레일
- `fix3_design.md` — §3 컴포넌트 원자 설계, §5 안티패턴 가드레일
- `src/index.css` — step 1에서 갱신된 CSS 변수 확인

## 작업

`src/components/ui/` 디렉토리를 신설하고 아래 8개 원자 컴포넌트를 구현한다.

### 디렉토리 구조

```
src/components/ui/
├ Button.tsx
├ IconButton.tsx
├ Chip.tsx
├ Card.tsx
├ Input.tsx
├ Textarea.tsx
├ Divider.tsx
└ Skeleton.tsx
```

### 컴포넌트 인터페이스 (시그니처)

```tsx
// Button: primary/secondary/ghost/danger 4가지 variant
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

// IconButton: 아이콘 전용, 44×44 터치 타깃
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md';
  'aria-label': string;  // 필수
}

// Chip: type/status/count 3가지 variant
interface ChipProps {
  variant?: 'type' | 'status' | 'count';
  leftIcon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

// Card: hoverable 옵션, as로 렌더 엘리먼트 지정
interface CardProps {
  hoverable?: boolean;
  as?: 'article' | 'a' | 'div';
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

// Input: 포커스 시 border-strong
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

// Textarea: 포커스 시 border-strong, autofocus 지원
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

// Divider: 단순 수평 구분선
interface DividerProps {
  className?: string;
}

// Skeleton: 카드 로딩용, width/height 지정 가능
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}
```

### 스타일 원칙

- **Button primary**: `bg-text-primary text-bg`, hover 시 opacity 80%
- **Button secondary**: `bg-surface border border-border text-text-primary`
- **Button ghost**: 배경 없음, hover 시 `bg-surface-sub`
- **Button danger**: `bg-error text-bg` 또는 `text-error border-error`
- **Chip (type variant)**: `bg-surface-sub`, label-mono 폰트 12px, radius-xs(2px)
- **Chip (status/count variant)**: `bg-surface-sub`, label 폰트 13px
- **Card**: border `border-border`, radius-md(6px), 그림자 없음 기본. hoverable이면 hover 시 `shadow-card`
- **Skeleton**: `bg-surface-sub` + animate-pulse, radius-md

**모든 컴포넌트 공통:**
- hover/active/focus/disabled 4가지 상태 모두 정의
- focus-visible 시 `ring-2 ring-border-strong` (outline 대신)
- 터치 타깃: 버튼류 모두 min-h-[44px] 또는 min-w-[44px]

## Acceptance Criteria

```bash
npm run build
npm run test -- --run
```

빌드 및 기존 테스트 모두 통과. 새로 추가한 컴포넌트가 Vitest snapshot 또는 render 테스트가 있으면 통과.

## 검증 절차

1. `npm run build` — 컴파일 에러 없음 확인
2. `npm run test -- --run` — 기존 테스트 회귀 없음 확인
3. 안티패턴 수동 grep:
   ```bash
   grep -r "border-left" src/components/ui/
   grep -r "backdrop-filter" src/components/ui/
   grep -r "background-clip" src/components/ui/
   grep -r "#000\|#fff" src/components/ui/
   ```
   모두 0건이어야 함
4. 결과에 따라 `phases/design-renewal/index.json`의 step 2 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "src/components/ui/ 신설 — Button/IconButton/Chip/Card/Input/Textarea/Divider/Skeleton 8개 구현 완료"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- `border-left: 3px 이상 + color` 조합을 사용하지 마라. 이유: side-stripe 안티패턴.
- `backdrop-filter: blur`, `background-clip: text`를 사용하지 마라. 이유: 글래스모피즘/그라디언트 텍스트 안티패턴.
- Card의 border-radius를 10px 이상으로 설정하지 마라. 이유: 앱스토어 카드 느낌 금지, 6px(radius-md) 사용.
- `#000` 또는 `#fff`를 직접 쓰지 마라. 이유: CSS 변수 토큰만 사용.
- `any` 타입을 사용하지 마라. 이유: TypeScript 타입 안전성 유지.
- `src/components/` 루트에 파일을 두지 마라. 이유: `ui/` 하위에만 원자 컴포넌트를 배치한다.
- 기존 `src/components/ItemCard.tsx`, `FilterBar.tsx`, `ThemeToggleButton.tsx`, `ProtectedRoute.tsx`를 건드리지 마라. 이유: 도메인 컴포넌트 리뉴얼은 이후 step에서 진행한다.
