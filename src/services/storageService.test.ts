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
  it('파일이 없으면 signed URL 요청을 보내지 않고 null을 반환한다', async () => {
    list.mockResolvedValue({ data: [], error: null });

    const result = await storageService.getSignedUrl('user-1/item-1.webp');

    expect(result).toBeNull();
    expect(supabase.storage.from).toHaveBeenCalledWith('item-images');
    expect(list).toHaveBeenCalledWith('user-1', { search: 'item-1.webp', limit: 1 });
    expect(createSignedUrl).not.toHaveBeenCalled();
  });
});
