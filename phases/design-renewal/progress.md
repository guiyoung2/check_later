# design-renewal 진행 현황

## 마지막 업데이트
2026-05-28T21:47:00+0900 — Step 7/19 완료

## 완료된 작업
- Step 0: ui-guide-rewrite — docs/UI_GUIDE.md 전면 재작성 완료 — 모노톤 토큰 + 안티패턴 가드레일 포함
- Step 1: design-tokens — src/index.css 모노톤 CSS 변수 + Tailwind v4 @theme inline 갱신 완료, amber/terracotta 제거
- Step 2: atomic-ui-components — src/components/ui/ 신설 — Button/IconButton/Chip/Card/Input/Textarea/Divider/Skeleton 8개 구현 완료
- Step 3: layout-components — EmptyState/Toast/BottomSheet/TopAppBar/BottomNav 구현 완료, useToast hook 포함
- Step 4: font-loading — Pretendard/Geist/JetBrains Mono 폰트 로딩 완료, font-display:swap 적용
- Step 5: home-page-renewal — HomePage 리뉴얼 — TopAppBar/FilterBar/BottomNav 적용, 3가지 상태(로딩/빈/에러) 처리 완료
- Step 6: type-variant-cards — MemoCard/VideoCard/ImageCard/ArticleCard 4변형 구현, ItemCard type dispatch 완료

## 현재 진행 중
- Step 7: new-item-page-renewal

## 다음 할 일
- Step 7: `/new` 페이지 리뉴얼 — BottomSheet 스타일, 빠른 옵션 칩(링크/텍스트/이미지), autofocus textarea, URL 자동 감지 + type chip 표시
- Web Share Target 진입 경로(`?title=&text=&url=`) 회귀 테스트 포함 필요
- 기존 `src/pages/NewItemPage.tsx` 구조를 먼저 파악하고 작업 시작

## 주의사항
- **ItemCard dispatch 후 HomePage 테스트 수정**: `link` role 단언을 `getByText('읽을 글')` 로 교체함. 구 ItemCard가 `<Link>` 직접 렌더 → 신규 카드는 article+onClick 구조이기 때문.
- **useSignedUrl 훅**: `src/components/items/useSignedUrl.ts`에 위치. `src/hooks/*` 폴더가 아니므로 기존 hooks 수정 규칙에 위배되지 않음.
- **storageService 모킹**: ItemCard.test.tsx의 mock path `'../services/storageService'`가 useSignedUrl 내부 import와 동일 절대경로로 해석됨 — 기존 테스트 통과 유지.
- **Card overflow-hidden**: VideoCard, ImageCard는 이미지가 카드 상단에 붙으므로 `<Card className="overflow-hidden">` 필수. 빠뜨리면 이미지가 rounded-md 외부로 삐져나옴.
- dev 서버: 5173 포트 사용 중이면 5174 포트로 자동 이동.
