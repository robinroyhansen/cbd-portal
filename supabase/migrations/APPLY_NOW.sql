-- ============================================================
-- PENDING MIGRATIONS - RUN IN SUPABASE SQL EDITOR
-- ============================================================
--
-- Copy this entire file and paste into:
-- Supabase Dashboard > SQL Editor > New Query > Paste > Run
--
-- These migrations add:
-- 1. suggested_mappings table (for tracking unmapped terms)
-- 2. content_type column (for filtering non-medical studies)
-- ============================================================

-- ================================================
-- 1. SUGGESTED MAPPINGS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS suggested_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  original_term text,
  suggested_condition_id uuid REFERENCES condition_taxonomy(id) ON DELETE SET NULL,
  suggestion_confidence float,
  suggestion_reason text,
  study_count integer DEFAULT 1,
  sample_titles text[],
  status text DEFAULT 'pending',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(term)
);

CREATE INDEX IF NOT EXISTS idx_suggested_mappings_status ON suggested_mappings(status);
CREATE INDEX IF NOT EXISTS idx_suggested_mappings_count ON suggested_mappings(study_count DESC);

GRANT SELECT ON suggested_mappings TO anon, authenticated;
GRANT ALL ON suggested_mappings TO service_role;

-- ================================================
-- 2. CONTENT TYPE COLUMN
-- ================================================
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'unclassified';

CREATE INDEX IF NOT EXISTS idx_queue_content_type ON kb_research_queue(content_type);

COMMENT ON COLUMN kb_research_queue.content_type IS
  'Content classification: medical, legal, economic, agricultural, other, unclassified';

-- ================================================
-- VERIFICATION QUERY (run after to confirm)
-- ================================================
-- SELECT
--   EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suggested_mappings') as suggested_mappings_exists,
--   EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kb_research_queue' AND column_name = 'content_type') as content_type_exists;
