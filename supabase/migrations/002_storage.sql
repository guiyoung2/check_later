-- item-images 버킷 RLS 정책
-- 주의: 버킷 생성은 Supabase 대시보드 Storage UI에서 수동으로 해야 한다.
-- 버킷 이름: item-images, 설정: Private

-- 본인 폴더에만 업로드 허용
CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'item-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 본인 파일만 읽기 허용
CREATE POLICY "Users can read own images"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'item-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 본인 파일만 삭제 허용
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'item-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
