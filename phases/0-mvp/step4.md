# Step 4: query-hooks-and-store

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 현재 코드를 파악하라:

- `docs/ARCHITECTURE.md` — 데이터 흐름, 서버/UI 상태 분리 패턴
- `src/types/index.ts` — Item, ItemType, ItemStatus, CreateItemInput, UpdateItemInput, ItemFilters (step 0+3 산출물)
- `src/services/itemsService.ts` — itemsService CRUD (step 3 산출물)
- `src/main.tsx` — QueryClient 설정 확인 (staleTime: 5분, retry: 1)

## 작업

### 1. TanStack Query 훅 생성

아래 훅들을 각각 별도 파일로 생성하라.

**`src/hooks/useItems.ts`**
```typescript
// filterStore의 현재 필터를 queryKey에 포함시켜 필터 변경 시 자동 refetch
export function useItems(): UseQueryResult<Item[], Error>
```
- queryKey: `['items', { type, status }]` — filterStore의 type과 status를 포함해야 한다.
- queryFn: `itemsService.list({ type: type ?? undefined, status: status ?? undefined })`

**`src/hooks/useItem.ts`**
```typescript
// id가 undefined면 쿼리를 실행하지 않는다 (enabled: !!id)
export function useItem(id: string | undefined): UseQueryResult<Item | null, Error>
```

**`src/hooks/useCreateItem.ts`**
```typescript
// 성공 시 ['items'] 쿼리 invalidate
export function useCreateItem(): UseMutationResult<Item, Error, CreateItemInput>
```

**`src/hooks/usePatchItem.ts`**
```typescript
// 낙관적 업데이트: mutate 즉시 캐시에 반영, 실패 시 롤백
// 성공 시 ['items'] + ['items', id] 모두 invalidate
export function usePatchItem(): UseMutationResult<Item, Error, { id: string; input: UpdateItemInput }>
```

낙관적 업데이트 구현 패턴:
```typescript
onMutate: async ({ id, input }) => {
  await queryClient.cancelQueries({ queryKey: ['items'] });
  const previous = queryClient.getQueryData<Item[]>(['items']);
  queryClient.setQueryData<Item[]>(['items'], (old) =>
    old?.map(item => item.id === id ? { ...item, ...input } : item) ?? []
  );
  return { previous };
},
onError: (_err, _vars, context) => {
  queryClient.setQueryData(['items'], context?.previous);
},
onSettled: (_data, _err, { id }) => {
  queryClient.invalidateQueries({ queryKey: ['items'] });
  queryClient.invalidateQueries({ queryKey: ['items', id] });
},
```

**`src/hooks/useDeleteItem.ts`**
```typescript
// 성공 시 ['items'] 쿼리 invalidate
export function useDeleteItem(): UseMutationResult<void, Error, string>
```

### 2. `src/stores/filterStore.ts` 생성

Zustand 스토어. 필터 UI 상태만 담는다.

```typescript
interface FilterState {
  type: ItemType | null;
  status: ItemStatus | null;
  setType: (type: ItemType | null) => void;
  setStatus: (status: ItemStatus | null) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>(...)
```

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm test        # 기존 테스트 통과
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. `phases/0-mvp/index.json`의 step 4를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "5개 TanStack Query 훅(useItems/useItem/useCreateItem/usePatchItem/useDeleteItem) + Zustand filterStore 생성"`
   - 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`

## 금지사항

- `useItems`의 queryKey에 filterStore 상태를 포함하지 않으면 필터 변경 시 캐시된 이전 결과가 그대로 보인다. 반드시 포함하라.
- `usePatchItem`에서 낙관적 업데이트를 생략하지 마라. 이유: 상태 변경 같은 즉각적인 피드백이 필요한 UX에서 네트워크 지연이 느껴지면 안 된다.
- 서비스 로직(Supabase 쿼리)을 훅 내부에 인라인으로 작성하지 마라. 이유: step 3에서 만든 서비스 함수를 호출해야 한다.
- 기존 테스트를 깨뜨리지 마라.
