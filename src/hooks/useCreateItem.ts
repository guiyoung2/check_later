import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { itemsService } from '../services/itemsService';
import type { Item, CreateItemInput } from '../types';

// 성공 시 items 쿼리 전체 invalidate
export function useCreateItem(): UseMutationResult<Item, Error, CreateItemInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateItemInput) => itemsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
