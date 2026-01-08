-- Add unique constraint on DOI (partial - only where DOI is not null)
-- This prevents duplicate DOIs while allowing multiple NULL DOIs
CREATE UNIQUE INDEX IF NOT EXISTS idx_research_queue_doi_unique
ON kb_research_queue(doi)
WHERE doi IS NOT NULL AND doi != '';

-- Add index on title for faster similarity searches
CREATE INDEX IF NOT EXISTS idx_research_queue_title
ON kb_research_queue(title);

-- Add trigram extension for fuzzy title matching (if not exists)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add trigram index for fast similarity searches
CREATE INDEX IF NOT EXISTS idx_research_queue_title_trgm
ON kb_research_queue USING gin(title gin_trgm_ops);
