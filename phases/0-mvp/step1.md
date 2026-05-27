# Step 1: supabase-schema

## 읽어야 할 파일

먼저 아래 파일들을 읽고 필요한 스키마를 파악하라:

- `docs/ARCHITECTURE.md` — items 테이블 스키마, RLS 정책 상세, Storage RLS 정책

## 현재 상태

- Supabase 프로젝트가 이미 생성되어 있고 `.env.local`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`가 있다.
- Google OAuth 연동도 이미 완료되어 있다.
- **이 step의 SQL은 Supabase 대시보드에서 수동으로 실행해야 한다** → step 완료 후 `blocked` 처리

## 작업

### 1. `supabase/migrations/001_items.sql` 생성

아래 SQL을 파일로 저장하라. Supabase SQL Editor에서 실행하기 위한 파일이다.

```sql
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
```

### 2. `supabase/migrations/002_storage.sql` 생성

Storage RLS 정책 SQL. Supabase SQL Editor에서 001 실행 후 이어서 실행한다.

```sql
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
```

### 3. step status를 blocked로 설정

`phases/0-mvp/index.json`의 step 1을 아래와 같이 업데이트하라:

```json
{
  "step": 1,
  "name": "supabase-schema",
  "status": "blocked",
  "blocked_reason": "SQL 파일 2개를 Supabase 대시보드에서 수동 실행 필요. 순서: (1) supabase/migrations/001_items.sql → SQL Editor 실행 (2) Supabase Storage UI에서 item-images 버킷을 Private으로 생성 (3) supabase/migrations/002_storage.sql → SQL Editor 실행. 완료 후 status를 pending으로 바꾸고 blocked_reason 삭제"
}
```

## Acceptance Criteria

이 step은 자동 검증 불가. 아래를 수동으로 확인한다:

- [ ] Supabase 대시보드 → Table Editor에서 `items` 테이블이 보임
- [ ] items 테이블에 RLS가 활성화되어 있음 (Authentication → Policies에 4개 정책)
- [ ] Supabase Storage에서 `item-images` 버킷이 Private으로 생성됨
- [ ] Storage Policies에 upload/read/delete 3개 정책이 있음

## blocked 해제 절차

위 체크리스트를 모두 완료한 뒤:

1. `phases/0-mvp/index.json`에서 step 1의 `"status"`를 `"pending"`으로 변경
2. `"blocked_reason"` 필드 삭제
3. `python3 scripts/execute.py 0-mvp` 재실행

execute.py는 pending 상태의 첫 step부터 재개한다.

## 검증 완료 후 index.json 업데이트

수동 완료 확인 후 `phases/0-mvp/index.json` step 1을 아래로 갱신하라:
```json
{ "step": 1, "name": "supabase-schema", "status": "completed", "summary": "items 테이블 + RLS 4개 정책 + item-images Storage 버킷 + Storage RLS 3개 정책 수동 설정 완료" }
```

## 금지사항

- SQL을 로컬에서 직접 실행하려 하지 마라. Supabase 클라우드 대시보드에서만 실행해야 한다.
- `001_items.sql`과 `002_storage.sql`의 SQL 내용을 임의로 수정하지 마라. ARCHITECTURE.md 기준 스키마에서 벗어나면 이후 서비스 레이어가 깨진다.
- 버킷 생성을 SQL로 하려 하지 마라. Supabase Storage 버킷 생성은 대시보드 UI에서만 가능하다.
