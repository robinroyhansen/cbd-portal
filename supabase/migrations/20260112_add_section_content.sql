-- Add section_content JSONB column to kb_brand_reviews
-- This stores review text for each scoring criterion separately
-- Format: { "criterion_id": "Review text for this section...", ... }

ALTER TABLE kb_brand_reviews
ADD COLUMN IF NOT EXISTS section_content JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN kb_brand_reviews.section_content IS 'Stores review text for each scoring criterion. Keys are criterion IDs, values are the section text.';
