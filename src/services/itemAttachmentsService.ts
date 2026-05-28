import { supabase } from '../lib/supabase';
import type { ItemAttachment, ItemAttachmentInput } from '../types';

export const itemAttachmentsService = {
  async listByItemId(itemId: string): Promise<ItemAttachment[]> {
    const { data, error } = await supabase
      .from('item_attachments')
      .select('*')
      .eq('item_id', itemId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as ItemAttachment[];
  },

  async createMany(
    itemId: string,
    userId: string,
    attachments: ItemAttachmentInput[],
  ): Promise<void> {
    const rows = attachments
      .map((attachment, index) => ({
        item_id: itemId,
        user_id: userId,
        kind: attachment.kind,
        value: attachment.value,
        sort_order: index,
      }))
      .filter((attachment) => attachment.value.trim() !== '');

    if (rows.length === 0) return;

    const { error } = await supabase.from('item_attachments').insert(rows);
    if (error) throw error;
  },

  async replaceForItem(
    itemId: string,
    userId: string,
    attachments: ItemAttachmentInput[],
  ): Promise<void> {
    const { error: deleteError } = await supabase
      .from('item_attachments')
      .delete()
      .eq('item_id', itemId);

    if (deleteError) throw deleteError;

    await this.createMany(itemId, userId, attachments);
  },
};
