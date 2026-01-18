-- ============================================================
-- CONDITION INTELLIGENCE SYSTEM
-- Migration: 20260118_condition_intelligence.sql
--
-- Replaces simple keyword matching with professional taxonomy
-- integration (MeSH, OpenAlex, ClinicalTrials.gov)
--
-- ALREADY APPLIED TO DATABASE - This file is for reference
-- ============================================================

-- ================================================
-- 1. HIERARCHICAL CONDITION TAXONOMY
-- ================================================
CREATE TABLE IF NOT EXISTS condition_taxonomy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  parent_id uuid,  -- Self-referential FK added separately
  level integer NOT NULL DEFAULT 2,  -- 1=category, 2=condition, 3=sub-condition
  path text[],  -- materialized path: ['neurological', 'epilepsy', 'dravet']

  -- Display & SEO
  description text,
  icon text,
  has_page boolean DEFAULT false,
  page_threshold integer DEFAULT 10,  -- auto-suggest page when hits this

  -- External IDs for linking
  mesh_ids text[],           -- MeSH descriptor IDs (e.g., D004827)
  mesh_tree_numbers text[],  -- MeSH tree numbers for hierarchy (e.g., C10.228.140.490)
  openalex_ids text[],       -- OpenAlex concept IDs (e.g., C2776083)
  synonyms text[],           -- keyword synonyms for matching

  -- Stats (auto-updated by trigger)
  study_count integer DEFAULT 0,
  human_study_count integer DEFAULT 0,
  pending_study_count integer DEFAULT 0,

  -- Metadata
  sort_order integer DEFAULT 0,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE condition_taxonomy
ADD CONSTRAINT fk_parent FOREIGN KEY (parent_id)
REFERENCES condition_taxonomy(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_condition_taxonomy_parent ON condition_taxonomy(parent_id);
CREATE INDEX IF NOT EXISTS idx_condition_taxonomy_path ON condition_taxonomy USING GIN(path);
CREATE INDEX IF NOT EXISTS idx_condition_taxonomy_mesh ON condition_taxonomy USING GIN(mesh_ids);
CREATE INDEX IF NOT EXISTS idx_condition_taxonomy_openalex ON condition_taxonomy USING GIN(openalex_ids);

-- ================================================
-- 2. RAW TERMS CAPTURED FROM SOURCES
-- ================================================
CREATE TABLE IF NOT EXISTS study_raw_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid NOT NULL REFERENCES kb_research_queue(id) ON DELETE CASCADE,
  source text NOT NULL,      -- 'mesh', 'openalex', 'ctgov', 'keyword', 'title', 'ai'
  term text NOT NULL,
  term_id text,              -- external ID (MeSH ID, OpenAlex concept ID)
  confidence float DEFAULT 1.0,
  is_health_related boolean DEFAULT true,  -- filter out non-health concepts
  metadata jsonb,            -- additional data (tree numbers, parent concepts, etc.)
  created_at timestamptz DEFAULT now()
);

-- Use unique index for case-insensitive uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_raw_terms_unique
ON study_raw_terms(study_id, source, lower(term));

CREATE INDEX IF NOT EXISTS idx_raw_terms_study ON study_raw_terms(study_id);
CREATE INDEX IF NOT EXISTS idx_raw_terms_term ON study_raw_terms(lower(term));
CREATE INDEX IF NOT EXISTS idx_raw_terms_term_id ON study_raw_terms(term_id) WHERE term_id IS NOT NULL;

-- ================================================
-- 3. TERM → CONDITION MAPPINGS (self-learning)
-- ================================================
CREATE TABLE IF NOT EXISTS term_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL,  -- 'mesh', 'openalex', 'keyword', 'any'
  source_term text NOT NULL,
  source_id text,             -- external ID if available

  maps_to uuid NOT NULL REFERENCES condition_taxonomy(id) ON DELETE CASCADE,
  confidence float DEFAULT 1.0,
  is_primary boolean DEFAULT true,  -- false = secondary/mentioned relationship

  -- Audit
  created_by text DEFAULT 'auto',  -- 'auto', 'admin', 'ai_suggested'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Use unique index for case-insensitive uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_term_mappings_unique
ON term_mappings(source_type, lower(source_term));

CREATE INDEX IF NOT EXISTS idx_term_mappings_term ON term_mappings(lower(source_term));
CREATE INDEX IF NOT EXISTS idx_term_mappings_condition ON term_mappings(maps_to);

-- ================================================
-- 4. RESOLVED STUDY-CONDITION RELATIONSHIPS
-- ================================================
CREATE TABLE IF NOT EXISTS study_conditions (
  study_id uuid NOT NULL REFERENCES kb_research_queue(id) ON DELETE CASCADE,
  condition_id uuid NOT NULL REFERENCES condition_taxonomy(id) ON DELETE CASCADE,

  relevance text DEFAULT 'primary',  -- 'primary', 'secondary', 'mentioned', 'inherited'
  confidence float DEFAULT 1.0,      -- aggregated from multiple sources
  source_count integer DEFAULT 1,    -- how many sources confirmed this
  sources text[],                    -- which sources: ['mesh', 'openalex']

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  PRIMARY KEY (study_id, condition_id)
);

