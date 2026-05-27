import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { itemsService } from '../services/itemsService';
import type { Item, UpdateItemInput } from '../types';

type PatchVariables = { id: string; input: UpdateItemInput };

// 낙관적 업데이트: mutate 즉시 캐시 반영, 실패 시 롤백
export function usePatchItem(): UseMutationResult<Item, Error, PatchVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: PatchVariables) => itemsService.update(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['items'] });
      const previous = queryClient.getQueryData<Item[]>(['items']);
      queryClient.setQueryData<Item[]>(['items'], (old) =>
        old?.map((item) => (item.id === id ? { ...item, ...input } : item)) ?? [],
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
  });
}
