-- Add view_count column to track popularity based on visitor clicks
ALTER TABLE kb_glossary
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create index for fast sorting by popularity
CREATE INDEX IF NOT EXISTS idx_glossary_view_count ON kb_glossary(view_count DESC);

-- Function to increment view count atomically
CREATE OR REPLACE FUNCTION increment_glossary_view(term_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE kb_glossary
  SET view_count = view_count + 1
  WHERE slug = term_slug;
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN kb_glossary.view_count IS 'Number of times this term page has been viewed by visitors';
