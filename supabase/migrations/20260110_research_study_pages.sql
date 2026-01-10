-- Migration: Add columns for individual research study pages
-- Date: 2026-01-10

-- Add slug column for URL-friendly identifiers
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Add key_findings column for bullet point findings
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS key_findings JSONB DEFAULT '[]'::jsonb;

-- Add study_quality column for quality assessment
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS study_quality VARCHAR(20);

-- Add study_type column for categorization
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS study_type VARCHAR(100);

-- Add SEO meta fields
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(70);

ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS meta_description VARCHAR(160);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_research_queue_slug ON kb_research_queue(slug);

-- Add comments for documentation
COMMENT ON COLUMN kb_research_queue.slug IS 'URL-friendly identifier for individual study pages';
COMMENT ON COLUMN kb_research_queue.key_findings IS 'Array of key finding bullet points with type (finding/limitation)';
COMMENT ON COLUMN kb_research_queue.study_quality IS 'Quality assessment: High, Moderate, Low, Very Low';
COMMENT ON COLUMN kb_research_queue.study_type IS 'Study type: RCT, Systematic Review, Meta-Analysis, Cohort Study, etc.';
COMMENT ON COLUMN kb_research_queue.meta_title IS 'SEO meta title (max 70 chars)';
COMMENT ON COLUMN kb_research_queue.meta_description IS 'SEO meta description (max 160 chars)';

-- Generate slugs for all approved studies that don't have one yet
-- This creates URL-friendly slugs from the title
UPDATE kb_research_queue
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        LEFT(title, 100),  -- Limit to 100 chars
        '[^a-zA-Z0-9\s-]', '', 'g'  -- Remove special chars
      ),
      '\s+', '-', 'g'  -- Replace spaces with hyphens
    ),
    '-+', '-', 'g'  -- Remove duplicate hyphens
  )
) || '-' || LEFT(id::text, 8)  -- Append first 8 chars of UUID for uniqueness
WHERE slug IS NULL AND status = 'approved';

-- Log migration
INSERT INTO migrations (name, executed_at)
VALUES ('20260110_research_study_pages', NOW())
ON CONFLICT (name) DO NOTHING;
