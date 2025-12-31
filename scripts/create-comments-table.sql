-- Comments table with moderation
CREATE TABLE IF NOT EXISTS kb_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES kb_comments(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  ip_address VARCHAR(45),
  user_agent TEXT,
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comments_article ON kb_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON kb_comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON kb_comments(parent_id);

-- RLS
ALTER TABLE kb_comments ENABLE ROW LEVEL SECURITY;

-- Public can only see approved comments
CREATE POLICY "Public read approved" ON kb_comments
  FOR SELECT USING (status = 'approved');

-- Anyone can insert (pending moderation)
CREATE POLICY "Anyone can submit" ON kb_comments
  FOR INSERT WITH CHECK (true);