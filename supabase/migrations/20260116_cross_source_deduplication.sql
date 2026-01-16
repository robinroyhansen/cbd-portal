-- Cross-Source Deduplication for Research Scanner
-- This migration adds columns and indexes to support deduplication across multiple research sources

-- 1. Add PMID column (PubMed ID)
ALTER TABLE kb_research_queue ADD COLUMN IF NOT EXISTS pmid TEXT;

-- 2. Add PMC ID column (PubMed Central ID)
ALTER TABLE kb_research_queue ADD COLUMN IF NOT EXISTS pmc_id TEXT;

-- 3. Add source_ids JSONB column to track all IDs from all sources
-- Example: {"pubmed": "12345678", "pmc": "PMC1234567", "semantic_scholar": "abc123"}
ALTER TABLE kb_research_queue ADD COLUMN IF NOT EXISTS source_ids JSONB DEFAULT '{}';

-- 4. Add source column to track primary source (first source where item was found)
ALTER TABLE kb_research_queue ADD COLUMN IF NOT EXISTS source TEXT;

-- 5. Create unique index on PMID (partial - only where not null/empty)
CREATE UNIQUE INDEX IF NOT EXISTS idx_research_pmid_unique
ON kb_research_queue(pmid)
WHERE pmid IS NOT NULL AND pmid != '';

-- 6. Create unique index on PMC ID (partial - only where not null/empty)
CREATE UNIQUE INDEX IF NOT EXISTS idx_research_pmc_unique
ON kb_research_queue(pmc_id)
WHERE pmc_id IS NOT NULL AND pmc_id != '';

-- 7. Create index on source_ids for JSONB queries
CREATE INDEX IF NOT EXISTS idx_research_source_ids
ON kb_research_queue USING gin(source_ids);

-- 8. Create index on source for filtering by primary source
CREATE INDEX IF NOT EXISTS idx_research_source
ON kb_research_queue(source);

-- 9. Create a function for fuzzy title matching (uses pg_trgm extension)
CREATE OR REPLACE FUNCTION find_similar_research(
  p_title TEXT,
  p_year INT,
  p_threshold FLOAT DEFAULT 0.85
)
RETURNS TABLE(id UUID, title TEXT, similarity FLOAT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.title,
    similarity(lower(r.title), lower(p_title)) as sim
  FROM kb_research_queue r
  WHERE
    (p_year IS NULL OR r.year = p_year OR r.year = p_year - 1 OR r.year = p_year + 1)
    AND similarity(lower(r.title), lower(p_title)) > p_threshold
  ORDER BY sim DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- 10. Grant execute on the function
GRANT EXECUTE ON FUNCTION find_similar_research TO anon, authenticated, service_role;
