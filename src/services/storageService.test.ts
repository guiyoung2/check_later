import { describe, expect, it, vi } from 'vitest';
import { storageService } from './storageService';
import { supabase } from '../lib/supabase';

const list = vi.fn();
const createSignedUrl = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        list,
        createSignedUrl,
      })),
    },
  },
}));

describe('storageService', () => {
  it('createSignedUrl 에러 시 null을 반환한다', async () => {
    createSignedUrl.mockResolvedValue({ data: null, error: { message: 'not found' } });

    const result = await storageService.getSignedUrl('user-1/item-1.webp');

    expect(result).toBeNull();
    expect(supabase.storage.from).toHaveBeenCalledWith('item-images');
    expect(createSignedUrl).toHaveBeenCalledWith('user-1/item-1.webp', 3600);
    expect(list).not.toHaveBeenCalled();
  });
});
