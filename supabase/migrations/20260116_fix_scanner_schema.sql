-- Fix scanner schema to match code expectations
-- This migration adds missing columns and updates constraints

-- =====================================================
-- 1. FIX kb_scan_jobs TABLE
-- =====================================================

-- Add 'sources' column (renamed from sources_total for clarity in code)
ALTER TABLE kb_scan_jobs ADD COLUMN IF NOT EXISTS sources TEXT[];

-- Copy existing data from sources_total to sources if sources_total exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kb_scan_jobs' AND column_name = 'sources_total') THEN
    UPDATE kb_scan_jobs SET sources = sources_total WHERE sources IS NULL;
  END IF;
END $$;

-- Add current_source_index for tracking position in sources array
ALTER TABLE kb_scan_jobs ADD COLUMN IF NOT EXISTS current_source_index INT DEFAULT 0;

-- Add current_source_offset for pagination within each source
ALTER TABLE kb_scan_jobs ADD COLUMN IF NOT EXISTS current_source_offset INT DEFAULT 0;

-- Add search_terms column (renamed from custom_keywords for clarity)
ALTER TABLE kb_scan_jobs ADD COLUMN IF NOT EXISTS search_terms TEXT[];

-- Copy existing data from custom_keywords to search_terms if custom_keywords exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kb_scan_jobs' AND column_name = 'custom_keywords') THEN
    UPDATE kb_scan_jobs SET search_terms = custom_keywords WHERE search_terms IS NULL;
  END IF;
END $$;

-- Add date range columns for filtering research by date
ALTER TABLE kb_scan_jobs ADD COLUMN IF NOT EXISTS date_range_start TEXT;
ALTER TABLE kb_scan_jobs ADD COLUMN IF NOT EXISTS date_range_end TEXT;

-- Add resume_state for pause/resume functionality (stores progress state)
ALTER TABLE kb_scan_jobs ADD COLUMN IF NOT EXISTS resume_state JSONB;

-- Add paused_at timestamp
ALTER TABLE kb_scan_jobs ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;

-- Drop the old status constraint if it exists
ALTER TABLE kb_scan_jobs DROP CONSTRAINT IF EXISTS kb_scan_jobs_status_check;

-- Add new status constraint with all needed values
ALTER TABLE kb_scan_jobs ADD CONSTRAINT kb_scan_jobs_status_check
  CHECK (status IN ('pending', 'queued', 'running', 'completed', 'failed', 'cancelled', 'cancelling', 'paused'));

-- Note: 'pending' and 'queued' are both valid starting states

-- =====================================================
-- 2. FIX kb_research_queue TABLE
-- =====================================================

-- Add relevance_signals column to store the signals that contributed to the score
ALTER TABLE kb_research_queue ADD COLUMN IF NOT EXISTS relevance_signals TEXT[];

-- Add detected_language column for language detection results
ALTER TABLE kb_research_queue ADD COLUMN IF NOT EXISTS detected_language VARCHAR(20);

-- Add comments for documentation
COMMENT ON COLUMN kb_scan_jobs.sources IS 'Array of source identifiers to scan (e.g., pubmed, pmc, openalex)';
COMMENT ON COLUMN kb_scan_jobs.current_source_index IS 'Index of the current source being processed (0-based)';
COMMENT ON COLUMN kb_scan_jobs.current_source_offset IS 'Pagination offset within the current source (resets to 0 for each new source)';
COMMENT ON COLUMN kb_scan_jobs.search_terms IS 'Array of search terms to use for scanning';
COMMENT ON COLUMN kb_scan_jobs.date_range_start IS 'Start date for filtering research (YYYY-MM-DD format)';
COMMENT ON COLUMN kb_scan_jobs.date_range_end IS 'End date for filtering research (YYYY-MM-DD format)';

COMMENT ON COLUMN kb_research_queue.relevance_signals IS 'Signals that contributed to the relevance score';
COMMENT ON COLUMN kb_research_queue.detected_language IS 'Detected language of the research (e.g., english, spanish)';
