import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { itemsService } from '../services/itemsService';
import { useFilterStore } from '../stores/filterStore';
import type { Item } from '../types';

// 필터 상태를 queryKey에 포함해 필터 변경 시 자동 refetch
export function useItems(): UseQueryResult<Item[], Error> {
  const type = useFilterStore((s) => s.type);
  const status = useFilterStore((s) => s.status);

  return useQuery({
    queryKey: ['items', { type, status }],
    queryFn: () =>
      itemsService.list({
        type: type ?? undefined,
        status: status ?? undefined,
      }),
  });
}
