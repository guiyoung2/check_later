-- item_type enum
CREATE TYPE item_type AS ENUM ('video', 'article', 'screenshot', 'memo');

-- item_status enum
CREATE TYPE item_status AS ENUM ('pending', 'reviewed', 'archived');

-- items 테이블
CREATE TABLE items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        item_type   NOT NULL,
  status      item_status NOT NULL DEFAULT 'pending',
  title       text        NOT NULL,
  memo        text,
  url         text,
  image_path  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS 활성화
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- 본인 항목만 조회
CREATE POLICY "Users can view own items" ON items
  FOR SELECT USING (user_id = auth.uid());

-- 본인 항목만 삽입 (user_id 강제)
CREATE POLICY "Users can insert own items" ON items
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 본인 항목만 수정
CREATE POLICY "Users can update own items" ON items
  FOR UPDATE USING (user_id = auth.uid());

-- 본인 항목만 삭제
CREATE POLICY "Users can delete own items" ON items
  FOR DELETE USING (user_id = auth.uid());
