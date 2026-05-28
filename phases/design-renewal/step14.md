# Step 14: empty-loading-error-states

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/UI_GUIDE.md` — EmptyState 원칙, 안티패턴 가드레일
- `fix3_design.md` — §4.1 상태별 처리 (Home), 각 페이지 상태 명세
- `src/pages/HomePage.tsx` — step 5에서 수정됨
- `src/pages/NewItemPage.tsx` — step 7에서 수정됨
- `src/pages/ItemDetailPage.tsx` — step 8에서 수정됨
- `src/pages/FoldersPage.tsx` — step 10에서 생성됨
- `src/pages/SettingsPage.tsx` — step 11에서 수정됨
- `src/components/ui/EmptyState.tsx`, `src/components/ui/Skeleton.tsx` — step 3/2에서 생성됨

## 작업

모든 페이지에서 Empty/Loading/Error 3가지 상태가 완전하게 처리되는지 전수 점검하고 누락된 부분을 보완한다.

### 페이지별 체크리스트

**HomePage:**
- [ ] Loading: Skeleton 카드 3개 표시 (혼합 높이)
- [ ] Empty (필터 없음): EmptyState "아직 저장한 것이 없어요" + 행동 버튼
- [ ] Empty (필터 적용): EmptyState "조건에 맞는 것이 없어요" + 필터 초기화 버튼
- [ ] Error: inline error banner (카드 목록 상단)

**ItemDetailPage:**
- [ ] Loading: Skeleton (헤더 영역 + 본문 영역)
- [ ] Not Found (404): EmptyState "찾을 수 없어요" + 홈으로 버튼
- [ ] Error: inline error banner

**NewItemPage:**
- [ ] 저장 중: 저장 버튼 spinner + disabled
- [ ] 저장 완료: Toast "저장됨" + 4s + Home 이동
- [ ] 저장 실패: inline error (textarea 위)

**FoldersPage:**
- [ ] Loading: Skeleton 카드 그리드 (7개)
- [ ] Error: inline error banner

**SettingsPage:**
- [ ] Loading: 항목 수 조회 중 "—" 표시 (Skeleton 불필요)
- [ ] Error: 항목 수 조회 실패 시 "—" 유지

### Skeleton 컴포넌트 활용

각 페이지의 로딩 상태는 실제 레이아웃과 유사한 Skeleton을 사용해야 한다:

```tsx
// 예시: HomePage Skeleton
function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-40 w-full" />   {/* MemoCard 높이 */}
      <Skeleton className="h-64 w-full" />   {/* VideoCard 높이 */}
      <Skeleton className="h-32 w-full" />   {/* ArticleCard 높이 */}
    </div>
  );
}
```

### inline error banner 패턴

```tsx
// 재사용 가능한 패턴 (별도 컴포넌트 불필요)
{error && (
  <div className="rounded-sm bg-surface border border-error/30 text-error px-4 py-3 text-sm">
    불러오는 중 오류가 생겼어요. 잠시 후 다시 시도해 주세요.
  </div>
)}
```

## Acceptance Criteria

```bash
npm run build
npm run test -- --run
```

빌드 통과, 테스트 회귀 없음.

## 검증 절차

1. `npm run build && npm run test -- --run`
2. 각 페이지 상태별 수동 시연:
   - HomePage: 네트워크 오프라인 → Error banner 표시 확인
   - HomePage: 빈 DB → EmptyState 표시 확인
   - ItemDetailPage: 존재하지 않는 ID 접근 → Not Found EmptyState 확인
3. 결과에 따라 `phases/design-renewal/index.json`의 step 14 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "전체 페이지 Empty/Loading/Error 3종 상태 전수 보완 완료"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- Error 상태에 chromatic 색상(red 대신 `--error` 변수)을 직접 쓰지 마라. 이유: 토큰만 사용.
- Error 상태에 모달을 사용하지 마라. 이유: 파괴적 액션이 아니므로 inline banner로 충분.
- `src/services/*`, `src/hooks/*`를 수정하지 마라. 이유: UI 레이어만 보완한다.
