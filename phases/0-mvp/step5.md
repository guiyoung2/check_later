# Step 5: home-page

## 읽어야 할 파일

먼저 아래 파일들을 읽고 디자인 의도와 현재 코드를 파악하라:

- `docs/UI_GUIDE.md` — 컬러 토큰, 컴포넌트 규칙, AI Slop 안티패턴 목록
- `docs/PRD.md` — 사용자 페르소나 ("조회 시: 여유롭고 집중. 필터/정렬로 30초 안에 찾는다"), 핵심 기능
- `docs/ARCHITECTURE.md` — 라우트 목록
- `src/types/index.ts` — Item, ItemType, ItemStatus 타입 (step 0 산출물)
- `src/hooks/useItems.ts` — useItems 훅 (step 4 산출물)
- `src/stores/filterStore.ts` — useFilterStore 훅 (step 4 산출물)
- `src/index.css` — 사용 가능한 Tailwind CSS 커스텀 컬러 토큰 확인

## 작업

### 1. `src/components/FilterBar.tsx` 생성

type 칩 + status 칩 필터 UI. filterStore와 연결된다.

```typescript
// props 없음. filterStore에서 직접 상태를 읽고 쓴다.
export function FilterBar(): JSX.Element
```

디자인 규칙:
- 칩 형태: border-radius `999px` (UI_GUIDE.md 칩 규칙)
- 선택된 칩: `bg-[--color-accent-bg]` + `text-[--color-accent]`
- 비선택 칩: `bg-[--color-surface]` + `border border-[--color-border]`
- 칩 클릭 시 같은 값이면 null(해제), 다른 값이면 해당 값으로 설정
- type 칩 레이블: 영상 / 글 / 캡처 / 메모 (video/article/screenshot/memo)
- status 칩 레이블: 안 봤음 / 봤음 / 보관 (pending/reviewed/archived)
- 두 그룹을 수평 스크롤로 배치 (모바일 대응)

### 2. `src/components/ItemCard.tsx` 생성

아이템 한 행을 표시하는 컴포넌트.

```typescript
interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps): JSX.Element
```

디자인 규칙 (UI_GUIDE.md 안티패턴 참고):
- 텍스트 우선 리스트 행. 썸네일이 있으면 보조로 우측에 작게 표시.
- 동일 크기 카드 그리드 금지 → 가로 전체 리스트 행으로 구현
- border-radius: 6px (카드 규칙)
- 그림자: `shadow-[0_1px_3px_oklch(20%_0.01_80_/_0.08)]` (라이트), 다크에서는 없음
- 표시 정보: title (굵게), type 레이블, status 레이블, 상대 날짜 (created_at)
- 클릭 시 `/items/:id`로 이동 (`react-router-dom`의 `Link` 또는 `useNavigate` 사용)
- 긴 title은 한 줄로 자르고 말줄임표 처리

### 3. `src/pages/HomePage.tsx` 완전 구현

FilterBar + ItemCard 리스트 + 빈 상태를 구성하라.

```typescript
export default function HomePage(): JSX.Element
```

구현 규칙:
- `useItems()`로 데이터를 가져온다.
- 로딩 중: 스켈레톤 또는 간단한 로딩 표시 (애니메이션 없이도 됨)
- 에러 발생: "잠시 후 다시 시도해주세요" 수준 메시지
- 빈 상태 (항목이 없을 때):
  - "Nothing here yet" 금지
  - 따뜻한 한국어 안내 문구 (예: "아직 저장한 항목이 없어요")
  - `/new`로 이동하는 버튼 포함
- 상단 고정 헤더: 앱 이름 + `/new`로 이동하는 + 버튼
- `FilterBar`를 헤더 아래에 배치
- 아이템 목록은 FilterBar 아래 수직 리스트

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm test        # 기존 테스트 통과
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. `phases/0-mvp/index.json`의 step 5를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "FilterBar(type/status 칩) + ItemCard(텍스트 우선 리스트 행) + HomePage(로딩/빈상태/목록) 구현"`
   - 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`

## 금지사항

- 동일 크기 카드 그리드 레이아웃을 사용하지 마라. 이유: UI_GUIDE.md AI Slop 안티패턴.
- 뉴스/피드 썸네일 그리드를 만들지 마라. 텍스트 우선 리스트 행으로 구현해야 한다.
- 빈 상태에 "Nothing here yet"을 쓰지 마라. 이유: UI_GUIDE.md 안티패턴.
- 히어로 메트릭 ("저장한 항목 N개")을 추가하지 마라. 이유: 개인 도구에 불필요한 대시보드 느낌.
- border-radius 10px 이상 카드를 사용하지 마라. 이유: 앱스토어 카드 느낌, 6px 이하 유지.
- 파란 계열 액센트를 사용하지 마라.
- 기존 테스트를 깨뜨리지 마라.
