-- ============================================================
-- CONTENT TYPE CLASSIFICATION
-- Migration: 20260118_content_type.sql
--
-- Adds content_type column to classify studies as medical,
-- legal, economic, agricultural, or other
-- ============================================================

-- Add content_type column
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'unclassified';

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_queue_content_type ON kb_research_queue(content_type);

-- Valid values: 'medical', 'legal', 'economic', 'agricultural', 'other', 'unclassified'
COMMENT ON COLUMN kb_research_queue.content_type IS
  'Content classification: medical, legal, economic, agricultural, other, unclassified';
