import { describe, expect, it, vi } from 'vitest';
import { itemAttachmentsService } from './itemAttachmentsService';
import { supabase } from '../lib/supabase';

const mocks = vi.hoisted(() => {
  const select = vi.fn();
  const insert = vi.fn();
  const deleteEq = vi.fn();
  const deleteFrom = vi.fn(() => ({ eq: deleteEq }));
  const order = vi.fn();
  const eq = vi.fn(() => ({ order }));
  const from = vi.fn((table: string) => {
    if (table === 'item_attachments') {
      return {
        select,
        insert,
        delete: deleteFrom,
        eq,
      };
    }
    return {};
  });

  return { select, insert, deleteEq, deleteFrom, order, eq, from };
});

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: mocks.from,
  },
}));

const { insert, deleteEq } = mocks;

describe('itemAttachmentsService', () => {
  it('첨부 목록을 순서대로 저장한다', async () => {
    insert.mockResolvedValue({ error: null });

    await itemAttachmentsService.createMany('item-1', 'user-1', [
      { kind: 'url', value: 'https://a.example' },
      { kind: 'image', value: 'user-1/item-1/a.png' },
    ]);

    expect(supabase.from).toHaveBeenCalledWith('item_attachments');
    expect(insert).toHaveBeenCalledWith([
      {
        item_id: 'item-1',
        user_id: 'user-1',
        kind: 'url',
        value: 'https://a.example',
        sort_order: 0,
      },
      {
        item_id: 'item-1',
        user_id: 'user-1',
        kind: 'image',
        value: 'user-1/item-1/a.png',
        sort_order: 1,
      },
    ]);
  });

  it('기존 첨부를 지우고 새 목록으로 교체한다', async () => {
    deleteEq.mockResolvedValue({ error: null });
    insert.mockResolvedValue({ error: null });

    await itemAttachmentsService.replaceForItem('item-1', 'user-1', [
      { kind: 'url', value: 'https://changed.example' },
    ]);

    expect(deleteEq).toHaveBeenCalledWith('item_id', 'item-1');
    expect(insert).toHaveBeenCalledWith([
      {
        item_id: 'item-1',
        user_id: 'user-1',
        kind: 'url',
        value: 'https://changed.example',
        sort_order: 0,
      },
    ]);
  });
});
