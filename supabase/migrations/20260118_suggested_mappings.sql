-- ============================================================
-- SUGGESTED MAPPINGS TABLE
-- Migration: 20260118_suggested_mappings.sql
--
-- Tracks unmapped terms for auto-suggestion of new mappings
-- ============================================================

-- ================================================
-- 1. SUGGESTED MAPPINGS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS suggested_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The unmapped term
  term text NOT NULL,              -- lowercase normalized
  original_term text,              -- original casing for display

  -- Suggested mapping (null if no suggestion)
  suggested_condition_id uuid REFERENCES condition_taxonomy(id) ON DELETE SET NULL,
  suggestion_confidence float,     -- how confident is the suggestion
  suggestion_reason text,          -- 'fuzzy_match', 'similar_mesh', etc.

  -- Statistics
  study_count integer DEFAULT 1,   -- how many studies have this term
  sample_titles text[],            -- up to 3 example study titles

  -- Status
  status text DEFAULT 'pending',   -- 'pending', 'approved', 'rejected', 'mapped'
  reviewed_by text,                -- admin who reviewed
  reviewed_at timestamptz,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(term)
);

CREATE INDEX IF NOT EXISTS idx_suggested_mappings_status ON suggested_mappings(status);
CREATE INDEX IF NOT EXISTS idx_suggested_mappings_count ON suggested_mappings(study_count DESC);

-- ================================================
-- 2. GRANT PERMISSIONS
-- ================================================
GRANT SELECT ON suggested_mappings TO anon, authenticated;
GRANT ALL ON suggested_mappings TO service_role;
