import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { itemsService } from '../services/itemsService';
import type { Item } from '../types';

// id가 undefined면 쿼리를 실행하지 않는다
export function useItem(id: string | undefined): UseQueryResult<Item | null, Error> {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => itemsService.getById(id!),
    enabled: !!id,
  });
}
