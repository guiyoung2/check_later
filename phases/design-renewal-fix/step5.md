# Step 5: feed-card-redesign

## 읽어야 할 파일

- `fix5.md` — §2-G(피드 카드 재설계), §5(확정: **컴팩트 리스트 행**)
- `docs/UI_GUIDE.md` — 토큰, 카드 radius(≥10px 금지), 안티패턴
- `docs/PRD.md` — "1주일 뒤에도 30초 안에 찾는다"(밀도/스캔성 중요)
- `src/components/ItemCard.tsx` — **디스패처 + 제스처(스와이프 status 변경 / 롱프레스 BottomSheet / 데스크탑 메뉴)**. 시각은 variant에 위임
- `src/components/items/ArticleCard.tsx`, `VideoCard.tsx`, `MemoCard.tsx`, `ImageCard.tsx` — 4종 카드(현재 큰 카드 + `object-cover` 크롭/`h-64`/`aspect-video`)
- `src/components/items/CardStatusBadge.tsx` — 상태 라벨(재사용)
- `src/components/items/useSignedUrl.ts`, `cardUtils.ts` — 썸네일 signed URL / 날짜 포맷
- `src/components/ItemCard.test.tsx`, `src/components/items/ItemVariantCards.test.tsx` — 유지/갱신할 계약(제목·타입칩·hostname·썸네일 alt·제스처·메뉴)

## 작업

피드 카드를 **컴팩트 리스트 행**으로 재설계한다(좌측 소형 썸네일 + 우측 제목/메타). main의 "텍스트 우선 한 행 + 보조 썸네일" 방향에 가깝게, 밀도를 높이고 "그냥 큰 네모 박스" 인상을 제거한다.

방향:
1. **행(row) 레이아웃**: 좌측에 작은 썸네일(있는 타입만; 예 64~96px 정사각/4:3), 우측에 타입칩·상태·날짜(메타) + 제목 + (선택)메모 1줄.
2. **썸네일 크롭 완화**: 큰 `object-cover` 크롭 대신 작은 보조 썸네일 또는 비율 보존(`object-contain`)으로 잘림 불만 해소. 썸네일 없으면 행이 텍스트만으로 깔끔히.
3. **타입별 차이**: 영상은 재생 오버레이/배지, 캡처/글은 썸네일 유무로 자연스럽게. 4종이 동일 골격이되 과한 장식 금지.
4. 카드 높이·여백 축소로 한 화면에 더 많은 항목.

## 핵심 규칙 (회귀 금지)
- `ItemCard.tsx`의 **제스처 로직(스와이프 80px → status 변경 + undo toast, 롱프레스 500ms → BottomSheet, 데스크탑 카드 메뉴/삭제 확인)** 을 보존하라. 시각만 바꾼다. 제스처 핸들러/`data-testid="item-card-gesture"`/메뉴/`'상태 변경:'`/`'정말 삭제할까요?'` 등 테스트가 의존하는 훅·텍스트를 제거하지 마라.
- 썸네일 `alt`는 `${item.title} 썸네일` 형식 유지(ItemCard.test가 `findByAltText`로 조회).
- VideoCard hostname 표기 `"{hostname} ↗"` 유지(ItemVariantCards.test 단언).
- 카드 `border-radius ≥ 10px` 금지, side-stripe/glass/gradient text 금지, `#000`/`#fff` 직접 사용 금지.

## Acceptance Criteria

```bash
npm run build
npm run test
```

빌드·테스트 통과. 카드 구조 변경으로 셀렉터가 바뀌면 `ItemCard.test.tsx`/`ItemVariantCards.test.tsx`를 **계약을 유지하는 선에서** 갱신(제목/타입/hostname/썸네일 alt/제스처/메뉴 동작은 계속 검증되어야 함).

## 검증 절차
1. `npm run build && npm run test`
2. 안티패턴 grep: `grep -rnE "background-clip|backdrop-filter|border-left:|rounded-\[1[0-9]px\]" src/components/items src/components/ItemCard.tsx` → 0건
3. `grep -rn "#000\|#fff" src/components/items` → 0건
4. `phases/design-renewal-fix/feature_list.json`의 feat-8을 `passes: true`로.
5. `index.json` step 5 상태 갱신.

## 금지사항
- 제스처/낙관적 status 변경/undo toast/롱프레스 시트/삭제 확인 로직을 변경·제거하지 마라. 이유: 핵심 인터랙션 회귀 금지.
- `useSignedUrl`/`services`/`hooks`를 수정하지 마라. 이유: UI 레이어만.
- 데이터 정렬/필터를 바꾸지 마라. 이유: 범위 밖.
