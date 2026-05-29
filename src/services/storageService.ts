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
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600);

    if (error) return null;
    return data.signedUrl;
  },

  // 여러 경로 signed URL 배치 발급
  async getSignedUrls(paths: string[]): Promise<Record<string, string>> {
    if (paths.length === 0) return {};

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(paths, 3600);

    if (error || !data) return {};

    const result: Record<string, string> = {};
    for (const item of data) {
      if (item.signedUrl && item.path) {
        result[item.path] = item.signedUrl;
      }
    }
    return result;
  },
};
