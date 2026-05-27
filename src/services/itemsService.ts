import { supabase } from '../lib/supabase';
import type { Item, CreateItemInput, UpdateItemInput, ItemFilters } from '../types';

export const itemsService = {
  // 필터 적용 + created_at desc 정렬로 목록 조회
  async list(filters?: ItemFilters): Promise<Item[]> {
    let query = supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Item[];
  },

  // 단일 항목 조회. 없으면 null 반환
  async getById(id: string): Promise<Item | null> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Item | null;
  },

  // 새 항목 생성. user_id는 auth.getUser()로 가져온다.
  async create(input: CreateItemInput): Promise<Item> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const insertObj: Record<string, unknown> = {
      type: input.type,
      status: input.status ?? 'pending',
      title: input.title,
      memo: input.memo ?? null,
      url: input.url ?? null,
      image_path: input.image_path ?? null,
      user_id: userData.user.id,
    };

    if (input.id) {
      insertObj.id = input.id;
    }

    const { data, error } = await supabase
      .from('items')
      .insert(insertObj)
      .select()
      .single();

    if (error) throw error;
    return data as Item;
  },

  // 부분 업데이트. 전달된 필드만 변경된다.
  async update(id: string, input: UpdateItemInput): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Item;
  },

  // 항목 삭제
  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) throw error;
  },
};
