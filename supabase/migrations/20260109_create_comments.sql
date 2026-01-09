-- Create comments system for articles
-- Supports moderation workflow and threaded replies

-- Create comment status enum
DO $$ BEGIN
  CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected', 'spam');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create kb_comments table
CREATE TABLE IF NOT EXISTS kb_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES kb_comments(id) ON DELETE CASCADE,

  -- Author info
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  author_ip VARCHAR(45),
  user_agent TEXT,

  -- Content
  comment_text TEXT NOT NULL,

  -- Moderation
  status comment_status DEFAULT 'pending' NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_article ON kb_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON kb_comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON kb_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON kb_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_email ON kb_comments(author_email);

-- Enable RLS
ALTER TABLE kb_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can read approved comments
CREATE POLICY "Public read approved comments" ON kb_comments
  FOR SELECT USING (status = 'approved');

-- Public can insert new comments (they go to pending)
CREATE POLICY "Public insert comments" ON kb_comments
  FOR INSERT WITH CHECK (status = 'pending');

-- Service role has full access (for admin operations)
CREATE POLICY "Service role full access" ON kb_comments
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
DROP TRIGGER IF EXISTS trigger_comment_updated ON kb_comments;
CREATE TRIGGER trigger_comment_updated
  BEFORE UPDATE ON kb_comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_timestamp();

-- Add comment_count to kb_articles if not exists
ALTER TABLE kb_articles ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Function to update article comment counts
CREATE OR REPLACE FUNCTION update_article_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    UPDATE kb_articles SET comment_count = (
      SELECT COUNT(*) FROM kb_comments
      WHERE article_id = OLD.article_id AND status = 'approved'
    ) WHERE id = OLD.article_id;
  END IF;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE kb_articles SET comment_count = (
      SELECT COUNT(*) FROM kb_comments
      WHERE article_id = NEW.article_id AND status = 'approved'
    ) WHERE id = NEW.article_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update comment count
DROP TRIGGER IF EXISTS trigger_update_comment_count ON kb_comments;
CREATE TRIGGER trigger_update_comment_count
  AFTER INSERT OR UPDATE OR DELETE ON kb_comments
  FOR EACH ROW EXECUTE FUNCTION update_article_comment_count();

-- Comments for documentation
COMMENT ON TABLE kb_comments IS 'Article comments with moderation support';
COMMENT ON COLUMN kb_comments.parent_id IS 'For threaded replies - references parent comment';
COMMENT ON COLUMN kb_comments.author_ip IS 'Stored for spam prevention and moderation';
COMMENT ON COLUMN kb_comments.status IS 'pending=awaiting moderation, approved=visible, rejected=hidden, spam=flagged as spam';