CREATE INDEX IF NOT EXISTS idx_study_conditions_condition ON study_conditions(condition_id);
CREATE INDEX IF NOT EXISTS idx_study_conditions_relevance ON study_conditions(relevance);

-- ================================================
-- 5. UNMAPPED TERMS DISCOVERY VIEW
-- ================================================
CREATE OR REPLACE VIEW unmapped_terms_ranked AS
SELECT
  lower(srt.term) as term,
  COUNT(DISTINCT srt.study_id) as study_count,
  array_agg(DISTINCT srt.source ORDER BY srt.source) as sources,
  array_agg(DISTINCT srt.term_id) FILTER (WHERE srt.term_id IS NOT NULL) as external_ids,
  MAX(srt.created_at) as last_seen,
  MIN(srt.created_at) as first_seen
FROM study_raw_terms srt
WHERE srt.is_health_related = true
  AND NOT EXISTS (
    SELECT 1 FROM term_mappings tm
    WHERE lower(tm.source_term) = lower(srt.term)
  )
GROUP BY lower(srt.term)
HAVING COUNT(DISTINCT srt.study_id) >= 3
ORDER BY study_count DESC;

-- ================================================
-- 6. CONDITIONS READY FOR PAGES VIEW
-- ================================================
CREATE OR REPLACE VIEW conditions_ready_for_pages AS
SELECT
  ct.id,
  ct.slug,
  ct.name,
  ct.study_count,
  ct.human_study_count,
  ct.page_threshold,
  ct.has_page,
  ct.path,
  p.name as parent_name
FROM condition_taxonomy ct
LEFT JOIN condition_taxonomy p ON ct.parent_id = p.id
WHERE ct.study_count >= ct.page_threshold
  AND ct.has_page = false
  AND ct.enabled = true
ORDER BY ct.study_count DESC;

-- ================================================
-- 7. SEED: Categories (Level 1)
-- ================================================
INSERT INTO condition_taxonomy (slug, name, level, path, icon, description, sort_order) VALUES
('neurological', 'Neurological Conditions', 1, ARRAY['neurological'], '🧠', 'Conditions affecting the brain and nervous system', 1),
('mental-health', 'Mental Health', 1, ARRAY['mental-health'], '😰', 'Psychological and psychiatric conditions', 2),
('pain', 'Pain Conditions', 1, ARRAY['pain'], '🔥', 'Chronic and acute pain conditions', 3),
('autoimmune', 'Autoimmune & Inflammatory', 1, ARRAY['autoimmune'], '🛡️', 'Autoimmune and inflammatory conditions', 4),
('cancer', 'Cancer & Oncology', 1, ARRAY['cancer'], '🎗️', 'Cancer-related conditions and treatments', 5),
('gastrointestinal', 'Gastrointestinal', 1, ARRAY['gastrointestinal'], '🫃', 'Digestive system conditions', 6),
('cardiovascular', 'Cardiovascular', 1, ARRAY['cardiovascular'], '❤️', 'Heart and circulatory system conditions', 7),
('skin', 'Skin Conditions', 1, ARRAY['skin'], '🧴', 'Dermatological conditions', 8),
('metabolic', 'Metabolic & Endocrine', 1, ARRAY['metabolic'], '⚗️', 'Metabolic and hormonal conditions', 9),
('addiction', 'Addiction & Substance Use', 1, ARRAY['addiction'], '🚭', 'Substance use and addiction disorders', 10),
('other', 'Other Conditions', 1, ARRAY['other'], '📋', 'Miscellaneous health conditions', 99)
ON CONFLICT (slug) DO NOTHING;

-- Conditions (Level 2) are seeded via application code
-- See: supabase/seed-conditions.js

-- ================================================
-- 8. SEED: Term mappings from synonyms
-- ================================================
INSERT INTO term_mappings (source_type, source_term, maps_to, confidence, created_by)
SELECT 'keyword', unnest(synonyms), id, 0.9, 'seed'
FROM condition_taxonomy
WHERE synonyms IS NOT NULL AND array_length(synonyms, 1) > 0
ON CONFLICT DO NOTHING;

-- ================================================
-- 9. GRANT PERMISSIONS
-- ================================================
GRANT SELECT ON condition_taxonomy TO anon, authenticated;
GRANT SELECT ON study_raw_terms TO anon, authenticated;
GRANT SELECT ON term_mappings TO anon, authenticated;
GRANT SELECT ON study_conditions TO anon, authenticated;
GRANT SELECT ON unmapped_terms_ranked TO anon, authenticated;
GRANT SELECT ON conditions_ready_for_pages TO anon, authenticated;

GRANT ALL ON condition_taxonomy TO service_role;
GRANT ALL ON study_raw_terms TO service_role;
GRANT ALL ON term_mappings TO service_role;
GRANT ALL ON study_conditions TO service_role;
