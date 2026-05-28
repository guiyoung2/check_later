// DB enum과 일치시킨다
export type ItemType = 'video' | 'article' | 'screenshot' | 'memo';
export type ItemStatus = 'pending' | 'reviewed' | 'archived';
export type ItemAttachmentKind = 'url' | 'image';

export interface Item {
  id: string;
  user_id: string;
  type: ItemType;
  status: ItemStatus;
  title: string;
  memo: string | null;
  url: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateItemInput {
  id?: string;
  type: ItemType;
  status?: ItemStatus;
  title: string;
  memo?: string;
  url?: string;
  image_path?: string;
}

export interface UpdateItemInput {
  type?: ItemType;
  status?: ItemStatus;
  title?: string;
  memo?: string | null;
  url?: string | null;
  image_path?: string | null;
}

export interface ItemAttachment {
  id: string;
  item_id: string;
  user_id: string;
  kind: ItemAttachmentKind;
  value: string;
  sort_order: number;
  created_at: string;
}

export interface ItemAttachmentInput {
  kind: ItemAttachmentKind;
  value: string;
}

export interface ItemFilters {
  type?: ItemType;
  status?: ItemStatus;
}
