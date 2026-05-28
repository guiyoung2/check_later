# Step 6: type-variant-cards

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md` — items 테이블 스키마 (type enum: video/article/screenshot/memo)
- `docs/UI_GUIDE.md` — 토큰, 타이포, 안티패턴 가드레일
- `fix3_design.md` — §4.1 카드 변형 ASCII 목업 전체
- `src/types/` — Item 타입 정의 확인
- `src/components/ItemCard.tsx` — 기존 구현 파악
- `src/components/ui/Card.tsx`, `src/components/ui/Chip.tsx` — step 2에서 생성

## 작업

`src/components/items/` 디렉토리를 신설하고 4가지 변형 카드를 구현한다. 기존 `ItemCard`는 type별 dispatch 역할로 리뉴얼한다.

### 디렉토리 구조

```
src/components/items/
├ MemoCard.tsx
├ VideoCard.tsx
├ ImageCard.tsx
└ ArticleCard.tsx
```

기존 `src/components/ItemCard.tsx`는 제자리에 유지하되, 내부를 type별 dispatch로 교체한다.

### 카드 공통 원칙

- `<Card hoverable as="article">` 래퍼 사용 (step 2에서 구현한 Card 컴포넌트)
- `border border-border`, `rounded-md`(6px), 그림자 없음
- type chip은 `<Chip variant="type">` 사용, 우측에 타임스탬프(JetBrains Mono, label-mono 12px)
- 카드 클릭 → `navigate('/items/:id')` (onClick prop으로 전달)

### MemoCard

```
┌──────────────────────────────────┐
│ [메모] · 오늘 14:23              │  ← Chip(type) + 시각(mono)
│ 오늘의 생각                      │  ← headline 24px weight 500
│ 디자인 시스템에서 중요한 것은…   │  ← body 16px, 3-line clamp
└──────────────────────────────────┘
```

### VideoCard

```
┌──────────────────────────────────┐
│ ┌────────────────────────────┐   │
│ │  ▶  섬네일 이미지          │   │  ← aspect-video, dim overlay 20%
│ └────────────────────────────┘   │
│ [영상] · 어제 20:15              │
│ React 18 동시성 가이드           │  ← headline 24px
│ youtube.com/watch?v=… ↗          │  ← body-sm, text-muted, mono font
└──────────────────────────────────┘
```

- 섬네일: `image_path`가 있으면 그 이미지, 없으면 `bg-surface-sub` placeholder
- play overlay: `▶` 아이콘 중앙, 배경 `rgba(8,6,3,0.2)`
- URL은 hostname 정도만 표시 (full URL은 너무 김)

### ImageCard (type: screenshot)

```
┌──────────────────────────────────┐
│ ┌────────────────────────────┐   │
│ │        큰 이미지           │   │  ← h-64, object-cover
│ └────────────────────────────┘   │
│ [캡처] · 3월 12일                │
│ 영감을 주는 데스크 셋업          │  ← headline 24px
│ 메모가 있으면 1줄 표시           │  ← body-sm, line-clamp-1
└──────────────────────────────────┘
```

### ArticleCard (type: article)

```
┌──────────────────────────────────┐
│ [글] · 3시간 전                  │
│ 좋은 컴포넌트는 무엇인가         │  ← headline 24px
│ 메모가 있으면 1줄 표시           │  ← body-sm, line-clamp-1
│ ─────────────────────────────    │  ← Divider
│ [OG 64×64] example.com           │  ← 좌측 이미지 + 우측 hostname
└──────────────────────────────────┘
```

- OG 섬네일: `image_path`로 표시, 없으면 도메인 파비콘 또는 placeholder
- hostname: `new URL(item.url).hostname` 사용

### ItemCard (dispatch)

```tsx
// ItemCard: item.type 기준 dispatch
function ItemCard({ item, onClick }: { item: Item; onClick: () => void }) {
  switch (item.type) {
    case 'memo':       return <MemoCard item={item} onClick={onClick} />;
    case 'video':      return <VideoCard item={item} onClick={onClick} />;
    case 'screenshot': return <ImageCard item={item} onClick={onClick} />;
    case 'article':    return <ArticleCard item={item} onClick={onClick} />;
    default:           return <MemoCard item={item} onClick={onClick} />;
  }
}
```

## Acceptance Criteria

```bash
npm run build
npm run test -- --run
```

빌드 통과, 기존 테스트 회귀 없음. 각 변형 카드의 render 테스트 추가 (타입별 mock item → 렌더 오류 없음).

## 검증 절차

1. `npm run build && npm run test -- --run`
2. 안티패턴 grep:
   ```bash
   grep -r "border-left\|backdrop-filter\|background-clip" src/components/items/
   grep -r "#000\|#fff" src/components/items/
   grep -r "border-radius.*[1-9][0-9]px" src/components/items/
   ```
   모두 0건
3. 결과에 따라 `phases/design-renewal/index.json`의 step 6 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "MemoCard/VideoCard/ImageCard/ArticleCard 4변형 구현, ItemCard type dispatch 완료"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- `border-left: 3px 이상 + color`를 사용하지 마라. 이유: side-stripe 안티패턴.
- Card border-radius를 10px 이상으로 설정하지 마라. 이유: 앱스토어 카드 느낌 금지.
- `backdrop-filter`, `background-clip: text`를 사용하지 마라.
- 기존 `src/components/ItemCard.tsx`를 삭제하지 마라. 이유: 기존 import 경로를 유지해야 HomePage가 깨지지 않는다. dispatch 역할로 내부만 교체.
- `src/hooks/*`, `src/services/*`를 수정하지 마라. 이유: UI 컴포넌트만 추가한다.
