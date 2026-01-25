-- Enhance comments table with additional fields for spam detection and moderation

-- Add approved_at timestamp
ALTER TABLE kb_comments ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add spam_signals for tracking why a comment was flagged
ALTER TABLE kb_comments ADD COLUMN IF NOT EXISTS spam_signals TEXT[];

-- Add moderation_notes for admin notes
ALTER TABLE kb_comments ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- Update RLS policy to allow inserting comments with 'spam' status (auto-detected)
DROP POLICY IF EXISTS "Public insert comments" ON kb_comments;
CREATE POLICY "Public insert comments" ON kb_comments
  FOR INSERT WITH CHECK (status IN ('pending', 'spam'));

-- Index on spam_signals for finding flagged comments
CREATE INDEX IF NOT EXISTS idx_comments_spam_signals ON kb_comments USING gin(spam_signals);

-- Comments
COMMENT ON COLUMN kb_comments.approved_at IS 'Timestamp when comment was approved';
COMMENT ON COLUMN kb_comments.spam_signals IS 'Array of reasons why comment was flagged as potential spam';
COMMENT ON COLUMN kb_comments.moderation_notes IS 'Admin notes about moderation decision';
