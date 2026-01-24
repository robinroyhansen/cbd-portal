-- =====================================================
-- Add condition_slug to kb_articles for direct condition linking
-- Created: January 24, 2026
-- Purpose: Link articles directly to health conditions
-- =====================================================

-- Add condition_slug column to kb_articles
ALTER TABLE kb_articles
ADD COLUMN IF NOT EXISTS condition_slug TEXT;

-- Add foreign key constraint (soft reference to kb_conditions.slug)
-- Note: Using soft reference since kb_conditions uses slug as identifier
CREATE INDEX IF NOT EXISTS idx_kb_articles_condition_slug ON kb_articles(condition_slug);

-- Add comment for documentation
COMMENT ON COLUMN kb_articles.condition_slug IS 'Links article to a health condition from kb_conditions table';

-- =====================================================
-- Auto-populate condition_slug for existing articles
-- Based on title matching and category inference
-- =====================================================

-- Update articles that have condition names in their titles
UPDATE kb_articles a
SET condition_slug = c.slug
FROM kb_conditions c
WHERE a.condition_slug IS NULL
AND (
  -- Exact condition name in title
  a.title ILIKE '%' || c.name || '%'
  OR a.title ILIKE '%' || c.display_name || '%'
  -- Or in the slug
  OR a.slug ILIKE '%' || c.slug || '%'
)
AND a.status = 'published';

-- Log the update
DO $$
DECLARE
  updated_count INT;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM kb_articles
  WHERE condition_slug IS NOT NULL;

  RAISE NOTICE 'Updated % articles with condition_slug', updated_count;
END $$;
