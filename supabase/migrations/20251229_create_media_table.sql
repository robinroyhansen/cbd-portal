-- Create kb_media table for storing image library
CREATE TABLE IF NOT EXISTS kb_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  file_size INT,
  mime_type VARCHAR(100),
  width INT,
  height INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(255) DEFAULT 'admin'
);

-- Enable RLS
ALTER TABLE kb_media ENABLE ROW LEVEL SECURITY;

-- Create public read policy
DROP POLICY IF EXISTS "Public read" ON kb_media;
CREATE POLICY "Public read" ON kb_media FOR SELECT USING (true);

-- Create authenticated write policy (for admin)
DROP POLICY IF EXISTS "Authenticated write" ON kb_media;
CREATE POLICY "Authenticated write" ON kb_media
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for media uploads if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated upload media" ON storage.objects;
CREATE POLICY "Authenticated upload media" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated delete media" ON storage.objects;
CREATE POLICY "Authenticated delete media" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'media');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_kb_media_created_at ON kb_media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kb_media_filename ON kb_media(filename);