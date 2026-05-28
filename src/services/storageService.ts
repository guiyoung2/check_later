import { supabase } from '../lib/supabase';

const BUCKET = 'item-images';

export const storageService = {
  // 파일 업로드. 경로: {userId}/{itemId}.{ext}
  async upload(file: File, userId: string, itemId: string): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${itemId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file);
    if (error) throw error;

    return path;
  },

  // signed URL 발급 (유효시간: 3600초)
  async getSignedUrl(path: string): Promise<string | null> {
    const slashIndex = path.lastIndexOf('/');
    const folder = slashIndex >= 0 ? path.slice(0, slashIndex) : '';
    const fileName = slashIndex >= 0 ? path.slice(slashIndex + 1) : path;

    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET)
      .list(folder, { search: fileName, limit: 1 });

    if (listError) return null;
    if (!files?.some((file) => file.name === fileName)) return null;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600);

    if (error) return null;
    return data.signedUrl;
  },
};
