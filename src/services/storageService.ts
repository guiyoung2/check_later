import { supabase } from '../lib/supabase';

const BUCKET = 'item-images';

export const storageService = {
  // 파일 업로드. 경로: {userId}/{itemId}.{ext}
  async upload(file: File, userId: string, itemId: string): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${itemId}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file);
    if (error) throw error;

    return path;
  },

  // signed URL 발급 (유효시간: 3600초)
  async getSignedUrl(path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600);

    if (error) throw error;
    return data.signedUrl;
  },
};
