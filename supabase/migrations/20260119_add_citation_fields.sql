-- Add pmid and slug columns to kb_citations for enhanced reference linking
-- Run this in Supabase SQL Editor

-- Add PMID column for PubMed links
ALTER TABLE kb_citations
ADD COLUMN IF NOT EXISTS pmid TEXT;

-- Add slug column for internal study summary links
ALTER TABLE kb_citations
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_citations_slug ON kb_citations(slug) WHERE slug IS NOT NULL;

-- Add index on pmid for faster lookups
CREATE INDEX IF NOT EXISTS idx_citations_pmid ON kb_citations(pmid) WHERE pmid IS NOT NULL;

COMMENT ON COLUMN kb_citations.pmid IS 'PubMed ID for linking to pubmed.ncbi.nlm.nih.gov';
COMMENT ON COLUMN kb_citations.slug IS 'Internal slug for linking to /research/study/[slug]';
