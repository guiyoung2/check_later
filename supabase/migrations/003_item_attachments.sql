CREATE TYPE item_attachment_kind AS ENUM ('url', 'image');

CREATE TABLE item_attachments (
  id          uuid                 PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     uuid                 NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id     uuid                 NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind        item_attachment_kind NOT NULL,
  value       text                 NOT NULL,
  sort_order  integer              NOT NULL DEFAULT 0,
  created_at  timestamptz          NOT NULL DEFAULT now()
);

CREATE INDEX item_attachments_item_id_sort_order_idx
  ON item_attachments(item_id, sort_order);

ALTER TABLE item_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own item attachments" ON item_attachments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own item attachments" ON item_attachments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own item attachments" ON item_attachments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own item attachments" ON item_attachments
  FOR DELETE USING (user_id = auth.uid());

INSERT INTO item_attachments (item_id, user_id, kind, value, sort_order)
SELECT id, user_id, 'url', url, 0
FROM items
WHERE url IS NOT NULL AND btrim(url) <> '';

INSERT INTO item_attachments (item_id, user_id, kind, value, sort_order)
SELECT id, user_id, 'image', image_path, 1
FROM items
WHERE image_path IS NOT NULL AND btrim(image_path) <> '';
